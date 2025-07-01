import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get("/", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("enrolledCourses.course", "title thumbnail")
      .populate("createdCourses", "title thumbnail enrolledStudents")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("enrolledCourses.course", "title thumbnail price instructor")
      .populate(
        "createdCourses",
        "title thumbnail price enrolledStudents rating"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only allow users to view their own profile or admin to view any profile
    if (req.user.userId !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put("/:id/role", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put("/:id/status", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete("/:id", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting admin users
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
