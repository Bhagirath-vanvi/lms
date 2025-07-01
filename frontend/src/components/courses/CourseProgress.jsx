"use client";

import { motion } from "framer-motion";
import { FiCheck, FiPlay, FiLock, FiAward } from "react-icons/fi";

const CourseProgress = ({ course, userProgress, onLessonSelect }) => {
  const calculateProgress = () => {
    if (!course.lessons || course.lessons.length === 0) return 0;

    // Use the enrollment info if available, otherwise calculate from completed lessons
    if (userProgress?.progress !== undefined) {
      return Math.round(userProgress.progress);
    }

    const completedLessons = userProgress?.completedLessons?.length || 0;
    return Math.round((completedLessons / course.lessons.length) * 100);
  };

  const isLessonCompleted = (lessonId) => {
    return userProgress?.completedLessons?.includes(lessonId);
  };

  const isLessonAccessible = (lessonIndex) => {
    // First lesson is always accessible
    if (lessonIndex === 0) return true;

    // Check if previous lesson is completed
    const previousLesson = course.lessons[lessonIndex - 1];
    return isLessonCompleted(previousLesson._id);
  };

  const progress = calculateProgress();
  const isCompleted = progress >= 100 || userProgress?.isCompleted;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Course Progress
          </h3>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <FiAward className="mr-1" size={16} />
                <span className="text-sm font-medium">Completed!</span>
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progress}% Complete
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2 rounded-full ${
              isCompleted ? "bg-green-600" : "bg-blue-600"
            }`}
          />
        </div>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium"
          >
            🎉 Course completed! You can now download your certificate.
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        {course.lessons?.map((lesson, index) => {
          const isCompleted = isLessonCompleted(lesson._id);
          const isAccessible = isLessonAccessible(index);

          return (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : isAccessible
                  ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed"
              }`}
              onClick={() => isAccessible && onLessonSelect(lesson)}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isAccessible
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <FiCheck size={16} />
                ) : isAccessible ? (
                  <FiPlay size={16} />
                ) : (
                  <FiLock size={16} />
                )}
              </div>

              <div className="ml-3 flex-1">
                <h4
                  className={`font-medium ${
                    isAccessible
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {lesson.title}
                </h4>
                <p
                  className={`text-sm ${
                    isAccessible
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {lesson.duration} minutes
                </p>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {index + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseProgress;
