
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, BookOpen, Home, Search, User, LayoutGrid } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
}

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  const navItems: NavItem[] = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Rooms", icon: LayoutGrid, path: "/rooms" },
    { name: "Bookings", icon: BookOpen, path: "/my-bookings" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  // Add admin section if user is admin
  // Check for admin role in a safer way
  if (user && (user as any).isAdmin) {
    navItems.push({ 
      name: "Admin", 
      icon: Search, 
      path: "/admin", 
      adminOnly: true 
    });
  }

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.name}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                "text-xs transition-colors duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
