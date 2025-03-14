
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

const PrivateRoute = ({ requireAdmin = false }: PrivateRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Add more debug logs to trace the issue
  console.log("PrivateRoute rendering with:", { 
    isLoading, 
    isAuthenticated, 
    currentPath: location.pathname,
    user: user ? 'User exists' : 'No user'
  });
  // Fallback condition for loading state
  if (isLoading) {
    console.log("isLoading is stuck, bypassing for debugging");
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if admin access is required but the user is not an admin
  if (requireAdmin && user?.role !== "admin") {
    console.log("Admin access required but user is not admin");
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  console.log("User is authenticated, rendering protected content");
  return children;
  // Show a better loading state with progress and skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">RoomBooker</h2>
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
        <Progress value={65} className="w-full max-w-md mb-6" />
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <Spinner size="sm" />
          <p className="text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  console.log("Authentication check complete:", { isAuthenticated, userRole: user?.role });
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin && user?.role !== "admin") {
    console.log("Admin access required but user is not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  console.log("User is authenticated, rendering protected content");
  return <Outlet />;
};

export default PrivateRoute;
