"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiPlay, FiBookOpen, FiCalendar, FiCheck } from "react-icons/fi";
import {
  fetchEnrolledCourses,
  unenrollCourse,
} from "../../store/slices/courseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const EnrolledCourses = () => {
  const [filter, setFilter] = useState("all");
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const dispatch = useDispatch();
  const { enrolledCourses, isLoading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
  }, [dispatch]);

  const handleUnenroll = async () => {
    if (selectedCourse) {
      await dispatch(unenrollCourse(selectedCourse._id));
      setShowUnenrollDialog(false);
      setSelectedCourse(null);
      dispatch(fetchEnrolledCourses());
    }
  };

  const filteredCourses =
    enrolledCourses?.filter((course) => {
      if (filter === "completed") return course.enrollmentInfo?.isCompleted;
      if (filter === "in-progress")
        return (
          !course.enrollmentInfo?.isCompleted &&
          course.enrollmentInfo?.progress > 0
        );
      return true;
    }) || [];

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Enrolled Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your learning progress and continue your journey
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {["all", "in-progress", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {f.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <FiBookOpen className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === "all"
              ? "You haven't enrolled in any courses yet."
              : `No ${filter.replace("-", " ")} courses found.`}
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiBookOpen className="mr-2" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl overflow-hidden border transition-shadow duration-300 shadow-md hover:shadow-lg ${
                course.enrollmentInfo?.isCompleted
                  ? "border-green-500"
                  : "border-gray-200 dark:border-gray-700"
              } bg-white dark:bg-gray-800`}
            >
              <div className="relative">
                <img
                  src={
                    course.thumbnail || "/placeholder.svg?height=200&width=400"
                  }
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  {course.enrollmentInfo?.isCompleted ? (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiCheck className="mr-1" size={12} /> Completed
                    </div>
                  ) : (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {Math.round(course.enrollmentInfo?.progress || 0)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {course.shortDescription}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <FiCalendar className="mr-1" size={14} />
                  <span>
                    Enrolled {formatDate(course.enrollmentInfo?.enrolledAt)}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(course.enrollmentInfo?.progress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        course.enrollmentInfo?.progress || 0
                      )}`}
                      style={{
                        width: `${course.enrollmentInfo?.progress || 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/courses/${course._id}/learn`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiPlay className="mr-2" size={16} />
                    {course.enrollmentInfo?.isCompleted
                      ? "Review"
                      : course.enrollmentInfo?.progress > 0
                      ? "Continue"
                      : "Start"}
                  </Link>
                  <Link
                    to={`/courses/${course._id}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showUnenrollDialog}
        onClose={() => setShowUnenrollDialog(false)}
        onConfirm={handleUnenroll}
        title="Unenroll from Course"
        message={`Are you sure you want to unenroll from "${selectedCourse?.title}"? You will lose all your progress.`}
        confirmText="Unenroll"
        type="danger"
      />
    </div>
  );
};

export default EnrolledCourses;
