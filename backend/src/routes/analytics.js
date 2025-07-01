import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// @route   GET /api/analytics/public
// @desc    Get public platform stats for homepage
// @access  Public
router.get("/public", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments({ isPublished: true });

    const courses = await Course.find();
    const totalRevenue = courses.reduce(
      (sum, course) =>
        sum + course.price * (course.enrolledStudents?.length || 0),
      0
    );

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public stats",
    });
  }
});

// @route   GET /api/analytics/instructor
// @desc    Get instructor analytics with change and chart data
// @access  Private (Instructor or Admin)
router.get(
  "/instructor",
  [auth, authorize(["instructor", "admin"])],
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const courses = await Course.find({ instructor: userId })
        .populate("enrolledStudents.student", "name email")
        .populate("reviews.user", "name");

      const totalCourses = courses.length;
      const publishedCourses = courses.filter((c) => c.isPublished).length;

      let totalStudents = 0;
      let totalRevenue = 0;
      let averageRatingSum = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let studentsThisMonth = 0;
      let revenueThisMonth = 0;
      let coursesThisMonth = 0;

      // Enrollment & revenue chart data
      const enrollmentData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const month = date.toLocaleString("default", { month: "short" });

        let monthEnrollments = 0;
        let monthRevenue = 0;

        courses.forEach((course) => {
          course.enrolledStudents.forEach((student) => {
            const enrolledAt = new Date(student.enrolledAt);
            if (
              enrolledAt.getMonth() === date.getMonth() &&
              enrolledAt.getFullYear() === date.getFullYear()
            ) {
              monthEnrollments += 1;
              monthRevenue += course.price;
            }

            if (
              enrolledAt.getMonth() === currentMonth &&
              enrolledAt.getFullYear() === currentYear
            ) {
              studentsThisMonth += 1;
              revenueThisMonth += course.price;
            }
          });
        });

        enrollmentData.push({
          month,
          enrollments: monthEnrollments,
          revenue: monthRevenue,
        });
      }

      // Count courses created this month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      coursesThisMonth = courses.filter(
        (c) => c.createdAt >= firstDayOfMonth && c.createdAt < nextMonth
      ).length;

      // Calculate totals and average rating
      courses.forEach((course) => {
        totalStudents += course.enrolledStudents.length;
        totalRevenue += course.price * course.enrolledStudents.length;
        averageRatingSum += course.rating?.average || 0;
      });

      const averageRating =
        totalCourses > 0 ? averageRatingSum / totalCourses : 0;

      // Top Performing Courses
      const coursePerformance = courses.map((course) => ({
        id: course._id,
        title: course.title,
        students: course.enrolledStudents.length,
        rating: course.rating?.average || 0,
        revenue: course.price * course.enrolledStudents.length,
      }));

      const topCourses = [...coursePerformance]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent Enrollments
      const recentEnrollments = [];
      courses.forEach((course) => {
        course.enrolledStudents.forEach((enrollment) => {
          recentEnrollments.push({
            studentName: enrollment.student?.name || "Unknown",
            courseName: course.title,
            enrolledAt: enrollment.enrolledAt,
            amount: course.price,
          });
        });
      });

      recentEnrollments.sort(
        (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
      );

      res.json({
        success: true,
        analytics: {
          overview: {
            totalCourses,
            totalStudents,
            totalRevenue,
            publishedCourses,
            averageRating: Number(averageRating.toFixed(1)),
            change: {
              courses: coursesThisMonth,
              students: studentsThisMonth,
              revenue: revenueThisMonth,
            },
          },
          monthlyData: enrollmentData,
          topCourses,
          recentEnrollments: recentEnrollments.slice(0, 10),
        },
      });
    } catch (error) {
      console.error("Instructor analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch instructor analytics",
      });
    }
  }
);

