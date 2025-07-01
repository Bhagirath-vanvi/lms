import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
