import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiUserCheck,
} from "react-icons/fi";
import { register, clearError } from "../../store/slices/authSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      dispatch(register(submitData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 mb-6"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FiBookOpen className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              EduSphere
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.name
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.email
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    formData.role === "student"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <FiUser className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Learn
                    </span>
                  </div>
                </label>
                <label
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    formData.role === "instructor"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={formData.role === "instructor"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <FiUserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Teach
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.password
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    errors.confirmPassword
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              "Create Account"
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register;
