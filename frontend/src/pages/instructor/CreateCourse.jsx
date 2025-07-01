import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiUpload, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { createCourse } from "../../store/slices/courseSlice";
// import { useUploadFileMutation } from "../../store/api/apiSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  useUploadImageMutation,
  useUploadVideoMutation,
} from "../../store/api/apiSlice";

const CreateCourse = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  });
  const [lessons, setLessons] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  //   const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [uploadVideo] = useUploadVideoMutation();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setThumbnailFile(file);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const uploadResult = await uploadImage(formDataUpload).unwrap();
        console.log("Image uploaded:");
        setFormData((prev) => ({
          ...prev,
          thumbnail: uploadResult.url,
        }));
      } catch (error) {
        console.error("Thumbnail upload failed:", error);
      }
    }
  };

  const handleVideoUpload = async (file, index) => {
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await uploadVideo(formData).unwrap();
      console.log("Video uploaded:", res.url);

      // Update that lesson's videoUrl
      setLessons((prev) =>
        prev.map((lesson, i) =>
          i === index ? { ...lesson, videoUrl: res.url } : lesson
        )
      );
    } catch (err) {
      console.error("Video upload failed:", err);
    }
  };

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        resources: [],
      },
    ]);
  };

  const updateLesson = (index, field, value) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const removeLesson = (index) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const courseData = {
        ...formData,
        price: Number.parseFloat(formData.price) || 0,
        lessons: lessons.map((lesson, index) => ({
          ...lesson,
          duration: Number.parseInt(lesson.duration) || 0,
          order: index + 1,
        })),
      };

      await dispatch(createCourse(courseData)).unwrap();
      navigate("/instructor/my-courses");
    } catch (error) {
      console.error("Course creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Course Content" },
    { number: 3, title: "Lessons" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your knowledge with students around the world
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Basic Course Information
                </h2>

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter course title"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label
                    htmlFor="shortDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Short Description *
                  </label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of your course"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.shortDescription.length}/200 characters
                  </p>
                </div>

                {/* Category and Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
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
                    <label
                      htmlFor="level"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Level *
                    </label>
                    <select
                      id="level"
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
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Set to 0 for free course
                  </p>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Thumbnail *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    {formData.thumbnail ? (
                      <div className="space-y-4">
                        <img
                          src={formData.thumbnail || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          className="mx-auto h-32 w-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, thumbnail: "" }))
                          }
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                              Upload thumbnail image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  {isUploading && (
                    <div className="mt-2 flex items-center justify-center">
                      <LoadingSpinner size="small" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Uploading...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Course Content */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Course Content Details
                </h2>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Course Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Detailed description of your course"
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

            {/* Step 3: Lessons */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Course Lessons
                  </h2>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Add Lesson
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">
                      No lessons added yet. Click "Add Lesson" to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Lesson {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Lesson Title *
                            </label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(index, "title", e.target.value)
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter lesson title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Duration (minutes) *
                            </label>
                            <input
                              type="number"
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLesson(index, "duration", e.target.value)
                              }
                              required
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Duration in minutes"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Video URL *
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleVideoUpload(file, index);
                              }
                            }}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            // placeholder="https://example.com/video.mp4"
                          />
                          {lesson.videoUrl && (
                            <video
                              src={lesson.videoUrl}
                              controls
                              className="mt-2 w-full rounded-lg shadow"
                              d
                            />
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Lesson Description *
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) =>
                              updateLesson(index, "description", e.target.value)
                            }
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Describe what students will learn in this lesson"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-4">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      <>
                        <FiSave className="mr-2" size={16} />
                        Create Course
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
