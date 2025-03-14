
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add a slight delay to make sure everything is properly initialized
    const timer = setTimeout(() => {
      // Redirect to the dashboard as our main entry point
      console.log("Redirecting from Index to dashboard");
      navigate("/dashboard", { replace: true });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  // Return a loading indicator while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-primary text-4xl font-bold mb-4">RoomBooker</div>
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
        <p className="mt-4 text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
