import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import useRazorpay from "../../hooks/useRazorpay";
import {
  FiStar,
  FiClock,
  FiUsers,
  FiPlay,
  FiBookOpen,
  FiAward,
  FiCheckCircle,
  FiHeart,
  FiShare2,
  FiDownload,
  FiX,
} from "react-icons/fi";
import {
  fetchCourse,
  enrollCourse,
  addReview,
} from "../../store/slices/courseSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ReviewForm from "../../components/courses/ReviewForm";
import ReviewList from "../../components/courses/ReviewList";
import CompletionCertificate from "../../components/courses/CompletionCertificate";

const CourseDetail = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const {
    initiatePayment,
    loading: paymentLoading,
    error: paymentError,
  } = useRazorpay();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentCourse: course,
    isLoading,
    error,
  } = useSelector((state) => state.courses);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id));
    }
  }, [dispatch, id, user]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `₹${price}`;
  };

  const isEnrolled = user?.enrolledCourses?.some(
    (enrollment) => enrollment.course._id === course?._id
  );

  const userProgress = course?.enrollmentInfo?.progress || 0;

  const canReview =
    isEnrolled &&
    !course?.reviews?.some((review) => review.user._id === user?._id);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If course is free, use existing enrollment logic
    if (course.price === 0) {
      try {
        await dispatch(enrollCourse(course._id)).unwrap();
        setPaymentSuccess(true);
      } catch (error) {
        console.error("Enrollment failed:", error);
      }
      return;
    }

    // If course is paid, initiate Razorpay payment
    try {
      const paymentResult = await initiatePayment(
        course._id,
        course.title,
        course.price
      );

      if (paymentResult.success) {
        console.log(paymentResult);
        const { razorpay_payment_id: paymentId, razorpay_order_id: orderId } =
          paymentResult.data;

        await dispatch(
          enrollCourse({ courseId: course._id, paymentId, orderId })
        ).unwrap();

        setPaymentSuccess(true);
        dispatch(fetchCourse(course._id));
      }
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const handleViewCertificate = () => {
    setShowCertificate(true);
  };

  const handleStartLearning = () => {
    navigate(`/courses/${course._id}/learn`);
  };

  const handleAddReview = async (reviewData) => {
    try {
      await dispatch(addReview({ courseId: course._id, reviewData })).unwrap();
      setShowReviewForm(false);
    } catch (error) {
      console.error("Review submission failed:", error);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error === "No token provided, access denied"
              ? "Login or Signup"
              : "Course not found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Certificate Modal */}
      {showCertificate && (
        <CompletionCertificate
          course={course}
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {course.category}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    course.level === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : course.level === "Intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl dark:text-gray-300 text-gray-600 mb-6">
                {course.shortDescription}
              </p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <FiStar
                    className="text-yellow-400 fill-current mr-1"
                    size={20}
                  />
                  <span className="font-semibold mr-1">
                    {course.rating?.average?.toFixed(1) || "0.0"}
                  </span>
                  <span className="dark:text-gray-300 text-gray-600">
                    ({course.rating?.count || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center dark:text-gray-300 text-gray-600">
                  <FiUsers size={20} className="mr-2" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center dark:text-gray-300 text-gray-600">
                  <FiClock size={20} className="mr-2" />
                  <span>{formatDuration(course.totalDuration || 0)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={
                    course.instructor?.avatar ||
                    "/placeholder.svg?height=48&width=48" ||
                    "/placeholder.svg"
                  }
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">
                    Created by {course.instructor?.name}
                  </p>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    {course.instructor?.bio || "Instructor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
                <div className="relative">
                  <img
                    src={
                      course.thumbnail ||
                      "/placeholder.svg?height=200&width=400" ||
                      "/placeholder.svg"
                    }
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button
                      onClick={() =>
                        course.lessons?.[0] &&
                        setSelectedLesson(course.lessons[0])
                      }
                      className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
                    >
                      <FiPlay className="text-gray-900 text-xl ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(course.price)}
                    </span>
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      {userProgress === 100 ? (
                        // Course completed
                        <div className="flex items-center justify-center p-3 bg-green-200 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                          <FiCheckCircle className="mr-2" />
                          <span className="font-medium">Course completed!</span>
                        </div>
                      ) : (
                        // Course in progress
                        <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                          <FiCheckCircle className="mr-2" />
                          <span className="font-medium">You're enrolled!</span>
                        </div>
                      )}
                      {/* Progress bar */}
                      {userProgress > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${userProgress}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Action button based on completion status */}
                      {userProgress === 100 ? (
                        <div className="space-y-2">
                          <button
                            onClick={handleStartLearning} // This can redirect to course review/replay
                            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            Review Course
                          </button>
                          <button
                            onClick={handleViewCertificate}
                            className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
                          >
                            <FiAward className="inline mr-2" size={16} />
                            View Certificate
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleStartLearning}
                          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          {userProgress > 0
                            ? "Continue Learning"
                            : "Start Learning"}
                        </button>
                      )}
                    </div>
                  ) : (
                    // <button
                    //   onClick={handleEnroll}
                    //   className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-4"
                    // >
                    //   {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                    // </button>
                    <div className="space-y-4">
                      {/* Payment Success Message */}
                      {paymentSuccess && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-center">
                          <FiCheckCircle className="inline mr-2" />
                          Payment successful! Enrollment completed.
                        </div>
                      )}

                      {/* Payment Error Message */}
                      {paymentError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-center">
                          <span className="text-sm">{paymentError}</span>
                        </div>
                      )}

                      {/* Enrollment Button */}
                      <button
                        onClick={handleEnroll}
                        disabled={paymentLoading}
                        className={`w-full py-3 font-semibold rounded-lg transition-colors duration-200 ${
                          paymentLoading
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {paymentLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : course.price === 0 ? (
                          "Enroll for Free"
                        ) : (
                          `Pay ₹${course.price} & Enroll`
                        )}
                      </button>

                      {/* Security Badge for Paid Courses */}
                      {course.price > 0 && (
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                          <span className="mr-1">🔒</span>
                          Secured by Razorpay
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleWishlist}
                      className={`flex items-center transition-colors duration-200 ${
                        isWishlisted
                          ? "text-red-500"
                          : "text-gray-600 dark:text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <FiHeart
                        className={`mr-1 ${isWishlisted ? "fill-current" : ""}`}
                      />
                      <span className="text-sm">Wishlist</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    >
                      <FiShare2 className="mr-1" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Course Features */}
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      This course includes:
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiPlay className="mr-2" size={16} />
                        <span>{course.lessons?.length || 0} video lessons</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2" size={16} />
                        <span>
                          {formatDuration(course.totalDuration || 0)} total
                          content
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiDownload className="mr-2" size={16} />
                        <span>Downloadable resources</span>
                      </div>
                      <div className="flex items-center">
                        <FiAward className="mr-2" size={16} />
                        <span>Certificate of completion</span>
                        {userProgress === 100 && (
                          <button
                            onClick={handleViewCertificate}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            (View)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex space-x-8">
                {["overview", "lessons", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      About this course
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* What you'll learn */}
                  {course.whatYouWillLearn &&
                    course.whatYouWillLearn.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          What you'll learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {course.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-start">
                              <FiCheckCircle
                                className="text-green-500 mr-3 mt-1 flex-shrink-0"
                                size={16}
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {course.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {requirement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "lessons" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Course Content
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.lessons?.length || 0} lessons •{" "}
                      {formatDuration(course.totalDuration || 0)}
                    </div>
                  </div>

                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="space-y-4">
                      {course.lessons.map((lesson, index) => (
                        <motion.div
                          key={lesson._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {lesson.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDuration(lesson.duration)}
                                </span>
                                {isEnrolled ? (
                                  <button
                                    onClick={() => setSelectedLesson(lesson)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                  >
                                    <FiPlay className="inline mr-1" size={14} />
                                    Watch
                                  </button>
                                ) : (
                                  <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-400">
                                      🔒
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiBookOpen
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <p className="text-gray-600 dark:text-gray-400">
                        No lessons available yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Student Reviews
                    </h3>
                    {canReview && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {showReviewForm && (
                    <div className="mb-8">
                      <ReviewForm
                        onSubmit={handleAddReview}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  <ReviewList reviews={course.reviews || []} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Course Stats
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Students Enrolled
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {course.enrolledStudents?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Lessons
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {course.lessons?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Duration
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDuration(course.totalDuration || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Average Rating
                  </span>
                  <div className="flex items-center">
                    <FiStar
                      className="text-yellow-400 fill-current mr-1"
                      size={16}
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {course.rating?.average?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Language
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {course.language || "English"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedLesson.title}
              </h3>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="aspect-video">
              <ReactPlayer
                url={selectedLesson.videoUrl}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: {
                    playerVars: { showinfo: 1 },
                  },
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedLesson.description}
              </p>
              {selectedLesson.resources &&
                selectedLesson.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Resources
                    </h4>
                    <div className="space-y-2">
                      {selectedLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <FiDownload className="mr-2" size={16} />
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
