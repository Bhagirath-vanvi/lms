"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiDownload, FiAward } from "react-icons/fi";
import jsPDF from "jspdf";

const CompletionCertificate = ({ course, user, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Certificate background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 297, 210, "F");

      // Border
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(3);
      pdf.rect(10, 10, 277, 190);

      // Inner border
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(1);
      pdf.rect(15, 15, 267, 180);

      // Title
      pdf.setFontSize(36);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "bold");
      pdf.text("Certificate of Completion", 148.5, 50, { align: "center" });

      // Subtitle
      pdf.setFontSize(16);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont("helvetica", "normal");
      pdf.text("This is to certify that", 148.5, 70, { align: "center" });

      // Student name
      pdf.setFontSize(28);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont("helvetica", "bold");
      pdf.text(user?.name || "Student", 148.5, 90, { align: "center" });

      // Course completion text
      pdf.setFontSize(16);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont("helvetica", "normal");
      pdf.text("has successfully completed the course", 148.5, 110, {
        align: "center",
      });

      // Course title
      pdf.setFontSize(22);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "bold");
      const courseTitle = course?.title || "Course Title";
      pdf.text(courseTitle, 148.5, 130, { align: "center" });

      // Completion date
      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont("helvetica", "normal");
      const completionDate = course?.enrollmentInfo?.completedAt
        ? new Date(course.enrollmentInfo.completedAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
      pdf.text(`Completed on ${completionDate}`, 148.5, 150, {
        align: "center",
      });

      // Instructor signature line
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text("Instructor:", 50, 175);
      pdf.text(course?.instructor?.name || "Instructor", 50, 185);

      // Certificate ID
      const certificateId = `CERT-${course?._id?.slice(-8) || "12345678"}-${
        user?._id?.slice(-8) || "87654321"
      }`;
      pdf.text(`Certificate ID: ${certificateId}`, 200, 175);

      // Award icon (simplified)
      pdf.setDrawColor(59, 130, 246);
      pdf.setFillColor(59, 130, 246);
      pdf.circle(148.5, 35, 8, "FD");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text("★", 148.5, 38, { align: "center" });

      // Save the PDF
      pdf.save(`${courseTitle}-Certificate.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiAward className="mr-3 text-green-500" />
            Certificate of Completion
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 border-4 border-blue-200 dark:border-blue-400 rounded-lg p-12 text-center">
            {/* Award Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <FiAward className="text-white text-2xl" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              Certificate of Completion
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              This is to certify that
            </p>

            {/* Student Name */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-2 border-gray-300 dark:border-gray-500 pb-2 inline-block">
              {user?.name || "Student Name"}
            </h2>

            {/* Course Completion Text */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              has successfully completed the course
            </p>

            {/* Course Title */}
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">
              {course?.title || "Course Title"}
            </h3>

            {/* Completion Details */}
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div>
                <p className="font-semibold">Instructor:</p>
                <p>{course?.instructor?.name || "Instructor Name"}</p>
              </div>
              <div>
                <p className="font-semibold">Completion Date:</p>
                <p>
                  {course?.enrollmentInfo?.completedAt
                    ? new Date(
                        course.enrollmentInfo.completedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </p>
              </div>
              <div>
                <p className="font-semibold">Certificate ID:</p>
                <p className="font-mono">
                  CERT-{course?._id?.slice(-8) || "12345678"}-
                  {user?._id?.slice(-8) || "87654321"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload className="mr-2" size={16} />
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompletionCertificate;
