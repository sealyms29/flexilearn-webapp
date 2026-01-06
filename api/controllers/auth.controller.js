import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    console.log("Registration request received:", req.body);
    
    //STUDENT EMAIL VALIDATION
    const studentEmailRegex = /^[0-9]+@siswa\.unimas\.my$/;

    if (!studentEmailRegex.test(req.body.email)) {
      return next(
        createError(
          400,
          "Only UNIMAS student emails (e.g. 123456@siswa.unimas.my) are allowed"
        )
      );
    }

    // Extract student ID from email
    const studentId = req.body.email.split("@")[0];

    // Validate password: 6-8 characters, 1 uppercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,8}$/;
    if (!passwordRegex.test(req.body.password)) {
      return next(createError(400, "Password must be 6-8 characters with ONE uppercase letter, ONE number, and ONE special character (!@#$%^&*)"));
    }
    
    // Enforce UNIMAS student email
    const unimasEmailRegex = /^[0-9]+@siswa\.unimas\.my$/;
    if (!unimasEmailRegex.test(req.body.email)) {
      return next(createError(400, "Only UNIMAS student emails are allowed"));
    }

    // Prevent email being used as username
    if (req.body.username.includes("@")) {
      return next(createError(400, "Username must be a name, not an email"));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username: req.body.username }, { email: req.body.email }] 
    });
    
    if (existingUser) {
      console.log("User already exists");
      return next(createError(400, "Username or email already exists!"));
    }

    const hash = bcrypt.hashSync(req.body.password, 5);
    
    const newUser = new User({
      ...req.body,
      password: hash,
      studentId,
      isStudent: true,
      isVerified: true, // All users automatically verified
    });

    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser);
    
    res.status(201).send("User has been created successfully. You can now log in.");
  } catch (err) {
    console.error("❌ Registration error:", err);
    next(err);
  }
};

// Forgot password endpoint
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(createError(400, "Email is required"));
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).send("If an account exists with that email, a password reset link has been sent.");
    }
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = bcrypt.hashSync(resetToken, 10);
    
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await user.save();
    
    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${email}`;
    
    try {
      await sendPasswordResetEmail(email, resetToken, resetLink);
      res.status(200).send("Password reset link has been sent to your email.");
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      next(createError(500, "Failed to send email"));
    }
  } catch (err) {
    next(err);
  }
};

// Reset password endpoint
export const resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return next(createError(400, "Token, email, and new password are required"));
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    // Check if token is still valid
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return next(createError(400, "Password reset link has expired"));
    }
    
    // Verify token
    const isValidToken = bcrypt.compareSync(token, user.passwordResetToken);
    
    if (!isValidToken) {
      return next(createError(400, "Invalid password reset token"));
    }
    
    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,8}$/;
    if (!passwordRegex.test(newPassword)) {
      return next(createError(400, "Password must be 6-8 characters with ONE uppercase letter, ONE number, and ONE special character"));
    }
    
    // Update password
    user.password = bcrypt.hashSync(newPassword, 5);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    
    await user.save();
    
    res.status(200).send("Password reset successfully. You can now log in with your new password.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return next(createError(404, "User not found!"));
    }
    
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000);
      return next(createError(403, `Account locked. Try again in ${remainingTime} seconds.`));
    } else if (user.lockedUntil && user.lockedUntil <= new Date()) {
      // Unlock account if lock period expired
      user.loginAttempts = 0;
      user.lockedUntil = undefined;
      await user.save();
    }
    
    //Block non-students
    if (!user.isStudent) {
      return next(createError(403, "Access restricted to UNIMAS students only"));
    }

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 10 failed attempts (not 5)
      if (user.loginAttempts >= 10) {
        user.lockedUntil = new Date(Date.now() + 10 * 1000); // 10 seconds
      }
      
      await user.save();
      return next(createError(400, "Wrong password or username!"));
    }
    
    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: false,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send({
        ...info,
        accessToken: token,
      });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: false,
      path: "/",
    })
    .status(200)
    .send("User has been logged out.");
};