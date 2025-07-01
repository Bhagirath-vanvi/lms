import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiPlay,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiStar,
  FiArrowRight,
  FiSearch,
  FiChevronRight,
  FiUser,
  FiTarget,
  FiGlobe,
  FiCode,
  FiBarChart,
  FiCamera,
  FiMusic,
  FiTool,
  FiMail,
} from "react-icons/fi";

import { BsPalette } from "react-icons/bs";
import CourseCard from "../components/courses/CourseCard";
import {
  useGetCoursesQuery,
  useGetPublicStatsQuery,
} from "../store/api/apiSlice";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [email, setEmail] = useState("");

  // Fetch courses for featured section
  const { data: coursesData, isLoading } = useGetCoursesQuery({
    page: 1,
    limit: 6,
    featured: "true",
  });

  const featuredCourse = coursesData?.featured;

  const { data: statsData } = useGetPublicStatsQuery();

  const stats = [
    {
      number: `${statsData?.stats?.totalStudents}+`,
      label: "Active Students",
      icon: <FiUsers />,
    },
    {
      number: `${statsData?.stats?.totalCourses}+`,
      label: "Quality Courses",
      icon: <FiBookOpen />,
    },
    {
      number: `${statsData?.stats?.totalInstructors}+`,
      label: "Expert Instructors",
      icon: <FiUser />,
    },
    {
      number: "96%",
      label: "Success Rate",
      icon: <FiTrendingUp />,
    },
  ];

  const features = [
    {
      icon: <FiBookOpen className="text-2xl" />,
      title: "Expert-Led Courses",
      description:
        "Learn from industry professionals with real-world experience.",
      color: "bg-blue-500",
    },
    {
      icon: <FiUsers className="text-2xl" />,
      title: "Interactive Learning",
      description:
        "Engage with fellow students and instructors in our community.",
      color: "bg-green-500",
    },
    {
      icon: <FiAward className="text-2xl" />,
      title: "Certificates",
      description: "Earn recognized certificates upon course completion.",
      color: "bg-purple-500",
    },
    {
      icon: <FiTrendingUp className="text-2xl" />,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics.",
      color: "bg-orange-500",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories", icon: <FiGlobe />, count: "500+" },
    { id: "programming", name: "Programming", icon: <FiCode />, count: "150+" },
    { id: "design", name: "Design", icon: <BsPalette />, count: "80+" },
    { id: "business", name: "Business", icon: <FiBarChart />, count: "120+" },
    {
      id: "photography",
      name: "Photography",
      icon: <FiCamera />,
      count: "60+",
    },
    { id: "music", name: "Music", icon: <FiMusic />, count: "40+" },
    { id: "marketing", name: "Marketing", icon: <FiTarget />, count: "90+" },
    { id: "technology", name: "Technology", icon: <FiTool />, count: "110+" },
  ];

  const faqs = [
    {
      question: "How do I get started with EduSphere?",
      answer:
        "Simply create a free account, browse our course catalog, and enroll in courses that interest you. Many courses offer free previews so you can try before you buy.",
    },
    {
      question: "Are the certificates recognized by employers?",
      answer:
        "Yes! Our certificates are recognized by leading companies worldwide. Many of our graduates have successfully used their certificates to advance their careers.",
    },
    {
      question: "Can I learn at my own pace?",
      answer:
        "All our courses are self-paced, allowing you to learn whenever and wherever is convenient for you. You'll have lifetime access to course materials.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee on all paid courses. If you're not satisfied, you can request a full refund within 30 days of purchase.",
    },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setShowNewsletterModal(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <FiTrendingUp className="mr-2" />
                  <span className="text-sm font-medium">
                    Join 50,000+ learners worldwide
                  </span>
                </motion.div>

                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Learn Without
                  <span className="block text-yellow-400">Limits</span>
                </h1>
              </div>

              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                Discover thousands of courses from expert instructors and
                advance your skills at your own pace with hands-on projects and
                real-world applications.
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative max-w-md"
              >
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200 group"
                >
                  Start Learning
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200"
                >
                  Join Free
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {featuredCourse ? (
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="aspect-video relative mb-6 rounded-lg overflow-hidden">
                    <img
                      src={featuredCourse.thumbnail}
                      alt={featuredCourse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 mix-blend-multiply"></div>
                    <FiPlay className="absolute inset-0 m-auto text-white text-5xl z-10" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {featuredCourse.title}
                  </h3>
                  <p className="text-blue-100 mb-3 text-sm">
                    {featuredCourse.shortDescription}
                  </p>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`${
                            i < Math.round(featuredCourse.rating?.average || 0)
                              ? "text-yellow-400"
                              : "text-gray-400"
                          } fill-current`}
                          size={16}
                        />
                      ))}
                      <span className="ml-2 text-sm">
                        {featuredCourse.rating?.average?.toFixed(1) || "0.0"} (
                        {featuredCourse.rating?.count || 0})
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-white">
                      ₹{featuredCourse.price}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="mt-4 text-sm text-blue-100">
                    By{" "}
                    <span className="font-medium text-white">
                      {featuredCourse.instructor?.name || "Unknown Instructor"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-white text-lg">
                  No featured course available
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose from our wide range of course categories
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {category.count} courses
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover our most popular and highly-rated courses
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coursesData?.courses?.slice(0, 6).map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
            >
              View All Courses
              <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose EduSphere?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} text-white rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get answers to common questions about EduSphere
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <FiChevronRight className="text-gray-400 group-open:rotate-90 transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FiMail className="text-5xl mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Stay Updated with EduSphere
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get the latest course updates, learning tips, and exclusive offers
              delivered to your inbox
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto flex gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
              Join EduSphere today and unlock your potential with our expert-led
              courses, interactive learning, and recognized certificates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
              >
                <FiUser className="mr-2" />
                Get Started Free
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <FiBookOpen className="mr-2" />
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
