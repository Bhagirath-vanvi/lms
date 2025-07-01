import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiSave, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import {
  fetchCourse,
  updateCourse,
  addLesson,
  updateLesson,
  deleteLesson,
} from "../../store/slices/courseSlice";
import { useUploadImageMutation } from "../../store/api/apiSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import LessonForm from "../../components/instructor/LessonForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const EditCourse = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    level: "",
    price: "",
    thumbnail: "",
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    isPublished: false,
  });
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    lessonId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentCourse: course, isLoading } = useSelector(
    (state) => state.courses
  );
  const { user } = useSelector((state) => state.auth);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const categories = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
    "Other",
  ];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (course) {
      // Check if user is the instructor
      if (course.instructor._id !== user?._id && user?.role !== "admin") {
        navigate("/instructor/my-courses");
        return;
      }

      setFormData({
        title: course.title || "",
        shortDescription: course.shortDescription || "",
        description: course.description || "",
        category: course.category || "",
        level: course.level || "",
        price: course.price || "",
        thumbnail: course.thumbnail || "",
        tags: course.tags || [],
        requirements: course.requirements || [],
        whatYouWillLearn: course.whatYouWillLearn || [],
        isPublished: course.isPublished || false,
      });
    }
  }, [course, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayInput = (field, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const uploadResult = await uploadImage(formDataUpload).unwrap();
        setFormData((prev) => ({
          ...prev,
          thumbnail: uploadResult.url,
        }));
      } catch (error) {
        console.error("Thumbnail upload failed:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        updateCourse({
          courseId: course._id,
          courseData: {
            ...formData,
            price: Number.parseFloat(formData.price) || 0,
          },
        })
      ).unwrap();

      navigate("/instructor/my-courses");
    } catch (error) {
      console.error("Course update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonSave = async (lessonData) => {
    try {
      if (editingLesson) {
        await dispatch(
          updateLesson({
            courseId: course._id,
            lessonId: editingLesson._id,
            lessonData,
          })
        ).unwrap();
      } else {
        await dispatch(
          addLesson({
            courseId: course._id,
            lessonData,
          })
        ).unwrap();
      }

      setShowLessonForm(false);
      setEditingLesson(null);
      // Refresh course data
      dispatch(fetchCourse(id));
    } catch (error) {
      console.error("Lesson save failed:", error);
    }
  };

  const handleDeleteLesson = (lessonId) => {
    setDeleteConfirm({ show: true, lessonId });
  };

  const confirmDeleteLesson = async () => {
    try {
      await dispatch(
        deleteLesson({
          courseId: course._id,
          lessonId: deleteConfirm.lessonId,
        })
      ).unwrap();

      setDeleteConfirm({ show: false, lessonId: null });
      // Refresh course data
      dispatch(fetchCourse(id));
    } catch (error) {
      console.error("Lesson delete failed:", error);
    }
  };

  if (isLoading) {
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
            The course you're trying to edit doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "content", label: "Content" },
    { id: "lessons", label: "Lessons" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your course content and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Course Information
                </h2>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.shortDescription.length}/200 characters
                  </p>
                </div>

                {/* Category and Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level *
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Level</option>
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Thumbnail
                  </label>
                  {formData.thumbnail && (
                    <div className="mb-4">
                      <img
                        src={formData.thumbnail || "/placeholder.svg"}
                        alt="Course thumbnail"
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {isUploading && (
                    <div className="mt-2 flex items-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Uploading...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Course Content Details
                </h2>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                {/* What You'll Learn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What Students Will Learn
                  </label>
                  <div className="space-y-2">
                    {formData.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white flex-1">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("whatYouWillLearn", index)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add learning outcome"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleArrayInput(
                              "whatYouWillLearn",
                              e.target.value
                            );
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleArrayInput("whatYouWillLearn", input.value);
                          input.value = "";
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Requirements
                  </label>
                  <div className="space-y-2">
                    {formData.requirements.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white flex-1">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem("requirements", index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add requirement"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleArrayInput("requirements", e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleArrayInput("requirements", input.value);
                          input.value = "";
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeArrayItem("tags", index)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add tag"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleArrayInput("tags", e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          handleArrayInput("tags", input.value);
                          input.value = "";
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Course Lessons
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowLessonForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Add Lesson
                  </button>
                </div>

                {showLessonForm && (
                  <LessonForm
                    lesson={editingLesson}
                    onSave={handleLessonSave}
                    onCancel={() => {
                      setShowLessonForm(false);
                      setEditingLesson(null);
                    }}
                    isEditing={!!editingLesson}
                  />
                )}

                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {index + 1}. {lesson.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {lesson.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Duration: {lesson.duration} minutes
                              </span>
                              {lesson.resources &&
                                lesson.resources.length > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {lesson.resources.length} resources
                                  </span>
                                )}
                              {lesson.isPreview && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                                  Preview
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLesson(lesson);
                                setShowLessonForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">
                      No lessons added yet. Click "Add Lesson" to get started.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Course Settings
                </h2>

                {/* Publication Status */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Publish this course
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Published courses are visible to students and can be
                    enrolled in.
                  </p>
                </div>

                {/* Course Statistics */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Course Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {course.enrolledStudents?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Enrolled Students
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {course.lessons?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Lessons
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {course.rating?.average?.toFixed(1) || "0.0"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Average Rating
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ₹
                        {(
                          (course.price || 0) *
                          (course.enrolledStudents?.length || 0)
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Revenue
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate("/instructor/my-courses")}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <FiSave className="mr-2" size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, lessonId: null })}
          onConfirm={confirmDeleteLesson}
          title="Delete Lesson"
          message="Are you sure you want to delete this lesson? This action cannot be undone."
          confirmText="Delete"
          type="danger"
        />
      </div>
    </div>
  );
};

export default EditCourse;
