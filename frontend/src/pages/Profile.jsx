"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiCamera, FiSave, FiEdit3 } from "react-icons/fi";
import { updateProfile } from "../store/slices/authSlice";
// import { useUploadFileMutation } from "../store/api/apiSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useUploadImageMutation } from "../store/api/apiSlice";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  //   const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
      setPreviewUrl(user.avatar || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let avatarUrl = formData.avatar;

    // Upload new avatar if selected
    if (avatarFile) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", avatarFile);

        const uploadResult = await uploadImage(formDataUpload).unwrap();
        avatarUrl = uploadResult.url;
      } catch (error) {
        console.error("Avatar upload failed:", error);
        return;
      }
    }

    // Update profile
    dispatch(
      updateProfile({
        ...formData,
        avatar: avatarUrl,
      })
    );

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
    setPreviewUrl(user.avatar || "");
    setAvatarFile(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 ">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-4 ">
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg?height=80&width=80"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200">
                      <FiCamera className="text-white" size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user?.name}
                  </h1>
                  <p className="text-blue-100 capitalize">{user?.role}</p>
                  <p className="text-blue-100 text-sm">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white font-medium rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                <FiEdit3 className="mr-2" size={16} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isLoading || isUploading}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading || isUploading ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      <>
                        <FiSave className="mr-2" size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Member Since
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(user?.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      About
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Learning Stats for Students */}
                {user?.role === "student" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Learning Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {user?.enrolledCourses?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Enrolled Courses
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {user?.enrolledCourses?.filter(
                            (course) => course.progress === 100
                          ).length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Completed Courses
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {user?.enrolledCourses?.filter(
                            (course) =>
                              course.progress > 0 && course.progress < 100
                          ).length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          In Progress
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teaching Stats for Instructors */}
                {user?.role === "instructor" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Teaching Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {user?.createdCourses?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Courses Created
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {user?.createdCourses?.reduce(
                            (total, course) =>
                              total + (course.enrolledStudents?.length || 0),
                            0
                          ) || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Students
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
