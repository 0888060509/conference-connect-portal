
import { Link } from "react-router-dom";
import { MenuIcon, ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  title?: string;
}

export function Header({ isSidebarCollapsed, toggleSidebar, title }: HeaderProps) {
  const { user, logout } = useAuth();

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/help">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Help Center</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help Center</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <NotificationCenter />

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
                  <Link to="/notification-preferences">Notification Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help">Help Center</Link>
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
