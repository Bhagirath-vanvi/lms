import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "medium", color = "blue" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
