
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to the dashboard as our main entry point
  return <Navigate to="/dashboard" replace />;
};

export default Index;
