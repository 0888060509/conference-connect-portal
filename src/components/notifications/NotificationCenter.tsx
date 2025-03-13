
import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Bell, MailOpen, Settings, CheckSquare, Calendar, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, Notification, NotificationType } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmation':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'booking_reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'booking_modification':
        return <Settings className="h-4 w-4 text-amber-500" />;
      case 'booking_cancellation':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'admin_request':
      case 'admin_issue':
        return <MailOpen className="h-4 w-4 text-purple-500" />;
      case 'booking_conflict':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } else {
      return format(timestamp, "MMM d, h:mm a");
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-2 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-10 p-1 bg-muted/30">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="p-0 m-0">
            <NotificationList 
              notifications={notifications} 
              onNotificationClick={handleNotificationClick} 
              getNotificationIcon={getNotificationIcon}
              getNotificationTime={getNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="p-0 m-0">
            <NotificationList 
              notifications={notifications.filter(n => !n.read)} 
              onNotificationClick={handleNotificationClick} 
              getNotificationIcon={getNotificationIcon}
              getNotificationTime={getNotificationTime}
            />
          </TabsContent>
          
          <TabsContent value="important" className="p-0 m-0">
            <NotificationList 
              notifications={notifications.filter(n => 
                n.type === 'booking_conflict' || n.type === 'admin_issue'
              )} 
              onNotificationClick={handleNotificationClick} 
              getNotificationIcon={getNotificationIcon}
              getNotificationTime={getNotificationTime}
            />
          </TabsContent>
        </Tabs>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild className="p-2 justify-center">
          <Link to="/notifications" className="w-full text-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="p-2 justify-center">
          <Link to="/notification-preferences" className="w-full text-center flex items-center justify-center">
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: NotificationType) => React.ReactNode;
  getNotificationTime: (timestamp: Date) => string;
}

function NotificationList({ 
  notifications, 
  onNotificationClick,
  getNotificationIcon,
  getNotificationTime
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No notifications found</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[300px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
            !notification.read ? "bg-muted/20" : ""
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 space-y-1">
            <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">
              {getNotificationTime(notification.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}
