"use client";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import StudentDashboard from "../../components/dashboard/StudentDashboard";
import InstructorDashboard from "../../components/dashboard/InstructorDashboard";
import AdminDashboard from "../../components/dashboard/AdminDashboard";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Dashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "instructor":
        return <InstructorDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {renderDashboard()}
    </motion.div>
  );
};

export default Dashboard;
