
import Index from "../pages/Index";
import Dashboard from "../pages/Dashboard";
import Bookings from "../pages/Bookings";
import MyBookings from "../pages/MyBookings";
import Calendar from "../pages/Calendar";
import Rooms from "../pages/Rooms";
import RoomDetail from "../pages/RoomDetail";
import Profile from "../pages/Profile";
import Reports from "../pages/Reports";
import HelpCenter from "../pages/HelpCenter";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import ResetPasswordPage from "../pages/auth/reset-password/ResetPasswordPage";
import Landing from "../pages/Landing";
import Notifications from "../pages/Notifications";
import NotificationPreferences from "../pages/NotificationPreferences";
import AdminPanel from "../pages/AdminPanel";
import RoomAdmin from "../pages/RoomAdmin";
import SystemSettings from "../pages/SystemSettings";
import WaitlistAdmin from "../pages/WaitlistAdmin";
import ConflictRulesAdmin from "../pages/ConflictRulesAdmin";

export const routes = {
  public: [
    { path: "/", element: Index },
    { path: "/login", element: Login },
    { path: "/reset-password", element: ResetPasswordPage },
    { path: "*", element: NotFound },
  ],
  protected: [
    { path: "/dashboard", element: Dashboard },
    { path: "/bookings", element: Bookings },
    { path: "/my-bookings", element: MyBookings },
    { path: "/calendar", element: Calendar },
    { path: "/rooms", element: Rooms },
    { path: "/rooms/:id", element: RoomDetail },
    { path: "/reports", element: Reports },
    { path: "/profile", element: Profile },
    { path: "/notifications", element: Notifications },
    { path: "/notification-preferences", element: NotificationPreferences },
    { path: "/help", element: HelpCenter },
  ],
  admin: [
    { path: "/admin", element: AdminPanel },
    { path: "/admin/rooms", element: RoomAdmin },
    { path: "/admin/settings", element: SystemSettings },
    { path: "/admin/waitlist", element: WaitlistAdmin },
    { path: "/admin/conflict-rules", element: ConflictRulesAdmin },
  ],
};
