import { body, validationResult, query, param } from "express-validator";
import createError from "../utils/createError.js";

// Sanitization middleware to prevent XSS and injection attacks
export const sanitizeInput = [
  // Sanitize body fields
  body("*").trim().escape(),
  
  // Custom validation for specific fields
  body("username")
    .if(body("username").exists())
    .matches(/^[a-zA-Z0-9_-]{3,30}$/)
    .withMessage("Username must be 3-30 characters, alphanumeric, underscore, or hyphen only"),
  
  body("email")
    .if(body("email").exists())
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email format"),
  
  body("password")
    .if(body("password").exists())
    .isLength({ min: 6, max: 8 })
    .withMessage("Password must be 6-8 characters")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage("Password must contain uppercase, number, and special character"),
  
  body("title")
    .if(body("title").exists())
    .isLength({ max: 200 })
    .withMessage("Title must be less than 200 characters"),
  
  body("desc")
    .if(body("desc").exists())
    .isLength({ max: 5000 })
    .withMessage("Description must be less than 5000 characters"),
  
  body("price")
    .if(body("price").exists())
    .isFloat({ min: 0, max: 99999 })
    .withMessage("Price must be a valid number"),
  
  // Sanitize query parameters
  query("*").trim().escape(),
  
  // Sanitize route parameters
  param("*").trim().escape(),
];

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return res.status(400).json({
      status: "error",
      message: "Invalid input data",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Prevent NoSQL injection
export const preventNoSQLInjection = (req, res, next) => {
  const checkObj = (obj) => {
    for (let key in obj) {
      if (/^\$/.test(key)) {
        return true; // MongoDB operator detected
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (checkObj(obj[key])) return true;
      }
    }
    return false;
  };

  if (checkObj(req.body) || checkObj(req.query)) {
    return next(createError(400, "Invalid input: potential NoSQL injection detected"));
  }

  next();
};

// Rate limiting configuration
export const createRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const rateLimit = require("express-rate-limit");
  
  return rateLimit({
    windowMs: windowMs, // 15 minutes
    max: maxRequests, // limit each IP to maxRequests requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for non-sensitive endpoints
      return req.path === "/api/gigs" || req.path === "/api/users/profile";
    },
  });
};

export default sanitizeInput;
