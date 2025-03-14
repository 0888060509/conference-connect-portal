import React, { ReactNode } from "react";
import { SystemAnnouncement } from "@/components/realtime/SystemAnnouncement";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header, navigation, etc. would be here */}
      <div className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        
        {/* System announcements appear at the top of every page */}
        <div className="mb-4">
          <SystemAnnouncement />
        </div>
        
        {children}
      </div>
      {/* Footer would be here */}
    </div>
  );
}
