import express  from "express";
const app = express();
import userRoute from "./routes/user.route.js";
import mongoose from "mongoose";
import helmet from "helmet";

import authRoute from "./routes/auth.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRoute from "./routes/admin.route.js";
import { sanitizeInput, handleValidationErrors, preventNoSQLInjection } from "./middleware/sanitize.js";
import { apiLimiter, authLimiter, passwordResetLimiter } from "./middleware/rateLimiter.js";

mongoose.set("strictQuery", true)

import dotenv from "dotenv";
dotenv.config();

const connect = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URL); // Add this log to verify what the app sees
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB Connection Successful");
  } catch (error) {
    console.log("Connection Error Details:", error);
  }
};

// 2- after writing login axios concept in Login.jsx =>to connect frontend server to backend use this and before use instal yarn add cors in api section 
app.use(cors({origin:["http://localhost:5173", "http://localhost:5174", "https://flexilearn-web.onrender.com"], credentials:true}));
// we are sending cookies from frontend to backend so credential true is needed

// Security middleware
app.use(helmet()); // Add security headers
app.use(express.json());
app.use(cookieParser());

// Input validation and sanitization
app.use(preventNoSQLInjection); // Prevent NoSQL injection
app.use(apiLimiter); // General rate limiting

app.use(express.json());
app.use(cookieParser());

 
// Auth routes with strict rate limiting
app.use("/api/auth", authLimiter, sanitizeInput, handleValidationErrors, authRoute);
app.use("/api/users",userRoute);
app.use("/api/gigs",gigRoute);
app.use("/api/orders",orderRoute);
app.use("/api/conversations",conversationRoute);
app.use("/api/messages",messageRoute);
app.use("/api/reviews",reviewRoute);
app.use("/api/admin", adminRoute);

// middleware for error 
app.use((err,req,res,next)=>{
  console.error("Error message:", err.message);
  const errorStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong"

  return res.status(errorStatus).send(errMessage);
});


app.listen(8800, ()=>{
    connect();
    console.log("Backend Server is running at 8800 ")
}) 