import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "./hooks/useTheme";
import { loadUser } from "./store/slices/authSlice";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useEffect } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Profile from "./pages/Profile";
import Courses from "./pages/courses/Courses";
import CourseDetail from "./pages/courses/CourseDetail";
import CreateCourse from "./pages/instructor/CreateCourse";
import MyCourses from "./pages/instructor/MyCourses";
import ErrorBoundary from "./components/common/ErrorBoundary";
import CourseLearning from "./pages/courses/CourseLearning";
import EditCourse from "./pages/instructor/EditCourse";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import EnrolledCourses from "./pages/courses/EnrolledCourses";
import CertificatePage from "./pages/CertificatePage";
import CourseAnalytics from "./pages/instructor/CourseAnalytics";
import AdminReports from "./pages/admin/AdminReport";

function App() {
  const dispatch = useDispatch();

  const { isLoading } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  return (
    // <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    //   <Navbar />
    // <Toaster
    //   position="top-right"
    //   toastOptions={{
    //     duration: 4000,
    //     style: {
    //       background: "#363636",
    //       color: "#fff",
    //     },
    //     success: {
    //       duration: 3000,
    //       theme: {
    //         primary: "#4aed88",
    //       },
    //     },
    //   }}
    // />
    //   <AnimatePresence mode="wait">
    //     <motion.main
    //       initial={{ opacity: 0, y: 20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       exit={{ opacity: 0, y: -20 }}
    //       transition={{ duration: 0.3 }}
    //       className="min-h-screen"
    //     >
    //       <Routes>
    //         {/* Public Routes */}
    //         <Route path="/" element={<Home />} />
    //         <Route path="/login" element={<Login />} />
    //         <Route path="/register" element={<Register />} />
    //         <Route path="/courses" element={<Courses />} />
    //         <Route path="/courses/:id" element={<CourseDetail />} />

    //         {/* Protected Routes */}
    //         <Route
    //           path="/dashboard"
    //           element={
    //             <ProtectedRoute>
    //               <Dashboard />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path="/profile"
    //           element={
    //             <ProtectedRoute>
    //               <Profile />
    //             </ProtectedRoute>
    //           }
    //         />

    //         {/* Instructor Routes */}
    //         <Route
    //           path="/instructor/create-course"
    //           element={
    //             <ProtectedRoute roles={["instructor", "admin"]}>
    //               <CreateCourse />
    //             </ProtectedRoute>
    //           }
    //         />
    //         <Route
    //           path="/instructor/my-courses"
    //           element={
    //             <ProtectedRoute roles={["instructor", "admin"]}>
    //               <MyCourses />
    //             </ProtectedRoute>
    //           }
    //         />
    //       </Routes>
    //     </motion.main>
    //   </AnimatePresence>
    //   <Footer />
    // </div>
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
        <Navbar />

        <AnimatePresence mode="wait">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex-1"
          >
            {/* <main className="flex-1"> */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/learn"
                element={
                  <ProtectedRoute>
                    <CourseLearning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <EnrolledCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates/:courseId"
                element={
                  <ProtectedRoute>
                    <CertificatePage />
                  </ProtectedRoute>
                }
              />

              {/* Instructor Routes */}
              <Route
                path="/instructor/create-course"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/my-courses"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <MyCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <EditCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/courses/:id/analytics"
                element={
                  <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                    <CourseAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
            </Routes>
            {/* </main> */}
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>

      {/* Toast Notifications */}
      {/* <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-color)",
          },
        }}
      /> */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
