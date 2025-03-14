
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the dashboard as our main entry point
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Return a loading indicator while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-primary text-4xl font-bold mb-4">RoomBooker</div>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
