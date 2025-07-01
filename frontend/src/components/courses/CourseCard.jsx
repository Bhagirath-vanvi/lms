import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiClock, FiUsers, FiPlay, FiBookmark } from "react-icons/fi";

const CourseCard = ({ course, viewMode = "grid" }) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `₹${price}`;
  };

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-80 h-48 md:h-auto relative overflow-hidden">
            <img
              src={course.thumbnail || "/placeholder.svg?height=200&width=320"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FiPlay className="text-white text-3xl" />
            </div>
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.level === "Beginner"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : course.level === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {course.level}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {course.category}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
                  {course.title}
                </h3>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                <FiBookmark size={20} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {course.shortDescription}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <FiStar
                  className="text-yellow-400 fill-current mr-1"
                  size={16}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.rating?.average?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({course.rating?.count || 0})
                </span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <FiClock size={16} className="mr-1" />
                <span className="text-sm">
                  {formatDuration(course.totalDuration)}
                </span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <FiUsers size={16} className="mr-1" />
                <span className="text-sm">
                  {course.enrolledStudents?.length || 0} students
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    course.instructor?.avatar ||
                    "/placeholder.svg?height=32&width=32"
                  }
                  alt={course.instructor?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {course.instructor?.name}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(course.price)}
                </span>
                <Link
                  to={`/courses/${course._id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group h-[460px] flex flex-col"
    >
      <div className="relative overflow-hidden flex-shrink-0">
        <img
          src={course.thumbnail || "/placeholder.svg?height=200&width=320"}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FiPlay className="text-white text-3xl" />
        </div>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium rounded-full">
            {course.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.level === "Beginner"
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : course.level === "Intermediate"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {course.level}
          </span>
        </div>
        <button className="absolute bottom-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100">
          <FiBookmark size={16} />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Title with fixed height - exactly 2 lines */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 h-12 leading-6">
          {course.title}
        </h3>

        {/* Description with fixed height - exactly 2 lines */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10 leading-5">
          {course.shortDescription}
        </p>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <FiStar className="text-yellow-400 fill-current mr-1" size={16} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {course.rating?.average?.toFixed(1) || "0.0"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({course.rating?.count || 0})
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiClock size={16} className="mr-1" />
            <span className="text-sm">
              {formatDuration(course.totalDuration)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={
                course.instructor?.avatar ||
                "/placeholder.svg?height=24&width=24"
              }
              alt={course.instructor?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {course.instructor?.name}
            </span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <FiUsers size={16} className="mr-1" />
            <span className="text-sm">
              {course.enrolledStudents?.length || 0}
            </span>
          </div>
        </div>

        {/* Push this section to bottom with mt-auto */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(course.price)}
          </span>
          <Link
            to={`/courses/${course._id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
