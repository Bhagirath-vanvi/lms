import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiCheckCircle,
  FiBook,
  FiDownload,
  FiArrowLeft,
  FiMenu,
  FiX,
  FiAward,
} from "react-icons/fi";
import {
  fetchCourse,
  updateLessonProgress,
} from "../../store/slices/courseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CompletionCertificate from "../../components/courses/CompletionCertificate";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const CourseLearning = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const celebrationShown = useRef(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentCourse: course, isLoading } = useSelector(
    (state) => state.courses
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id));
      celebrationShown.current = false; // Reset celebration flag when course changes
    }
  }, [dispatch, id]);

  const hasCelebrated = (courseId) => {
    return localStorage.getItem(`celebrated_${courseId}`) === "true";
  };

  const setCelebrated = (courseId) => {
    localStorage.setItem(`celebrated_${courseId}`, "true");
  };

  // Check for course completion and show celebration (only once)
  useEffect(() => {
    if (course?.enrollmentInfo?.isCompleted && !hasCelebrated(course._id)) {
      celebrationShown.current = true;
      setCelebrated(course._id);

      setTimeout(() => {
        celebrateCompletion();
        toast.success("🎉 Congratulations! You've completed the course!", {
          duration: 6000,
          style: {
            background: "#10B981",
            color: "#fff",
          },
        });
      }, 500);
    }
  }, [course]);

  const celebrateCompletion = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  const currentLesson = course?.lessons?.[currentLessonIndex];
  const enrollmentInfo = course?.enrollmentInfo;

  const isLessonCompleted = (lessonId) => {
    return enrollmentInfo?.completedLessons?.includes(lessonId);
  };

  const calculateProgress = () => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    const completedLessons = enrollmentInfo?.completedLessons?.length || 0;
    return Math.round((completedLessons / course.lessons.length) * 100);
  };

  const handleLessonComplete = async (lessonId, completed = true) => {
    try {
      await dispatch(
        updateLessonProgress({
          courseId: course._id,
          lessonId,
          completed,
        })
      ).unwrap();

      // Refresh course data to get updated progress
      dispatch(fetchCourse(id));
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      // Mark current lesson as completed when moving to next
      if (currentLesson && !isLessonCompleted(currentLesson._id)) {
        handleLessonComplete(currentLesson._id);
      }
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handleLessonSelect = (index) => {
    setCurrentLessonIndex(index);
    setShowSidebar(false); // Hide sidebar on mobile after selection
  };

  const handleProgress = ({ played }) => {
    setProgress(played);

    // Auto-mark lesson as completed when 90% watched
    if (
      played > 0.9 &&
      currentLesson &&
      !isLessonCompleted(currentLesson._id)
    ) {
      handleLessonComplete(currentLesson._id);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-gray-400 mb-4">
            The course you're looking for doesn't exist or you don't have
            access.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const courseProgress = calculateProgress();
  const isCourseCompleted = enrollmentInfo?.isCompleted || false;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-white flex">
      {/* Certificate Modal */}
      {showCertificate && (
        <CompletionCertificate
          course={course}
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-30 w-80 bg-white dark:bg-gray-800 h-full transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate text-gray-700 dark:text-gray-200">
              {course.title}
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden text-gray-400 hover:text-gray-500"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {enrollmentInfo?.completedLessons?.length || 0} of{" "}
            {course.lessons.length} lessons completed
          </div>
          <div className="mt-2 bg-white dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isCourseCompleted ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{
                width: `${courseProgress}%`,
              }}
            />
          </div>
          {isCourseCompleted && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowCertificate(true)}
              className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <FiAward className="mr-2" size={16} />
              View Certificate
            </motion.button>
          )}
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {course.lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              onClick={() => handleLessonSelect(index)}
              className={`p-4 border-b dark:border-gray-700 border-gray-300 cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-300 transition-colors ${
                index === currentLessonIndex
                  ? "dark:bg-gray-700 bg-gray-300"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {isLessonCompleted(lesson._id) ? (
                    <FiCheckCircle className="text-green-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-xs">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate dark:text-gray-400 text-gray-700">
                    {lesson.title}
                  </h3>
                  <p className="text-xs dark:text-gray-400 text-gray-500 mt-1 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <FiPlay className="mr-1" size={12} />
                    {Math.floor(lesson.duration / 60)}:
                    {(lesson.duration % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="dark:bg-gray-900 bg-gray-50 p-4 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden text-gray-400 hover:text-gray-500"
            >
              <FiMenu size={20} />
            </button>
            <button
              onClick={() => navigate(`/courses/${course._id}`)}
              className="flex items-center text-gray-400 hover:text-gray-500"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Back to Course
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {isCourseCompleted && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCertificate(true)}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <FiAward className="mr-1" size={14} />
                  Quick View
                </button>
                <button
                  onClick={() => navigate(`/certificates/${course._id}`)}
                  className="flex items-center px-3 py-1 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                >
                  <FiDownload className="mr-1" size={14} />
                  Full Certificate
                </button>
              </div>
            )}
            <div className="text-sm text-gray-400">
              Lesson {currentLessonIndex + 1} of {course.lessons.length}
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black relative">
          <ReactPlayer
            url={currentLesson.videoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onProgress={handleProgress}
            onDuration={setDuration}
            config={{
              youtube: {
                playerVars: { showinfo: 1, rel: 0 },
              },
            }}
          />
        </div>

        {/* Lesson Info & Controls */}
        <div className="dark:bg-gray-800 bg-white p-6">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-100">
                  {currentLesson.title}
                </h1>
                <p className="dark:text-gray-400 text-gray-500 mt-1">
                  {currentLesson.description}
                </p>
              </div>
              <button
                onClick={() =>
                  !isLessonCompleted(currentLesson._id) &&
                  handleLessonComplete(currentLesson._id, true)
                }
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isLessonCompleted(currentLesson._id)
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <FiCheckCircle className="mr-2" size={16} />
                {isLessonCompleted(currentLesson._id)
                  ? "Completed"
                  : "Mark Complete"}
              </button>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousLesson}
                disabled={currentLessonIndex === 0}
                className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSkipBack className="mr-2" size={16} />
                Previous
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {formatTime(progress * duration)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={handleNextLesson}
                disabled={currentLessonIndex === course.lessons.length - 1}
                className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <FiSkipForward className="ml-2" size={16} />
              </button>
            </div>

            {/* Resources */}
            {currentLesson.resources && currentLesson.resources.length > 0 && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FiBook className="mr-2" size={16} />
                  Lesson Resources
                </h3>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <FiDownload className="mr-2" size={14} />
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default CourseLearning;
