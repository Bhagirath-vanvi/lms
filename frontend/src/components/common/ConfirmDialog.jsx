"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <FiAlertTriangle
            className="text-red-600 dark:text-red-400"
            size={24}
          />
        );
      case "info":
        return (
          <FiInfo className="text-blue-600 dark:text-blue-400" size={24} />
        );
      default:
        return (
          <FiAlertTriangle
            className="text-yellow-600 dark:text-yellow-400"
            size={24}
          />
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
      default:
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm dark:bg-opacity-60"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-[101] w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                {getIcon()}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
