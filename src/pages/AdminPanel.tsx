
import { Layout } from "@/components/layout/Layout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is authenticated and has admin role
  const isAdmin = user?.role === "admin";
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Layout title="Access Denied">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access the admin panel.
            Please contact an administrator if you need access.
          </p>
          <img 
            src="https://placehold.co/400x300/EF4444/FFFFFF?text=Access+Denied" 
            alt="Access Denied" 
            className="rounded-lg max-w-md w-full h-auto opacity-80"
          />
        </div>
      </Layout>
    );
  }

  // Admin dashboard
  return (
    <Layout title="Admin Panel">
      <AdminDashboard />
    </Layout>
  );
}
