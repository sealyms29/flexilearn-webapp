import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (email, verificationToken, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@flexilearn.com",
      to: email,
      subject: "Verify Your FlexiLearn Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Email Verification Required</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Welcome to FlexiLearn!</p>
            
            <p>Thank you for registering. To complete your account setup, please verify your email address by clicking the link below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px;">${verificationLink}</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 24 hours.<br/>
              If you didn't create this account, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 FlexiLearn. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@flexilearn.com",
      to: email,
      subject: "Reset Your FlexiLearn Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>We received a request to reset your FlexiLearn password.</p>
            
            <p>Click the link below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
            <p style="color: #667eea; word-break: break-all; font-size: 12px;">${resetLink}</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your account will remain secure.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              For security reasons, do not share this link with anyone.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 FlexiLearn. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@flexilearn.com",
      to: email,
      subject: "Welcome to FlexiLearn!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Welcome to FlexiLearn!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>Your email has been verified! Your FlexiLearn account is now fully activated.</p>
            
            <p>You can now:</p>
            <ul style="color: #555;">
              <li>Browse services by category</li>
              <li>Hire freelancers for your projects</li>
              <li>Become a seller and offer your services</li>
              <li>Track your transactions</li>
              <li>Message with other users</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://flexilearn.onrender.com" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Go to FlexiLearn
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you have any questions, feel free to contact our support team.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 FlexiLearn. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - email failure shouldn't block account creation
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
