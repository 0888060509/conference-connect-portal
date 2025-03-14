
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

const PrivateRoute = ({ requireAdmin = false }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log("PrivateRoute rendering with:", {
    isLoading,
    isAuthenticated,
    currentPath: location.pathname,
    user: user ? "User exists" : "No user"
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  console.log("User is authenticated, rendering protected content");
  return <Outlet />;
};

export default PrivateRoute;
