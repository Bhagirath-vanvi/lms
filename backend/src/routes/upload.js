import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"), false);
    }
  },
});

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private
router.post("/image", [auth, upload.single("image")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "lms/images",
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
});

// @route   POST /api/upload/video
// @desc    Upload video to Cloudinary
// @access  Private
router.post("/video", [auth, upload.single("video")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "lms/videos",
            transformation: [{ quality: "auto" }, { format: "mp4" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    res.json({
      success: true,
      message: "Video uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({
      success: false,
      message: "Video upload failed",
      error: error.message,
    });
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete file from Cloudinary
// @access  Private
router.delete("/:publicId", auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "image" } = req.query;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error) {
    console.error("File delete error:", error);
    res.status(500).json({
      success: false,
      message: "File deletion failed",
      error: error.message,
    });
  }
});

export default router;
