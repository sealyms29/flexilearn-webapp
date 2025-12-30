import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  // Try to get token from cookies first
  let token = req.cookies.accessToken;
  console.log("Token from cookies:", token ? "exists" : "missing");
  
  // If not in cookies, try Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader ? "exists" : "missing");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // Remove "Bearer " prefix
      console.log("Token from header: extracted");
    }
  }

  if (!token) {
    console.log("No token found - authentication failed");
    return next(createError(401, "You are not authenticated!"));
  }

  console.log("Verifying token with JWT_KEY...");
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return next(createError(403, "Token is not valid!"));
    }
    console.log("Token verified successfully. User ID:", payload.id);
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    next();
  });
};