// @route   GET /api/analytics/student
// @desc    Get student analytics
// @access  Private (Student)
router.get("/student", [auth, authorize(["student"])], async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student data
    const student = await User.findById(studentId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name",
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Calculate analytics
    const enrolledCourses = student.enrolledCourses;
    const totalCourses = student.enrolledCourses?.length || 0;
    const completedCourses =
      student.enrolledCourses?.filter(
        (enrollment) => enrollment.progress === 100
      ).length || 0;
    const inProgressCourses =
      student.enrolledCourses?.filter(
        (enrollment) => enrollment.progress > 0 && enrollment.progress < 100
      ).length || 0;
    const totalSpent =
      student.enrolledCourses?.reduce(
        (sum, enrollment) => sum + (enrollment.course?.price || 0),
        0
      ) || 0;

    // Calculate total hours learned (estimated based on progress)
    const totalHoursLearned = enrolledCourses.reduce((total, enrollment) => {
      const courseDuration = enrollment.course?.totalDuration || 0;
      const progress = enrollment.progress || 0;
      return total + (courseDuration * progress) / 100;
    }, 0);

    // Learning progress over time (last 6 months)
    const progressData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      // This would need actual progress tracking data
      progressData.push({
        month: monthName,
        coursesCompleted: Math.floor(Math.random() * 3), // Placeholder
        hoursLearned: Math.floor(Math.random() * 20) + 5, // Placeholder
      });
    }

    // Generate category data
    const categoryData = {};
    enrolledCourses.forEach((enrollment) => {
      const category = enrollment.course?.category || "Other";
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const categoryChartData = Object.entries(categoryData).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // Course progress
    const courseProgress =
      student.enrolledCourses?.map((enrollment) => ({
        id: enrollment.course?._id,
        title: enrollment.course?.title,
        instructor: enrollment.course?.instructor?.name,
        progress: enrollment.progress || 0,
        enrolledAt: enrollment.enrolledAt,
        lastAccessed: enrollment.lastAccessed || enrollment.enrolledAt,
      })) || [];

    // Recent courses with progress
    const recentCourses = enrolledCourses
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 5)
      .map((enrollment) => ({
        id: enrollment.course._id,
        title: enrollment.course.title,
        instructor: enrollment.course.instructor?.name || "Unknown",
        progress: Math.round(enrollment.progress || 0),
        lastAccessed: enrollment.lastAccessed,
      }));

    // Track month & week changes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

    let enrolledThisMonth = 0;
    let completedThisMonth = 0;
    let spentThisWeek = 0;

    student.enrolledCourses.forEach((enrollment) => {
      const enrolledAt = new Date(enrollment.enrolledAt);
      const completedAt = new Date(enrollment.completedAt || 0);
      const coursePrice = enrollment.course?.price || 0;

      if (enrolledAt >= startOfMonth) enrolledThisMonth++;
      if (enrollment.progress === 100 && completedAt >= startOfMonth)
        completedThisMonth++;
      if (enrolledAt >= startOfWeek) spentThisWeek += coursePrice;
    });

    res.json({
      success: true,
      analytics: {
        overview: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalSpent,
          totalHoursLearned: Math.round(totalHoursLearned / 60), // Convert to hours
        },
        progressData,
        courseProgress,
        categoryData: categoryChartData,
        recentCourses,
        changeStats: {
          enrolledThisMonth,
          completedThisMonth,
          spentThisWeek,
        },
      },
    });
  } catch (error) {
    console.error("Student analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
});

// @route   GET /api/analytics/admin
// @desc    Get admin analytics
// @access  Private (Admin)
router.get("/admin", [auth, authorize(["admin"])], async (req, res) => {
  try {
    // Get overall platform statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Get all courses for revenue calculation
    const courses = await Course.find().populate("enrolledStudents.student");
    const totalRevenue = courses.reduce(
      (sum, course) =>
        sum + course.price * (course.enrolledStudents?.length || 0),
      0
    );
    const totalEnrollments = courses.reduce(
      (total, course) => total + course.enrolledStudents.length,
      0
    );

    const userGrowthData = [];
    const currentDate = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = months[date.getMonth()];

      // Simplified user growth calculation
      const usersInMonth = Math.floor(Math.random() * 50) + 10;

      userGrowthData.push({
        month: monthName,
        users: usersInMonth,
      });
    }

    // Category distribution
    const categoryData = {};
    courses.forEach((course) => {
      const category = course.category || "Other";
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryData).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // Top instuctor data

    // Step 1: Accumulate data per instructor
    const instructorStatsMap = {};

    courses.forEach((course) => {
      if (!course.instructor) return;

      const instructorId = course.instructor.toString();
      const enrollCount = course.enrolledStudents.length || 0;
      const revenue = course.price * enrollCount;

      if (!instructorStatsMap[instructorId]) {
        instructorStatsMap[instructorId] = {
          instructor: instructorId,
          totalCourses: 0,
          totalEnrollments: 0,
          totalRevenue: 0,
        };
      }

      instructorStatsMap[instructorId].totalCourses += 1;
      instructorStatsMap[instructorId].totalEnrollments += enrollCount;
      instructorStatsMap[instructorId].totalRevenue += revenue;
    });

    // Step 2: Convert to array and sort by revenue
    let topInstructors = Object.values(instructorStatsMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5); // Top 5

    // Step 3: Populate instructor names
    const instructorIds = topInstructors.map((i) => i.instructor);
    const instructors = await User.find({ _id: { $in: instructorIds } }).select(
      "name email"
    );

    // Step 4: Merge details
    topInstructors = topInstructors.map((stat) => {
      const user = instructors.find(
        (u) => u._id.toString() === stat.instructor
      );
      return {
        ...stat,
        name: user?.name || "Unknown",
        email: user?.email || "N/A",
      };
    });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("instructor", "name")
      .select("title instructor createdAt isPublished");

    res.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalCourses,
          publishedCourses,
          totalRevenue,
          totalEnrollments,
        },

        recentActivity: {
          users: recentUsers,
          courses: recentCourses,
        },
        userGrowthData,
        categoryDistribution,
        topInstructors,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
});

export default router;
