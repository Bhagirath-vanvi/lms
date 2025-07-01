import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import { fetchCourses, setFilters } from "../../store/slices/courseSlice";
import CourseCard from "../../components/courses/CourseCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";

const Courses = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch();
  const { courses, isLoading, pagination, filters } = useSelector(
    (state) => state.courses
  );

  const categories = [
    "all",
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
    "Other",
  ];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const sortOptions = [
    { value: "createdAt", label: "Newest" },
    { value: "title", label: "Title" },
    { value: "price", label: "Price" },
    { value: "rating.average", label: "Rating" },
  ];

  useEffect(() => {
    dispatch(fetchCourses({ ...filters, page: 1 }));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    dispatch(setFilters({ search }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchCourses({ ...filters, page }));
  };

  const clearFilters = () => {
    dispatch(
      setFilters({
        category: "all",
        level: "all",
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Explore Courses
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Discover {pagination.total} courses to advance your skills
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="search"
                  type="text"
                  defaultValue={filters.search}
                  placeholder="Search courses..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Category
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Level
                  </label>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="level"
                          value={level}
                          checked={filters.level === level}
                          onChange={(e) =>
                            handleFilterChange("level", e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Order
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={filters.sortOrder === "desc"}
                        onChange={(e) =>
                          handleFilterChange("sortOrder", e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Descending
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={filters.sortOrder === "asc"}
                        onChange={(e) =>
                          handleFilterChange("sortOrder", e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Ascending
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pagination.total} courses found
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {/* Course Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                >
                  {courses.map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard course={course} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.current}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
