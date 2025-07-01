"use client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiPlus,
  FiEye,
} from "react-icons/fi";
import { useGetInstructorAnalyticsQuery } from "../../store/api/apiSlice";
import LoadingSpinner from "../common/LoadingSpinner";
import RevenueChart from "../charts/RevenueChart";
import EnrollmentChart from "../charts/EnrollmentChart";

const InstructorDashboard = () => {
  const { data: analytics, isLoading } = useGetInstructorAnalyticsQuery();

  const stats = [
    {
      title: "Total Courses",
      value: analytics?.analytics?.overview?.totalCourses || 0,
      icon: <FiBookOpen className="text-2xl" />,
      color: "bg-blue-500",
      change: `+${analytics?.overview?.change?.courses || 0} this month`,
    },
    {
      title: "Total Students",
      value: analytics?.analytics?.overview?.totalStudents || 0,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-green-500",
      change: `+${
        analytics?.analytics?.overview?.change?.students || 0
      } this month`,
    },
    {
      title: "Total Revenue",
      value: `₹${analytics?.analytics?.overview?.totalRevenue || 0}`,
      icon: <FiDollarSign className="text-2xl" />,
      color: "bg-yellow-500",
      change: `+₹${
        analytics?.analytics?.overview?.change?.revenue || 0
      } this month`,
    },
    {
      title: "Average Rating",
      value: analytics?.analytics?.overview?.averageRating || 0,
      icon: <FiStar className="text-2xl" />,
      color: "bg-purple-500",
      change: `${(analytics?.analytics?.overview?.averageRating || 0).toFixed(
        1
      )}/5.0`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your courses and track your success
          </p>
        </div>
        <Link
          to="/instructor/create-course"
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiPlus className="mr-2" />
          Create Course
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Revenue Overview
            </h2>
            <RevenueChart data={analytics?.analytics?.monthlyData || []} />
          </div>

          {/* Top Performing Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Top Performing Courses
              </h2>
              <Link
                to="/instructor/my-courses"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {analytics?.analytics?.topCourses
                ?.slice(0, 5)
                .map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {course.students} students
                          </span>
                          <div className="flex items-center">
                            <FiStar
                              className="text-yellow-400 fill-current mr-1"
                              size={14}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {course.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{course.revenue}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Revenue
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/instructor/create-course"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiPlus className="mr-3" />
                Create New Course
              </Link>
              <Link
                to="/instructor/my-courses"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiEye className="mr-3" />
                View My Courses
              </Link>
            </div>
          </div>

          {/* Enrollment Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enrollment Trends
            </h3>
            <EnrollmentChart data={analytics?.analytics?.monthlyData || []} />
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Enrollments
            </h3>
            <div className="space-y-3">
              {analytics?.analytics?.recentEnrollments
                ?.slice(0, 5)
                .map((enrollment, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <FiUsers
                        className="text-green-600 dark:text-green-400"
                        size={14}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {enrollment.studentName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {enrollment.courseName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
