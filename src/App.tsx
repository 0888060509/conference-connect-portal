
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
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
import WaitlistAdmin from "./pages/WaitlistAdmin";
import ConflictRulesAdmin from "./pages/ConflictRulesAdmin";
import HelpCenter from "./pages/HelpCenter";
import Reports from "./pages/Reports";
import { useEffect } from "react";
import { requestNotificationPermission } from "./utils/notificationUtils";
import ResetPasswordPage from "./pages/auth/reset-password/ResetPasswordPage";
import { initDataSync } from "./lib/data-sync";

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - replaced cacheTime with gcTime
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// For demo purposes, toggle this to show the Landing or App
const SHOW_LANDING = false;

const App = () => {
  // Request notification permission when the app starts
  useEffect(() => {
    const requestPermissions = async () => {
      await requestNotificationPermission();
    };
    
    requestPermissions();
    
    // Initialize data synchronization
    initDataSync();
    
    // Add manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NetworkProvider>
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
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      
                      {/* Protected routes */}
                      <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/my-bookings" element={<MyBookings />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="/rooms/:id" element={<RoomDetail />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/notification-preferences" element={<NotificationPreferences />} />
                        <Route path="/help" element={<HelpCenter />} />
                      </Route>
                      
                      {/* Admin-only routes */}
                      <Route element={<PrivateRoute requireAdmin={true} />}>
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/admin/rooms" element={<RoomAdmin />} />
                        <Route path="/admin/settings" element={<SystemSettings />} />
                        <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
                        <Route path="/admin/conflict-rules" element={<ConflictRulesAdmin />} />
                      </Route>
                    </>
                  )}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </NetworkProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
