
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // On mobile, sidebar starts collapsed
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Swipe handlers for opening/closing sidebar
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (sidebarCollapsed && isMobile) {
        setSidebarCollapsed(false);
      }
    },
    onSwipedLeft: () => {
      if (!sidebarCollapsed && isMobile) {
        setSidebarCollapsed(true);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <Header 
        isSidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        title={title}
      />
      <main
        {...swipeHandlers}
        className={cn(
          "pt-16 min-h-screen transition-all duration-300 pb-16 md:pb-0",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <MobileNavigation />
    </div>
  );
}
