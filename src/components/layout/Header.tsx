
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  title?: string;
}

export function Header({ isSidebarCollapsed, toggleSidebar, title = "Dashboard" }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className={cn(
      "h-16 border-b fixed top-0 right-0 bg-background z-30 transition-all duration-300 flex items-center justify-between px-4",
      isSidebarCollapsed ? "left-16" : "left-64"
    )}>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-accent"></span>
        </Button>
        
        <Button variant="default" className="bg-secondary hover:bg-secondary-light hidden md:flex">
          + Create Booking
        </Button>
      </div>
    </header>
  );
}
