"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { useEffect } from "react";

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: <FiCheck className="w-5 h-5" />,
    error: <FiX className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-full"
    >
      <div className="flex items-start">
        <div
          className={`flex-shrink-0 ${
            styles[toast.type]
          } rounded-full p-1 text-white`}
        >
          {icons[toast.type]}
        </div>
        <div className="ml-3 w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {toast.title}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {toast.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onRemove(toast.id)}
            className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
