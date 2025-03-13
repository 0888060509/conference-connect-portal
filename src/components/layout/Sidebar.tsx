
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Building, 
  Users, 
  Settings, 
  Menu, 
  X, 
  Home, 
  BarChart,
  CalendarDays
} from "lucide-react";

type NavItem = {
  icon: typeof Home;
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Calendar, label: "Bookings", href: "/bookings" },
  { icon: CalendarDays, label: "Calendar", href: "/calendar" },
  { icon: Building, label: "Rooms", href: "/rooms" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: BarChart, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ collapsed, toggleSidebar }: SidebarProps) {
  return (
    <div
      className={cn(
        "h-screen bg-sidebar fixed left-0 z-40 transition-all duration-300 border-r border-sidebar-border flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-sidebar-foreground font-bold text-xl">
            MeetingMaster
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-4 py-2 mx-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              window.location.pathname === item.href && "bg-sidebar-accent"
            )}
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-semibold">
            U
          </div>
          {!collapsed && (
            <div className="ml-3 text-sidebar-foreground">
              <div className="font-medium">User Name</div>
              <div className="text-xs opacity-70">user@company.com</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
