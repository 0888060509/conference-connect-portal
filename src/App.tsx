
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import MyBookings from "./pages/MyBookings";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Calendar from "./pages/Calendar";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import RoomAdmin from "./pages/RoomAdmin";
import SystemSettings from "./pages/SystemSettings";
import Notifications from "./pages/Notifications";
import NotificationPreferences from "./pages/NotificationPreferences";

const queryClient = new QueryClient();

// For demo purposes, toggle this to show the Landing or App
const SHOW_LANDING = false;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {SHOW_LANDING ? (
                <Route path="/" element={<Landing />} />
              ) : (
                <>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/rooms/:id" element={<RoomDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/notification-preferences" element={<NotificationPreferences />} />
                  </Route>
                  
                  {/* Admin-only routes */}
                  <Route element={<PrivateRoute requireAdmin={true} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/rooms" element={<RoomAdmin />} />
                    <Route path="/admin/settings" element={<SystemSettings />} />
                  </Route>
                </>
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
