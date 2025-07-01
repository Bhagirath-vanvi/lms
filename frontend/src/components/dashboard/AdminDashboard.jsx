"use client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiTrendingUp,
  FiUserPlus,
  FiSettings,
} from "react-icons/fi";
import { useGetAdminAnalyticsQuery } from "../../store/api/apiSlice";
import LoadingSpinner from "../common/LoadingSpinner";
import AdminChart from "../charts/AdminChart";
import CategoryDistribution from "../charts/CategoryDistribution";
import { useState } from "react";

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useGetAdminAnalyticsQuery();
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'courses'

  const stats = [
    {
      title: "Total Users",
      value: analytics?.analytics?.overview?.totalUsers || 0,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-500",
      change: `${analytics?.analytics?.overview?.totalStudents || 0} students`,
    },
    {
      title: "Total Courses",
      value: analytics?.analytics?.overview?.totalCourses || 0,
      icon: <FiBookOpen className="text-2xl" />,
      color: "bg-green-500",
      change: `${
        analytics?.analytics?.overview?.publishedCourses || 0
      } published`,
    },
    {
      title: "Total Revenue",
      value: `₹${analytics?.analytics?.overview?.totalRevenue || 0}`,
      icon: <FiDollarSign className="text-2xl" />,
      color: "bg-yellow-500",
      change: "This month",
    },
    {
      title: "Total Enrollments",
      value: analytics?.analytics?.overview?.totalEnrollments || 0,
      icon: <FiTrendingUp className="text-2xl" />,
      color: "bg-purple-500",
      change: "All time",
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Platform overview and management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiUserPlus className="mr-2" />
            Manage Users
          </Link>
          {/* <Link
            to="/admin/settings"
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FiSettings className="mr-2" />
            Settings
          </Link> */}
        </div>
      </div>

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
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Platform Growth
            </h2>
            <AdminChart data={analytics?.analytics?.userGrowthData || []} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top Instructors
            </h2>
            <div className="space-y-4">
              {analytics?.analytics?.topInstructors
                ?.slice(0, 5)
                .map((instructor, index) => (
                  <motion.div
                    key={instructor.instructor}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          {instructor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {instructor.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {instructor.totalCourses} courses
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {instructor.totalEnrollments} students
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ₹{instructor.totalRevenue}
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

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiUsers className="mr-3" />
                Manage Users
              </Link>
              <Link
                to="/admin/courses"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiBookOpen className="mr-3" />
                Manage Courses
              </Link>
              <Link
                to="/admin/reports"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiTrendingUp className="mr-3" />
                View Reports
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Course Categories
            </h3>
            <CategoryDistribution
              data={analytics?.analytics?.categoryDistribution || []}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              {["users", "courses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {tab === "users" ? "Users Joined" : "Courses Created"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {activeTab === "users" &&
                analytics?.analytics?.recentActivity?.users?.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <FiUserPlus
                        className="text-green-600 dark:text-green-400"
                        size={14}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name} registered
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              {activeTab === "courses" &&
                analytics?.analytics?.recentActivity?.courses?.map((course) => (
                  <div key={course._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <FiBookOpen
                        className="text-blue-600 dark:text-blue-400"
                        size={14}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.title} published
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(course.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
