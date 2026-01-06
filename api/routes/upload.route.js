import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../middleware/jwt.js";
import createError from "../utils/createError.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files stored in api/uploads/
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`); // UUID + original extension
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
});

// Upload endpoint
router.post("/upload", verifyToken, upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "No file uploaded"));
    }

    // Return file path (can be accessed at /uploads/{filename})
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      secure_url: fileUrl,
      public_id: req.file.filename,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    next(createError(500, err.message));
  }
});

export default router;
