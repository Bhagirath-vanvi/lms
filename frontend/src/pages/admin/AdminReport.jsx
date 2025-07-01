import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiTrendingUp,
  FiUserPlus,
  FiActivity,
  FiBarChart2,
  FiPieChart,
} from "react-icons/fi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AdminChart from "../../components/charts/AdminChart";
import CategoryChart from "../../components/charts/CategoryChart";
import CategoryDistribution from "../../components/charts/CategoryDistribution";
import EnrollmentChart from "../../components/charts/EnrollmentChart";
import RevenueChart from "../../components/charts/RevenueChart";

const AdminReports = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllReportsData();
  }, []);

  const fetchAllReportsData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all required data in parallel
      const [
        dashboardResponse,
        userStatsResponse,
        courseStatsResponse,
        adminAnalyticsResponse,
        recentActivitiesResponse,
      ] = await Promise.all([
        axios.get("/admin/dashboard", { headers }),
        axios.get("/admin/users/stats", { headers }),
        axios.get("/admin/courses/stats", { headers }),
        axios.get("/analytics/admin", { headers }),
        axios.get("/admin/recent-activities?limit=10", { headers }),
      ]);

      setDashboardData(dashboardResponse.data.data);
      setUserStats(userStatsResponse.data.data);
      setCourseStats(courseStatsResponse.data.data);
      setAdminAnalytics(adminAnalyticsResponse.data.analytics);
      setRecentActivities(recentActivitiesResponse.data.activities);
    } catch (error) {
      console.error("Error fetching reports data:", error);
      toast.error("Failed to fetch reports data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FiBarChart2 },
    { id: "users", label: "Users", icon: FiUsers },
    { id: "courses", label: "Courses", icon: FiBookOpen },
    { id: "revenue", label: "Revenue", icon: FiDollarSign },
    { id: "activities", label: "Activities", icon: FiActivity },
  ];

  const overviewStats = [
    {
      title: "Total Users",
      value: dashboardData?.users?.total || 0,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-500",
      change: `${dashboardData?.users?.students || 0} students`,
    },
    {
      title: "Total Courses",
      value: dashboardData?.courses?.total || 0,
      icon: <FiBookOpen className="text-2xl" />,
      color: "bg-green-500",
      change: `${dashboardData?.courses?.published || 0} published`,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData?.revenue?.total || 0),
      icon: <FiDollarSign className="text-2xl" />,
      color: "bg-yellow-500",
      change: "All time",
    },
    {
      title: "Total Enrollments",
      value: dashboardData?.enrollments?.total || 0,
      icon: <FiTrendingUp className="text-2xl" />,
      color: "bg-purple-500",
      change: "All time",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive platform analytics and insights
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((stat, index) => (
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                User Growth Trend
              </h3>
              {adminAnalytics?.userGrowthData && (
                <AdminChart data={adminAnalytics.userGrowthData} />
              )}
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Course Categories
              </h3>
              {adminAnalytics?.categoryDistribution && (
                <CategoryChart data={adminAnalytics.categoryDistribution} />
              )}
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-8">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Students",
                value: dashboardData?.users?.students || 0,
                color: "text-blue-600 dark:text-blue-400",
                description: "Active learners on platform",
                icon: <FiUsers className="text-2xl" />,
                bgColor: "bg-blue-500",
              },
              {
                title: "Instructors",
                value: dashboardData?.users?.instructors || 0,
                color: "text-green-600 dark:text-green-400",
                description: "Content creators",
                icon: <FiBookOpen className="text-2xl" />,
                bgColor: "bg-green-500",
              },
              {
                title: "Active Users",
                value: dashboardData?.users?.active || 0,
                color: "text-purple-600 dark:text-purple-400",
                description: "Currently active",
                icon: <FiActivity className="text-2xl" />,
                bgColor: "bg-purple-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* User Role Distribution */}
          {userStats?.roleStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                User Role Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userStats.roleStats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.count}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {stat._id}s
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {stat.active} active
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Monthly Registrations */}
          {userStats?.monthlyRegistrations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Monthly User Registrations
              </h3>
              <EnrollmentChart
                data={userStats.monthlyRegistrations.map((item) => ({
                  month: `${item._id.month}/${item._id.year}`,
                  enrollments: item.count,
                }))}
              />
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-8">
          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Published Courses",
                value: dashboardData?.courses?.published || 0,
                color: "text-green-600 dark:text-green-400",
                description: "Live on platform",
                icon: <FiBookOpen className="text-2xl" />,
                bgColor: "bg-green-500",
              },
              {
                title: "Draft Courses",
                value: dashboardData?.courses?.draft || 0,
                color: "text-yellow-600 dark:text-yellow-400",
                description: "In development",
                icon: <FiBookOpen className="text-2xl" />,
                bgColor: "bg-yellow-500",
              },
              {
                title: "Recent Courses",
                value: dashboardData?.courses?.recent || 0,
                color: "text-blue-600 dark:text-blue-400",
                description: "Last 30 days",
                icon: <FiTrendingUp className="text-2xl" />,
                bgColor: "bg-blue-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category Statistics */}
          {courseStats?.categoryStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Course Categories Performance
              </h3>
              <CategoryDistribution
                data={courseStats.categoryStats.map((stat) => ({
                  category: stat._id,
                  count: stat.count,
                }))}
              />
            </motion.div>
          )}

          {/* Top Courses */}
          {courseStats?.topCourses && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Top Performing Courses
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {courseStats.topCourses.map((course, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {course.instructor?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {course.enrolledStudents.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          ⭐ {course.rating?.average?.toFixed(1) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatCurrency(course.revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-8">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Total Revenue",
                value: formatCurrency(dashboardData?.revenue?.total || 0),
                color: "text-green-600 dark:text-green-400",
                description: "All time earnings",
                icon: <FiDollarSign className="text-2xl" />,
                bgColor: "bg-green-500",
              },
              {
                title: "Average Course Price",
                value: formatCurrency(
                  dashboardData?.courses?.total > 0
                    ? (dashboardData?.revenue?.total || 0) /
                        (dashboardData?.enrollments?.total || 1)
                    : 0
                ),
                color: "text-blue-600 dark:text-blue-400",
                description: "Per enrollment",
                icon: <FiTrendingUp className="text-2xl" />,
                bgColor: "bg-blue-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {stat.title}
                    </h3>
                    <p className={`text-4xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Revenue by Category */}
          {courseStats?.categoryStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Revenue by Category
              </h3>
              <RevenueChart
                data={courseStats.categoryStats.map((stat) => ({
                  month: stat._id,
                  revenue: stat.totalRevenue || 0,
                }))}
              />
            </motion.div>
          )}

          {/* Monthly Enrollments */}
          {dashboardData?.enrollments?.monthly && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Monthly Enrollment Trends
              </h3>
              <EnrollmentChart
                data={dashboardData.enrollments.monthly.map((item) => ({
                  month: `${item._id.month}/${item._id.year}`,
                  enrollments: item.count,
                }))}
              />
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Platform Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "user_registered" ? (
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <FiUserPlus className="text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.type === "user_registered" ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.data.name} registered
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Role: {activity.data.role} • {activity.data.email}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.data.title} published
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          By: {activity.data.instructor?.name} • Status:{" "}
                          {activity.data.isPublished ? "Published" : "Draft"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(activity.timestamp)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Platform Growth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Growth (30 days)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Users:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.users?.recent || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Courses:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.courses?.recent || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Platform Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">
                    Active Users:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {dashboardData?.users?.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">
                    Published Courses:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {dashboardData?.courses?.published || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
