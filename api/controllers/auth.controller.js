import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    console.log("Registration request received:", req.body);
    
    // Validate password: 6-8 characters, 1 uppercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,8}$/;
    if (!passwordRegex.test(req.body.password)) {
      return next(createError(400, "Password must be 6-8 characters with ONE uppercase letter, ONE number, and ONE special character (!@#$%^&*)"));
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
    });

    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser);
    res.status(201).send("User has been created.");
  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
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
        accessToken: token, // Return token so frontend can store it
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