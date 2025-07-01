import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all published courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
    } = req.query;

    const query = {};

    if (req.query.instructor) {
      query.instructor = req.query.instructor;
    } else {
      query.isPublished = true; // Only public if not requesting own
    }

    // Add featured filter
    if (featured === "true") {
      query.featured = true;
    }

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

    const featuredCourse = await Course.findOne({
      isPublished: true,
      featured: true,
    })
      .populate("instructor", "name avatar")
      .select("-lessons");

    const courses = await Course.find(query)
      .populate("instructor", "name avatar")
      .populate("lessons")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-lessons"); // Exclude lessons for performance

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      featured: featuredCourse,
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

// @route   GET /api/courses/enrolled
// @desc    Get user's enrolled courses
// @access  Private
router.get("/enrolled", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "enrolledCourses.course",
      populate: {
        path: "instructor",
        select: "name avatar",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const enrolledCourses = user.enrolledCourses.map((enrollment) => {
      const course = enrollment.course.toObject();
      const totalLessons = course.lessons ? course.lessons.length : 0;
      const completedLessons = enrollment.completedLessons
        ? enrollment.completedLessons.length
        : 0;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      const isCompleted = progress >= 100;

      return {
        ...course,
        enrollmentInfo: {
          enrolledAt: enrollment.enrolledAt,
          progress: progress,
          completedLessons: enrollment.completedLessons || [],
          lastAccessed: enrollment.lastAccessed,
          isCompleted,
          completedAt: enrollment.completedAt || null,
        },
      };
    });

    res.json({
      success: true,
      courses: enrolledCourses,
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name avatar bio")
      .populate("reviews.user", "name avatar")
      .populate("enrolledStudents.student", "name avatar ");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If course is not published, only instructor and admin can view
    if (!course.isPublished) {
      if (
        !req.user ||
        (req.user.userId !== course.instructor._id.toString() &&
          req.user.role !== "admin")
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Add enrollment info if user is logged in
    let enrollmentInfo = null;
    if (req.user) {
      const user = await User.findById(req.user.userId);
      const enrollment = user.enrolledCourses.find(
        (enrollment) =>
          enrollment.course._id.toString() === course._id.toString()
      );
      if (enrollment) {
        const totalLessons = course.lessons ? course.lessons.length : 0;
        const completedLessons = enrollment.completedLessons
          ? enrollment.completedLessons.length
          : 0;
        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
        const isCompleted = progress >= 100;

        enrollmentInfo = {
          enrolledAt: enrollment.enrolledAt,
          progress: progress,
          completedLessons: enrollment.completedLessons || [],
          lastAccessed: enrollment.lastAccessed,
          isCompleted,
          completedAt: enrollment.completedAt || null,
        };
      }
    }

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        enrollmentInfo,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor/Admin)
router.post(
  "/",
  [auth, authorize(["instructor", "admin"])],
  async (req, res) => {
    try {
      const {
        title,
        description,
        shortDescription,
        category,
        level,
        price,
        thumbnail,
      } = req.body;

      if (!title || title.trim().length < 5)
        return res.status(400).json({
          success: false,
          message: "Title must be at least 5 characters",
        });
      if (!description || description.trim().length < 20)
        return res.status(400).json({
          success: false,
          message: "Description must be at least 20 characters",
        });
      if (
        !shortDescription ||
        shortDescription.trim().length < 10 ||
        shortDescription.length > 200
      )
        return res.status(400).json({
          success: false,
          message: "Short description must be 10-200 characters",
        });
      const categories = [
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Other",
      ];
      if (!categories.includes(category))
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      const levels = ["Beginner", "Intermediate", "Advanced"];
      if (!levels.includes(level))
        return res
          .status(400)
          .json({ success: false, message: "Invalid level" });
      if (isNaN(price) || price < 0)
        return res.status(400).json({
          success: false,
          message: "Price must be a non-negative number",
        });
      if (!thumbnail || !thumbnail.startsWith("http"))
        return res
          .status(400)
          .json({ success: false, message: "Invalid thumbnail URL" });

      const course = new Course({ ...req.body, instructor: req.user.userId });
      await course.save();

      // Add course to instructor's created courses
      await User.findByIdAndUpdate(req.user.userId, {
        $push: { createdCourses: course._id },
      });

      await course.populate("instructor", "name avatar");

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during course creation",
      });
    }
  }
);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Course Instructor/Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("instructor", "name avatar");

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during course update",
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Course Instructor/Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id },
    });

    // Remove course from all enrolled students
    await User.updateMany(
      { "enrolledCourses.course": course._id },
      { $pull: { enrolledCourses: { course: course._id } } }
    );

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during course deletion",
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private (Student)
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.userId);
    const { paymentId, orderId } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can enroll in courses",
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not published",
      });
    }

    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      (enrollment) => enrollment.course.toString() === course._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Add to user's enrolled courses
    user.enrolledCourses.push({
      course: course._id,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      ...(paymentId && { paymentId }),
      ...(orderId && { orderId }),
    });

    // Add to course's enrolled students
    course.enrolledStudents.push({
      student: user._id,
      enrolledAt: new Date(),
    });

    await user.save();
    await course.save();

    res.json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment: {
        courseId: course._id,
        enrolledAt: new Date(),
        progress: 0,
        paymentId,
        orderId,
      },
    });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during enrollment",
    });
  }
});

