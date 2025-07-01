import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import Course from "../models/Course.js"; // 👈 important!

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    // Manual validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account is deactivated" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("enrolledCourses.course", "title thumbnail price")
      .populate("createdCourses", "title thumbnail price enrolledStudents");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};

    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }
    if (bio && bio.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: "Bio cannot exceed 500 characters" });
    }

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during profile update" });
  }
});

export default router;
