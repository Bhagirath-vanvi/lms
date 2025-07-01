import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSave, FiX, FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";
import { useUploadVideoMutation } from "../../store/api/apiSlice";
import LoadingSpinner from "../common/LoadingSpinner";

const LessonForm = ({ lesson, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    resources: [],
    isPreview: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoMutation();

  useEffect(() => {
    if (lesson && isEditing) {
      setFormData({
        title: lesson.title || "",
        description: lesson.description || "",
        videoUrl: lesson.videoUrl || "",
        duration: lesson.duration || "",
        resources: lesson.resources || [],
        isPreview: lesson.isPreview || false,
      });
    }
  }, [lesson, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("video", file);

        const uploadResult = await uploadVideo(formDataUpload).unwrap();
        setFormData((prev) => ({
          ...prev,
          videoUrl: uploadResult.url,
          duration: Math.round(uploadResult.duration / 60) || prev.duration, // Convert seconds to minutes
        }));
      } catch (error) {
        console.error("Video upload failed:", error);
      }
    }
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: "", url: "", type: "link" }],
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.map((resource, i) =>
        i === index ? { ...resource, [field]: value } : resource
      ),
    }));
  };

  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const lessonData = {
        ...formData,
        duration: Number.parseInt(formData.duration) || 0,
      };

      await onSave(lessonData);
    } catch (error) {
      console.error("Lesson save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Edit Lesson" : "Add New Lesson"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lesson Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Enter lesson title"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Describe what students will learn in this lesson"
        />
      </div>

      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Video *
        </label>
        {formData.videoUrl ? (
          <div className="space-y-3">
            <video
              src={formData.videoUrl}
              controls
              className="w-full h-48 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, videoUrl: "" }))}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remove Video
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Upload video file
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
        {isUploading && (
          <div className="mt-2 flex items-center justify-center">
            <LoadingSpinner size="small" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Uploading video...
            </span>
          </div>
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duration (minutes) *
        </label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          required
          min="1"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Duration in minutes"
        />
      </div>

      {/* Preview Checkbox */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isPreview"
            checked={formData.isPreview}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Allow as preview lesson (free to watch)
          </span>
        </label>
      </div>

      {/* Resources */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Resources
          </label>
          <button
            type="button"
            onClick={addResource}
            className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-1" size={14} />
            Add Resource
          </button>
        </div>

        {formData.resources.length > 0 && (
          <div className="space-y-3">
            {formData.resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) =>
                    updateResource(index, "title", e.target.value)
                  }
                  placeholder="Resource title"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="url"
                  value={resource.url}
                  onChange={(e) => updateResource(index, "url", e.target.value)}
                  placeholder="Resource URL"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <select
                  value={resource.type}
                  onChange={(e) =>
                    updateResource(index, "type", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading || !formData.videoUrl}
          className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            <>
              <FiSave className="mr-2" size={16} />
              {isEditing ? "Update Lesson" : "Add Lesson"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default LessonForm;
