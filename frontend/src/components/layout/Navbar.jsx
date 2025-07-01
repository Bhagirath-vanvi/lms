import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiPlus,
  FiBarChart2,
} from "react-icons/fi";

import { logout } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/uiSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdown(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    ...(isAuthenticated
      ? [
          { name: "Dashboard", path: "/dashboard" },

          ...(user?.role === "instructor" || user?.role === "admin"
            ? [
                { name: "My Courses", path: "/instructor/my-courses" },
                { name: "Create Course", path: "/instructor/create-course" },
              ]
            : [{ name: "My Courses", path: "/my-courses" }]),
        ]
      : []),
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FiBookOpen className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EduSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActivePath(link.path)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {isAuthenticated ? (
              /* Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user?.role}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiUser className="mr-3" />
                        Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiBarChart2 className="mr-3" />
                        Dashboard
                      </Link>

                      {(user?.role === "instructor" ||
                        user?.role === "admin") && (
                        <Link
                          to="/instructor/create-course"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiPlus className="mr-3" />
                          Create Course
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FiLogOut className="mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActivePath(link.path)
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-1">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
