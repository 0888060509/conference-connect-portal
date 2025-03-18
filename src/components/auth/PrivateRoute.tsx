
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";

// Development bypass flag - set to true to bypass authentication
const BYPASS_AUTH = true;

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

export default function PrivateRoute({ requireAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [renderCount, setRenderCount] = useState(0);

  // Log the render count to identify infinite loops
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`PrivateRoute rendering count: ${renderCount + 1}`);
    
    if (renderCount > 10) {
      console.warn("PrivateRoute rendering too many times - possible infinite loop");
    }
  }, [renderCount]);

  console.log("PrivateRoute rendering with:", {
    isLoading,
    isAuthenticated,
    currentPath: location.pathname,
    user: user ? 'User exists' : 'No user',
    bypassEnabled: BYPASS_AUTH
  });

  // Allow direct access if bypass is enabled
  if (BYPASS_AUTH) {
    console.log("Auth bypass enabled - granting access to protected route");
    return <Outlet />;
  }

  // Only redirect if not loading and not authenticated
  if (!isLoading && !isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-primary text-4xl font-bold mb-8">RoomBooker</div>
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-primary w-2/3 animate-pulse rounded-full"></div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded-md animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-100 rounded-md animate-pulse w-1/2"></div>
              <div className="h-10 bg-gray-100 rounded-md animate-pulse w-1/2"></div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying credentials...
          </div>
        </div>
      </div>
    );
  }

  // Check if admin is required but user is not an admin
  if (requireAdmin && user?.role !== 'admin') {
    console.log("Admin required but user is not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("Authentication check complete: ", { isAuthenticated, userRole: user?.role });
  console.log("User is authenticated, rendering protected content");
  
  return <Outlet />;
}
