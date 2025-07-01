import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "../../store/api/apiSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "all",
    search: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "",
    userId: null,
    action: null,
    title: "",
    message: "",
  });

  const { data: usersData, isLoading, refetch } = useGetUsersQuery(filters);
  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    handleFilterChange("search", search);
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    setConfirmDialog({
      show: true,
      type: "role",
      userId,
      action: async () => {
        try {
          await updateUserRole({ userId, role: newRole }).unwrap();
          toast.success(`User role updated to ${newRole} successfully`);
          refetch();
        } catch (error) {
          toast.error(error.data?.message || "Failed to update user role");
        }
      },
      title: "Change User Role",
      message: `Are you sure you want to change ${userName}'s role to ${newRole}? This will affect their permissions and access to features.`,
    });
  };

  const handleStatusToggle = async (userId, currentStatus, userName) => {
    const newStatus = !currentStatus;
    setConfirmDialog({
      show: true,
      type: "status",
      userId,
      action: async () => {
        try {
          await updateUserStatus({ userId, isActive: newStatus }).unwrap();
          toast.success(
            `User ${newStatus ? "activated" : "deactivated"} successfully`
          );
          refetch();
        } catch (error) {
          toast.error(
            error.data?.message ||
              `Failed to ${newStatus ? "activate" : "deactivate"} user`
          );
        }
      },
      title: `${newStatus ? "Activate" : "Deactivate"} User`,
      message: `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${userName}? ${
        newStatus
          ? "They will regain access to their account."
          : "They will lose access to their account and all features."
      }`,
    });
  };

  const handleDeleteUser = (userId, userName, userRole) => {
    if (userRole === "admin") {
      toast.error("Cannot delete admin users");
      return;
    }

    setConfirmDialog({
      show: true,
      type: "delete",
      userId,
      action: async () => {
        try {
          await deleteUser(userId).unwrap();
          toast.success("User deleted successfully");
          refetch();
        } catch (error) {
          toast.error(error.data?.message || "Failed to delete user");
        }
      },
      title: "Delete User",
      message: `Are you sure you want to delete ${userName}? This action cannot be undone and will permanently remove their account and all associated data.`,
    });
  };

  const confirmAction = async () => {
    await confirmDialog.action();
    setConfirmDialog({
      show: false,
      type: "",
      userId: null,
      action: null,
      title: "",
      message: "",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserStats = () => {
    const users = usersData?.users || [];
    return {
      total: usersData?.pagination?.total || 0,
      students: users.filter((user) => user.role === "student").length,
      instructors: users.filter((user) => user.role === "instructor").length,
      admins: users.filter((user) => user.role === "admin").length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
    };
  };

  const stats = getUserStats();

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
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Students
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.students}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <FiBookOpen className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Instructors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.instructors}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <FiAward className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                <FiTrendingUp className="text-orange-600 dark:text-orange-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
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
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="instructor">Instructors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usersData?.users?.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={
                              user.avatar ||
                              "/placeholder.svg?height=40&width=40" ||
                              "/placeholder.svg"
                            }
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <FiMail className="mr-1" size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value, user.name)
                        }
                        disabled={isUpdatingRole}
                        className="text-sm bg-transparent border-none rounded-md focus:outline-none text-gray-900 dark:text-white capitalize"
                      >
                        <option className="dark:bg-gray-600" value="student">
                          Student
                        </option>
                        <option className="dark:bg-gray-600" value="instructor">
                          Instructor
                        </option>
                        <option className="dark:bg-gray-600" value="admin">
                          Admin
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" size={12} />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.role === "student" && (
                        <div>
                          <div>
                            {user.enrolledCourses?.length || 0} courses enrolled
                          </div>
                        </div>
                      )}
                      {user.role === "instructor" && (
                        <div>
                          <div>
                            {user.createdCourses?.length || 0} courses created
                          </div>
                          <div className="text-xs">
                            {user.createdCourses?.reduce(
                              (total, course) =>
                                total + (course.enrolledStudents?.length || 0),
                              0
                            )}{" "}
                            total students
                          </div>
                        </div>
                      )}
                      {user.role === "admin" && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          System Administrator
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              user._id,
                              user.isActive,
                              user.name
                            )
                          }
                          disabled={isUpdatingStatus}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            user.isActive
                              ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                          title={
                            user.isActive ? "Deactivate User" : "Activate User"
                          }
                        >
                          {user.isActive ? (
                            <FiUserX size={16} />
                          ) : (
                            <FiUserCheck size={16} />
                          )}
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.name, user.role)
                            }
                            disabled={isDeletingUser}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            title="Delete User"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {usersData?.users?.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filters.search || filters.role !== "all"
                  ? "Try adjusting your search or filters."
                  : "No users have been registered yet."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {usersData?.pagination?.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={usersData.pagination.current}
                totalPages={usersData.pagination.pages}
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
              type: "",
              userId: null,
              action: null,
              title: "",
              message: "",
            })
          }
          onConfirm={confirmAction}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Confirm"
          type="warning"
        />
      </div>
    </div>
  );
};

export default AdminUsers;
