import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

export default function PrivateRoute({ requireAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  //Improved loading state handling to prevent redirect loops.
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}