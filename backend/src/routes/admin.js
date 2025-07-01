import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get("/dashboard", [auth, authorize(["admin"])], async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const studentCount = await User.countDocuments({ role: "student" });
    const instructorCount = await User.countDocuments({ role: "instructor" });
    const adminCount = await User.countDocuments({ role: "admin" });

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const draftCourses = await Course.countDocuments({ isPublished: false });

    // Get enrollment statistics
    const courses = await Course.find().populate("enrolledStudents.student");
    const totalEnrollments = courses.reduce(
      (total, course) => total + course.enrolledStudents.length,
      0
    );

    // Calculate revenue
    const totalRevenue = courses.reduce(
      (total, course) => total + course.price * course.enrolledStudents.length,
      0
    );

    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentCourses = await Course.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get top categories
    const categoryStats = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get monthly enrollment data for charts
    const monthlyEnrollments = await Course.aggregate([
      { $unwind: "$enrolledStudents" },
      {
        $group: {
          _id: {
            year: { $year: "$enrolledStudents.enrolledAt" },
            month: { $month: "$enrolledStudents.enrolledAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          students: studentCount,
          instructors: instructorCount,
          admins: adminCount,
          recent: recentUsers,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
          recent: recentCourses,
        },
        enrollments: {
          total: totalEnrollments,
          monthly: monthlyEnrollments,
        },
        revenue: {
          total: totalRevenue,
        },
        categories: categoryStats,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/admin/courses
// @desc    Get all courses
// @access  Private (Admin)
router.get("/courses", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Add filters
    if (category && category !== "all") {
      query.category = category;
    }
    if (level && level !== "all") {
      query.level = level;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const courses = await Course.find(query)
      .populate("instructor", "name avatar")
      .populate("lessons")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/admin/users/stats
// @desc    Get detailed user statistics
// @access  Private (Admin)
router.get("/users/stats", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
        },
      },
    ]);

    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        roleStats: userStats,
        monthlyRegistrations,
      },
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/admin/courses/stats
// @desc    Get detailed course statistics
// @access  Private (Admin)
router.get("/courses/stats", [auth, authorize(["admin"])], async (req, res) => {
  try {
    const courseStats = await Course.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          published: { $sum: { $cond: ["$isPublished", 1, 0] } },
          totalEnrollments: { $sum: { $size: "$enrolledStudents" } },
          totalRevenue: {
            $sum: { $multiply: ["$price", { $size: "$enrolledStudents" }] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const levelStats = await Course.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating.average" },
        },
      },
    ]);

    const topCoursesRaw = await Course.find({ isPublished: true })
      .sort({ enrolledStudents: -1 })
      .limit(10)
      .populate("instructor", "name")
      .select("title instructor enrolledStudents rating price")
      .lean();

    // Add revenue
    const topCourses = topCoursesRaw.map((course) => ({
      ...course,
      revenue: course.price * course.enrolledStudents.length,
    }));

    res.json({
      success: true,
      data: {
        categoryStats: courseStats,
        levelStats,
        topCourses,
      },
    });
  } catch (error) {
    console.error("Course stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/admin/courses/:id/feature
// @desc    Feature/unfeature a course
// @access  Private (Admin)
router.post(
  "/courses/:id/feature",
  [auth, authorize(["admin"])],
  async (req, res) => {
    try {
      const { featured } = req.body;

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { featured: featured },
        { new: true }
      ).populate("instructor", "name avatar");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.json({
        success: true,
        message: `Course ${featured ? "featured" : "unfeatured"} successfully`,
        course,
      });
    } catch (error) {
      console.error("Feature course error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/admin/recent-activities
// @desc    Get recent platform activities
// @access  Private (Admin)
router.get(
  "/recent-activities",
  [auth, authorize(["admin"])],
  async (req, res) => {
    try {
      const limit = Number.parseInt(req.query.limit) || 20;

      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select("name email role createdAt");

      // Get recent course creations
      const recentCourses = await Course.find()
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .populate("instructor", "name")
        .select("title instructor createdAt isPublished");

      // Combine and sort activities
      const activities = [
        ...recentUsers.map((user) => ({
          type: "user_registered",
          data: user,
          timestamp: user.createdAt,
        })),
        ...recentCourses.map((course) => ({
          type: "course_created",
          data: course,
          timestamp: course.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({
        success: true,
        activities: activities.slice(0, limit),
      });
    } catch (error) {
      console.error("Recent activities error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
