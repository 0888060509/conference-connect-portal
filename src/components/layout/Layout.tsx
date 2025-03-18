
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <Header 
        isSidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        title={title}
      />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
