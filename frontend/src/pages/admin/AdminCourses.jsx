import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiUsers,
  FiStar,
  FiDollarSign,
  FiToggleLeft,
  FiToggleRight,
  FiBookOpen,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetAdminCoursesQuery,
} from "../../store/api/apiSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import toast from "react-hot-toast";

const AdminCourses = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: "all",
    level: "all",
    search: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    courseId: null,
    action: null,
    title: "",
    message: "",
    type: "warning",
  });

  const {
    data: coursesData,
    isLoading,
    refetch,
  } = useGetAdminCoursesQuery({
    ...filters,
    // Remove any status filter since we want to see all courses as admin
  });

  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    handleFilterChange("search", search);
  };

  const handleDeleteCourse = (courseId, courseTitle) => {
    setConfirmDialog({
      show: true,
      courseId,
      action: async () => {
        try {
          await deleteCourse(courseId).unwrap();
          toast.success("Course deleted successfully");
          refetch();
        } catch (error) {
          toast.error(error.data?.message || "Failed to delete course");
        }
      },
      title: "Delete Course",
      message: `Are you sure you want to delete "${courseTitle}"? This action cannot be undone and will remove the course from all enrolled students.`,
      type: "danger",
    });
  };

  const handleTogglePublishStatus = (courseId, currentStatus, courseTitle) => {
    const newStatus = !currentStatus;
    setConfirmDialog({
      show: true,
      courseId,
      action: async () => {
        try {
          await updateCourse({
            id: courseId,
            isPublished: newStatus,
          }).unwrap();
          toast.success(
            `Course ${newStatus ? "published" : "unpublished"} successfully`
          );
          refetch();
        } catch (error) {
          toast.error(
            error.data?.message ||
              `Failed to ${newStatus ? "publish" : "unpublish"} course`
          );
        }
      },
      title: `${newStatus ? "Publish" : "Unpublish"} Course`,
      message: `Are you sure you want to ${
        newStatus ? "publish" : "unpublish"
      } "${courseTitle}"?`,
      type: "warning",
    });
  };

  const confirmAction = async () => {
    await confirmDialog.action();
    setConfirmDialog({
      show: false,
      courseId: null,
      action: null,
      title: "",
      message: "",
      type: "warning",
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalRevenue = () => {
    return (
      coursesData?.courses?.reduce(
        (total, course) =>
          total + course.price * (course.enrolledStudents?.length || 0),
        0
      ) || 0
    );
  };

  const getPublishedCount = () => {
    return (
      coursesData?.courses?.filter((course) => course.isPublished).length || 0
    );
  };

  const getDraftCount = () => {
    return (
      coursesData?.courses?.filter((course) => !course.isPublished).length || 0
    );
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage all courses on the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {coursesData?.pagination?.total || 0}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <FiEye className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Published
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {getPublishedCount()}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <FiCheck className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Draft
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {getDraftCount()}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <FiEdit className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ₹{getTotalRevenue().toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <FiDollarSign className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="search"
                  type="text"
                  defaultValue={filters.search}
                  placeholder="Search courses..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Photography">Photography</option>
                <option value="Music">Music</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {coursesData?.courses?.map((course, index) => (
                  <motion.tr
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-16">
                          <img
                            className="h-12 w-16 rounded object-cover"
                            src={
                              course.thumbnail ||
                              "/placeholder.svg?height=48&width=64" ||
                              "/placeholder.svg"
                            }
                            alt={course.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {course.category} • {course.level}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(course.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.instructor?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {course.instructor?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FiUsers className="mr-1" size={12} />
                          {course.enrolledStudents?.length || 0} students
                        </div>
                        <div className="flex items-center">
                          <FiStar className="mr-1" size={12} />
                          {course.rating?.average?.toFixed(1) || "0.0"} rating
                        </div>
                        <div>{course.lessons?.length || 0} lessons</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(course.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/courses/${course._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          title="View Course"
                        >
                          <FiEye size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            handleTogglePublishStatus(
                              course._id,
                              course.isPublished,
                              course.title
                            )
                          }
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            course.isPublished
                              ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                          title={
                            course.isPublished
                              ? "Unpublish Course"
                              : "Publish Course"
                          }
                          disabled={isUpdating}
                        >
                          {course.isPublished ? (
                            <FiToggleRight size={16} />
                          ) : (
                            <FiToggleLeft size={16} />
                          )}
                        </button>
                        <Link
                          to={`/instructor/courses/${course._id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors duration-200"
                          title="Edit Course"
                        >
                          <FiEdit size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteCourse(course._id, course.title)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="Delete Course"
                          disabled={isDeleting}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {coursesData?.courses?.length === 0 && (
            <div className="text-center py-12">
              <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No courses found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filters.search ||
                filters.category !== "all" ||
                filters.level !== "all"
                  ? "Try adjusting your search or filters."
                  : "No courses have been created yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {coursesData?.pagination?.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={coursesData.pagination.current}
                totalPages={coursesData.pagination.pages}
                onPageChange={(page) => handleFilterChange("page", page)}
              />
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.show}
          onClose={() =>
            setConfirmDialog({
              show: false,
              courseId: null,
              action: null,
              title: "",
              message: "",
              type: "warning",
            })
          }
          onConfirm={confirmAction}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Confirm"
          type={confirmDialog.type}
        />
      </div>
    </div>
  );
};

export default AdminCourses;
