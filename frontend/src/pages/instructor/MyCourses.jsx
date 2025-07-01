"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { BsCurrencyRupee } from "react-icons/bs";
import toast from "react-hot-toast";

import {
  FiPlus,
  FiEye,
  FiUsers,
  FiStar,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiBarChart2,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import {
  fetchCourses,
  deleteCourse,
  updateCourse,
} from "../../store/slices/courseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const MyCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    courseId: null,
    courseName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingCourse, setPublishingCourse] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, isLoading } = useSelector((state) => state.courses);

  // Filter courses by instructor
  const myCourses = courses.filter(
    (course) => course.instructor._id === user?._id
  );

  useEffect(() => {
    dispatch(fetchCourses({ instructor: user?._id }));
  }, [dispatch, user]);

  const filteredCourses = myCourses
    .filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.isPublished) ||
        (statusFilter === "draft" && !course.isPublished);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "students":
          return (
            (b.enrolledStudents?.length || 0) -
            (a.enrolledStudents?.length || 0)
          );
        case "rating":
          return (b.rating?.average || 0) - (a.rating?.average || 0);
        case "revenue":
          return (
            b.price * (b.enrolledStudents?.length || 0) -
            a.price * (a.enrolledStudents?.length || 0)
          );
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const totalStudents = myCourses.reduce(
    (sum, course) => sum + (course.enrolledStudents?.length || 0),
    0
  );
  const totalRevenue = myCourses.reduce(
    (sum, course) =>
      sum + course.price * (course.enrolledStudents?.length || 0),
    0
  );
  const averageRating =
    myCourses.length > 0
      ? myCourses.reduce(
          (sum, course) => sum + (course.rating?.average || 0),
          0
        ) / myCourses.length
      : 0;

  const handleDeleteCourse = (course) => {
    setDeleteConfirm({
      show: true,
      courseId: course._id,
      courseName: course.title,
    });
  };

  const confirmDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteCourse(deleteConfirm.courseId)).unwrap();
      toast.success("Course deleted successfully");
      setDeleteConfirm({ show: false, courseId: null, courseName: "" });
      // Refresh courses list
      dispatch(fetchCourses({ instructor: user?._id }));
    } catch (error) {
      toast.error(error.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (course) => {
    if (course.lessons?.length === 0) {
      toast.error("Cannot publish course without lessons");
      return;
    }

    setPublishingCourse(course._id);
    try {
      await dispatch(
        updateCourse({
          courseId: course._id,
          courseData: { isPublished: !course.isPublished },
        })
      ).unwrap();

      toast.success(
        course.isPublished
          ? "Course unpublished successfully"
          : "Course published successfully"
      );

      // Refresh courses list
      dispatch(fetchCourses({ instructor: user?._id }));
    } catch (error) {
      toast.error(error.message || "Failed to update course status");
    } finally {
      setPublishingCourse(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track your course performance
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {myCourses.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <FiEye className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {totalStudents}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <FiUsers className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <FiDollarSign className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {averageRating.toFixed(1)}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <FiStar className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="createdAt">Newest First</option>
                <option value="title">Title A-Z</option>
                <option value="students">Most Students</option>
                <option value="rating">Highest Rated</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiEye size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {myCourses.length === 0 ? "No courses yet" : "No courses found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {myCourses.length === 0
                ? "Create your first course to start teaching"
                : "Try adjusting your search or filter criteria"}
            </p>
            {myCourses.length === 0 && (
              <Link
                to="/instructor/create-course"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="mr-2" />
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-md transition-shadow mdration-300"
              >
                <div className="relative">
                  <img
                    src={
                      course.thumbnail ||
                      "/placeholder.svg?height=200&width=320" ||
                      "/placeholder.svg"
                    }
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.isPublished
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <FiUsers className="text-blue-500 text-sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiStar className="text-yellow-500 text-sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.rating?.average?.toFixed(1) || "No rating"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BsCurrencyRupee className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="text-purple-500 text-sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Revenue
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatPrice(
                          course.price * (course.enrolledStudents?.length || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Publish Toggle */}
                  <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Published
                    </span>
                    <button
                      onClick={() => handleTogglePublish(course)}
                      disabled={publishingCourse === course._id}
                      className={`flex items-center transition-colors duration-200 ${
                        publishingCourse === course._id
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-80"
                      }`}
                    >
                      {publishingCourse === course._id ? (
                        <LoadingSpinner size="small" />
                      ) : course.isPublished ? (
                        <FiToggleRight className="text-green-500 text-2xl" />
                      ) : (
                        <FiToggleLeft className="text-gray-400 text-2xl" />
                      )}
                    </button>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Created: {formatDate(course.createdAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/instructor/courses/${course._id}/edit`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FiEdit className="mr-1" size={14} />
                      Edit
                    </Link>
                    <Link
                      to={`/instructor/courses/${course._id}/analytics`}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      <FiBarChart2 className="mr-1" size={14} />
                      Analytics
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      title="Delete Course"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.show}
          onClose={() =>
            setDeleteConfirm({ show: false, courseId: null, courseName: "" })
          }
          onConfirm={confirmDeleteCourse}
          title="Delete Course"
          message={`Are you sure you want to delete "${deleteConfirm.courseName}"? This action cannot be undone and will remove all associated data including student enrollments.`}
          confirmText="Delete Course"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default MyCourses;
