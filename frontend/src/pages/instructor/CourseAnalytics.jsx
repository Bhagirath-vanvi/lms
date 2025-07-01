"use client";

import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import { fetchCourse } from "../../store/slices/courseSlice";
import { useGetInstructorAnalyticsQuery } from "../../store/api/apiSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EnrollmentChart from "../../components/charts/EnrollmentChart";
import RevenueChart from "../../components/charts/RevenueChart";

const CourseAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentCourse: course, isLoading: courseLoading } = useSelector(
    (state) => state.courses
  );
  const { user } = useSelector((state) => state.auth);

  const { data: analytics, isLoading: analyticsLoading } =
    useGetInstructorAnalyticsQuery();

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id));
    }
  }, [dispatch, id]);

  // Check if user owns this course
  useEffect(() => {
    if (
      course &&
      course.instructor._id !== user?._id &&
      user?.role !== "admin"
    ) {
      navigate("/instructor/my-courses");
    }
  }, [course, user, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (courseLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const courseStats = {
    totalStudents: course.enrolledStudents?.length || 0,
    totalRevenue: (course.price || 0) * (course.enrolledStudents?.length || 0),
    averageRating: course.rating?.average || 0,
    totalReviews: course.rating?.count || 0,
    completionRate: 75, // This would need to be calculated from actual progress data
    totalLessons: course.lessons?.length || 0,
    totalDuration: course.totalDuration || 0,
  };

  // Generate mock enrollment data for the chart
  const enrollmentData = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    // Mock data - in real app, this would come from backend
    const enrollments = Math.floor(Math.random() * 10) + 1;
    enrollmentData.push({
      month: monthName,
      enrollments: enrollments,
    });
  }

  // Generate mock revenue data
  const revenueData = enrollmentData.map((item) => ({
    month: item.month,
    revenue: item.enrollments * course.price,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate("/instructor/my-courses")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FiArrowLeft className="mr-2" size={20} />
              Back to My Courses
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Course Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {course.title}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/courses/${course._id}`}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FiEye className="mr-2" size={16} />
                View Course
              </Link>
              <Link
                to={`/instructor/courses/${course._id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Edit Course
              </Link>
            </div>
          </div>
        </div>

        {/* Course Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src={course.thumbnail || "/placeholder.svg?height=120&width=200"}
              alt={course.title}
              className="w-48 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    course.isPublished
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-sm font-medium rounded-full">
                  {course.level}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Price:
                  </span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {formatPrice(course.price)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Lessons:
                  </span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {courseStats.totalLessons}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Duration:
                  </span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {formatDuration(courseStats.totalDuration)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {courseStats.totalStudents}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{Math.floor(Math.random() * 5) + 1} this month
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {formatPrice(courseStats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{formatPrice(Math.floor(Math.random() * 5000) + 1000)} this
                  month
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <FiDollarSign className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {courseStats.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {courseStats.totalReviews} reviews
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <FiStar className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {courseStats.completionRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Average completion
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <FiTrendingUp className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enrollment Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Enrollments
            </h3>
            <EnrollmentChart data={enrollmentData} />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Revenue
            </h3>
            <RevenueChart data={revenueData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Enrollments */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Enrollments
            </h3>
            <div className="space-y-4">
              {course.enrolledStudents?.slice(0, 5).map((enrollment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {enrollment.student?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {enrollment.student?.name || "Unknown Student"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enrolled {formatDate(enrollment.enrolledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(course.price)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Revenue
                    </p>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    No enrollments yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Course Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Views
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.floor(Math.random() * 1000) + 100}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(Math.random() * 10 + 5).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Watch Time
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.floor(Math.random() * 30 + 15)}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Drop-off Rate
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(Math.random() * 20 + 10).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FiDownload className="mr-2" size={14} />
                  Export Data
                </button>
                <Link
                  to={`/instructor/courses/${course._id}/edit`}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Edit Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
