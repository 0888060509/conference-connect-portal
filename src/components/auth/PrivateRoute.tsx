
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

const PrivateRoute = ({ requireAdmin = false }: PrivateRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default PrivateRoute;
