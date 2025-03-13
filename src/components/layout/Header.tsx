
import { useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon, BellIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  title?: string;
}

export function Header({ isSidebarCollapsed, toggleSidebar, title }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New booking request", read: false },
    { id: 2, text: "Room 101 maintenance scheduled", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 border-b bg-background transition-all duration-300",
      isSidebarCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto text-xs p-1"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-3 px-2 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer p-3">
                    <div>
                      <p className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}>
                        {notification.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer justify-center">
                <Link to="/notifications" className="text-sm font-medium">
                  View all
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      alt={user.name} 
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
