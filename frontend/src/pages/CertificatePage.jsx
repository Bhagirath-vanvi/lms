import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiAward,
  FiDownload,
  FiShare2,
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiBookOpen,
  FiClock,
} from "react-icons/fi";
import { fetchCourse } from "../store/slices/courseSlice";
import CompletionCertificate from "../components/courses/CompletionCertificate";
import LoadingSpinner from "../components/common/LoadingSpinner";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const CertificatePage = () => {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentCourse: course, isLoading } = useSelector(
    (state) => state.courses
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId));
    }
  }, [dispatch, courseId]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    // Your existing PDF generation logic here
    // ... (same as in CompletionCertificate component)
    setIsGeneratingPDF(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${course?.title}`,
          text: `I've completed ${course?.title}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Certificate link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!course || !course.enrollmentInfo?.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Certificate Not Available</h2>
          <p className="text-gray-600 mb-4">
            Complete the course to earn your certificate.
          </p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  const completionDate = new Date(
    course.enrollmentInfo.completedAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certificateId = `CERT-${course._id.slice(-8)}-${user._id.slice(-8)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Certificate Modal */}
      {showCertificateModal && (
        <CompletionCertificate
          course={course}
          user={user}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <FiArrowLeft className="mr-2" size={20} />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Certificate of Completion
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {course.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FiShare2 className="mr-2" size={16} />
                Share
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FiDownload className="mr-2" size={16} />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Certificate Design */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-4 border-blue-200 dark:border-blue-400 p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiAward className="text-white text-2xl" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  Certificate of Completion
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This is to certify that
                </p>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-gray-300 dark:border-gray-500 pb-2 inline-block">
                  {user.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  has successfully completed the course
                </p>

                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-8">
                  {course.title}
                </h4>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <p className="font-semibold">Instructor:</p>
                    <p>{course.instructor?.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Completed:</p>
                    <p>{completionDate}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Certificate ID:</p>
                    <p className="font-mono">{certificateId}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-center">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View Printable Version
                </button>
              </div>
            </motion.div>
          </div>

          {/* Course Details & Stats */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <FiBookOpen className="mr-3 text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.lessons?.length || 0} Lessons
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <FiClock className="mr-3 text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {Math.round(course.duration / 60)} hours
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <FiUser className="mr-3 text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.instructor?.name}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <FiCalendar className="mr-3 text-gray-400" size={16} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Completed on {completionDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Achievement
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Lessons Completed
                  </span>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {course.lessons?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Certificate ID
                  </span>
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {certificateId}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FiBookOpen className="mr-2" size={16} />
                  Review Course
                </button>
                <button
                  onClick={() => navigate("/courses")}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Explore More Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
