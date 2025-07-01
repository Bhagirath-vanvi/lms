import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FiBookOpen,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiPlay,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { useGetStudentAnalyticsQuery } from "../../store/api/apiSlice";
import LoadingSpinner from "../common/LoadingSpinner";
import ProgressChart from "../charts/ProgressChart";
import CategoryChart from "../charts/CategoryChart";

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const { data: analytics, isLoading, error } = useGetStudentAnalyticsQuery();

  const stats = [
    {
      title: "Enrolled Courses",
      value: analytics?.analytics?.overview?.totalCourses || 0,
      icon: <FiBookOpen className="text-2xl" />,
      color: "bg-blue-500",
      change: `+${
        analytics?.analytics?.changeStats.enrolledThisMonth || 0
      } this month`,
    },
    {
      title: "Completed Courses",
      value: analytics?.analytics?.overview?.completedCourses || 0,
      icon: <FiAward className="text-2xl" />,
      color: "bg-green-500",
      change: `+${
        analytics?.analytics?.changeStats.completedThisMonth || 0
      } this month`,
    },
    {
      title: "In Progress",
      value: analytics?.analytics?.overview?.inProgressCourses || 0,
      icon: <FiTrendingUp className="text-2xl" />,
      color: "bg-yellow-500",
      change: "Live",
    },
    {
      title: "Total Spent",
      value: `₹${analytics?.analytics?.overview?.totalSpent || 0}`,
      icon: <FiDollarSign className="text-2xl" />,
      color: "bg-purple-500",
      change: `+₹${
        analytics?.analytics?.changeStats.spentThisWeek || 0
      } this week`,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Continue your learning journey
        </p>
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
          {/* Continue Learning */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Continue Learning
              </h2>
              <Link
                to="/courses"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {analytics?.analytics?.recentCourses
                ?.slice(0, 3)
                .map((course, index) => {
                  const isCompleted = course.progress >= 100;

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div
                        className={`w-12 h-12 ${
                          isCompleted
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-blue-100 dark:bg-blue-900/20"
                        } rounded-lg flex items-center justify-center`}
                      >
                        {isCompleted ? (
                          <FiAward className="text-green-600 dark:text-green-400" />
                        ) : (
                          <FiPlay className="text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"></div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </h3>
                        {isCompleted && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                            Completed
                          </span>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {course.instructor}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`${
                                isCompleted ? "bg-green-600" : "bg-blue-600"
                              } h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {isCompleted
                              ? "Course completed!"
                              : `${course.progress}% complete`}
                          </p>
                        </div>
                      </div>
                      {/* Dynamic button based on completion status */}

                      {isCompleted ? (
                        <div className="flex gap-2">
                          <Link
                            to={`/courses/${course.id}/certificate`}
                            className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-1"
                          >
                            <FiAward className="w-4 h-4" />
                            Certificate
                          </Link>
                          <Link
                            to={`/courses/${course.id}`}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            Review
                          </Link>
                        </div>
                      ) : (
                        <Link
                          to={`/courses/${course.id}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Continue
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Learning Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Learning Progress
            </h2>
            <ProgressChart data={analytics?.analytics?.progressData || []} />
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
                to="/courses"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiBookOpen className="mr-3" />
                Browse Courses
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <FiCalendar className="mr-3" />
                My Schedule
              </Link>
            </div>
          </div>

          {/* Course Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Learning Categories
            </h3>
            <CategoryChart data={analytics?.analytics?.categoryData || []} />
          </div>

          {/* Recent Courses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Courses
            </h3>
            <div className="space-y-4">
              {analytics?.analytics?.recentCourses?.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {course.instructor}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last accessed:{" "}
                      {new Date(course.lastAccessed).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
