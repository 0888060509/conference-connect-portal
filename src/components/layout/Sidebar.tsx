
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, Calendar, BookOpen, Building2, UserCircle, Bell, Settings, 
  ChevronLeft, ChevronRight, LayoutDashboard, User, HelpCircle, BarChart,
  List, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  path: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ icon: Icon, label, path, active, collapsed }: NavItemProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild disabled={!collapsed}>
          <Link to={path}>
            <Button variant="ghost" className={cn(
              "w-full justify-start gap-2 rounded-md px-2.5 py-2 hover:bg-secondary/50",
              active ? "bg-secondary text-secondary-foreground hover:bg-secondary" : "text-muted-foreground",
              collapsed && "justify-center p-2.5"
            )}>
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="w-auto">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Sidebar({ collapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 h-full border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <BookOpen className="h-6 w-6 text-primary" />
          {!collapsed && <span className="text-lg font-semibold">RoomBooker</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("ml-auto", collapsed && "hidden md:flex")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4">
          <TooltipProvider delayDuration={0}>
            <nav className="space-y-1.5">
              <NavItem
                icon={Home}
                label="Dashboard"
                path="/dashboard"
                active={isActive("/dashboard")}
                collapsed={collapsed}
              />
              <NavItem
                icon={Calendar}
                label="Calendar"
                path="/calendar"
                active={isActive("/calendar")}
                collapsed={collapsed}
              />
              <NavItem
                icon={BookOpen}
                label="Bookings"
                path="/bookings"
                active={isActive("/bookings")}
                collapsed={collapsed}
              />
              <NavItem
                icon={User}
                label="My Bookings"
                path="/my-bookings"
                active={isActive("/my-bookings")}
                collapsed={collapsed}
              />
              <NavItem
                icon={Building2}
                label="Rooms"
                path="/rooms"
                active={isActive("/rooms")}
                collapsed={collapsed}
              />
              <NavItem
                icon={BarChart}
                label="Reports"
                path="/reports"
                active={isActive("/reports")}
                collapsed={collapsed}
              />
              <NavItem
                icon={Bell}
                label="Notifications"
                path="/notifications"
                active={isActive("/notifications")}
                collapsed={collapsed}
              />
              <NavItem
                icon={HelpCircle}
                label="Help Center"
                path="/help"
                active={isActive("/help")}
                collapsed={collapsed}
              />
              <NavItem
                icon={UserCircle}
                label="Profile"
                path="/profile"
                active={isActive("/profile")}
                collapsed={collapsed}
              />

              {user && user.role === "admin" && (
                <>
                  <div
                    className={cn(
                      "my-4 px-3 text-xs font-medium text-muted-foreground",
                      collapsed && "text-center"
                    )}
                  >
                    {!collapsed && "ADMIN"}
                    {collapsed && "•••"}
                  </div>
                  <NavItem
                    icon={LayoutDashboard}
                    label="Admin Panel"
                    path="/admin"
                    active={isActive("/admin")}
                    collapsed={collapsed}
                  />
                  <NavItem
                    icon={Settings}
                    label="Settings"
                    path="/admin/settings"
                    active={isActive("/admin/settings")}
                    collapsed={collapsed}
                  />
                  <NavItem
                    icon={List}
                    label="Waitlist"
                    path="/admin/waitlist"
                    active={isActive("/admin/waitlist")}
                    collapsed={collapsed}
                  />
                  <NavItem
                    icon={AlertTriangle}
                    label="Conflict Rules"
                    path="/admin/conflict-rules"
                    active={isActive("/admin/conflict-rules")}
                    collapsed={collapsed}
                  />
                </>
              )}
            </nav>
          </TooltipProvider>
        </div>
      </ScrollArea>
    </aside>
  );
}