// @route   POST /api/courses/:id/unenroll
// @desc    Unenroll from course
// @access  Private (Student)
router.post("/:id/unenroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.userId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if enrolled
    const enrollmentIndex = user.enrolledCourses.findIndex(
      (enrollment) => enrollment.course.toString() === course._id.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      });
    }

    // Remove from user's enrolled courses
    user.enrolledCourses.splice(enrollmentIndex, 1);

    // Remove from course's enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      (student) => student.student.toString() !== user._id.toString()
    );

    await user.save();
    await course.save();

    res.json({
      success: true,
      message: "Successfully unenrolled from course",
    });
  } catch (error) {
    console.error("Unenroll course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during unenrollment",
    });
  }
});

// @route   POST /api/courses/:id/lessons
// @desc    Add lesson to course
// @access  Private (Course Instructor/Admin)
router.post("/:id/lessons", auth, async (req, res) => {
  try {
    const { title, description, videoUrl, duration, resources } = req.body;

    if (!title || title.length < 3)
      return res.status(400).json({
        success: false,
        message: "Lesson title must be at least 3 characters",
      });

    if (!description || description.length < 10)
      return res.status(400).json({
        success: false,
        message: "Lesson description must be at least 10 characters",
      });
    if (!videoUrl || !videoUrl.startsWith("http"))
      return res
        .status(400)
        .json({ success: false, message: "Invalid video URL" });
    if (isNaN(duration) || !Number.isFinite(duration) || duration <= 0)
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      });

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (course.lessons.some((l) => l.title.trim() === title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Lesson title already exists in this course",
      });
    }

    const lesson = {
      ...req.body,
      order: course.lessons.length + 1,
      resources: resources || [],
    };
    course.lessons.push(lesson);

    // Update total duration
    course.totalDuration = course.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );

    await course.save();

    res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      lesson: course.lessons.at(-1).toObject(),
      totalLessons: course.lessons.length,
    });
  } catch (error) {
    console.error("Add lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during lesson creation",
    });
  }
});

// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @desc    Update lesson
// @access  Private (Course Instructor/Admin)
router.put("/:courseId/lessons/:lessonId", auth, async (req, res) => {
  try {
    const { title, description, videoUrl, duration } = req.body;

    // Input validations
    if (title && title.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Lesson title must be at least 3 characters",
      });
    }

    if (description && description.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Lesson description must be at least 10 characters",
      });
    }

    if (videoUrl && !videoUrl.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "Invalid video URL",
      });
    }

    if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      });
    }

    // Fetch course
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Authorization check
    if (
      course.instructor.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find lesson by ID
    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson._id.toString() === req.params.lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Merge and update lesson safely
    const existingLesson = course.lessons[lessonIndex].toObject();
    course.lessons[lessonIndex] = {
      ...existingLesson,
      ...req.body,
      _id: existingLesson._id, // ensure _id remains unchanged
    };

    // Update total course duration
    course.totalDuration = course.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );

    await course.save();

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: course.lessons[lessonIndex],
    });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during lesson update",
    });
  }
});

// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @desc    Delete lesson
// @access  Private (Course Instructor/Admin)
router.delete("/:courseId/lessons/:lessonId", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is course instructor or admin
    if (
      course.instructor.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    course.lessons = course.lessons.filter(
      (lesson) => lesson._id.toString() !== req.params.lessonId
    );

    // Update lesson orders
    course.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    // Update total duration
    course.totalDuration = course.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );

    await course.save();

    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during lesson deletion",
    });
  }
});

// @route   PUT /api/courses/:courseId/lessons/:lessonId/progress
// @desc    Update lesson progress
// @access  Private (Enrolled Student)
router.put("/:courseId/lessons/:lessonId/progress", auth, async (req, res) => {
  try {
    const { completed } = req.body;
    const user = await User.findById(req.user.userId);
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const enrollment = user.enrolledCourses.find(
      (enrollment) => enrollment.course.toString() === req.params.courseId
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course",
      });
    }

    // Update lesson progress
    if (
      completed &&
      !enrollment.completedLessons.includes(req.params.lessonId)
    ) {
      enrollment.completedLessons.push(req.params.lessonId);
    } else if (!completed) {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (lessonId) => lessonId.toString() !== req.params.lessonId
      );
    }

    // Calculate overall progress
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.completedLessons.length;
    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    enrollment.progress = progress;
    enrollment.lastAccessed = new Date();

    // Mark course as completed if progress is 100%
    if (progress >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    } else if (progress < 100 && enrollment.completedAt) {
      enrollment.completedAt = null;
    }

    await user.save();

    // Find the specific lesson to return
    const updatedLesson = course.lessons.find(
      (lesson) => lesson._id.toString() === req.params.lessonId
    );

    res.json({
      success: true,
      message: "Progress updated successfully",
      progress: enrollment.progress,
      isCompleted: progress >= 100,
      completedAt: enrollment.completedAt,
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during progress update",
    });
  }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add review to course
// @access  Private (Enrolled Students)
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment = "" } = req.body;

    if (isNaN(rating) || rating < 1 || rating > 5)
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    if (comment.length > 500)
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters",
      });

    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.userId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const isEnrolled = user.enrolledCourses.some(
      (enrollment) => enrollment.course.toString() === course._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to review this course",
      });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      (review) => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    course.reviews.push({ user: req.user.userId, rating, comment });
    course.updateRating();
    await course.save();

    await course.populate("reviews.user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: course.reviews.at(-1),
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during review creation",
    });
  }
});

export default router;
