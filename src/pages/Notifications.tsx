import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckSquare,
  Clock,
  Settings,
  AlertTriangle,
  MailOpen,
  Calendar,
  Search,
  Filter,
  Trash,
  Users,
} from "lucide-react";
import { useNotifications, Notification, NotificationType } from "@/contexts/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OnlineUsers } from "@/components/realtime/OnlineUsers";

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const allNotifications = [...notifications, ...realTimeNotifications];
  
  useEffect(() => {
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        const newNotification = payload.new as Notification;
        
        toast({
          title: "New Notification",
          description: newNotification.message,
          duration: 5000,
        });
        
        setRealTimeNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
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
  
  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmation':
        return "Confirmation";
      case 'booking_reminder':
        return "Reminder";
      case 'booking_modification':
        return "Modification";
      case 'booking_cancellation':
        return "Cancellation";
      case 'admin_request':
        return "Request";
      case 'admin_issue':
        return "Issue";
      case 'booking_conflict':
        return "Conflict";
      default:
        return type;
    }
  };
  
  const getNotificationTypeVariant = (type: NotificationType): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'booking_confirmation':
        return "secondary";
      case 'booking_reminder':
        return "outline";
      case 'booking_modification':
        return "outline";
      case 'booking_cancellation':
        return "destructive";
      case 'admin_request':
        return "secondary";
      case 'admin_issue':
        return "destructive";
      case 'booking_conflict':
        return "destructive";
      default:
        return "default";
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  const filterNotifications = (notifications: Notification[]) => {
    return notifications
      .filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(notification => {
        if (selectedFilter === "all") return true;
        if (selectedFilter === "unread") return !notification.read;
        if (selectedFilter === "read") return notification.read;
        return notification.type === selectedFilter;
      });
  };
  
  const filteredNotifications = filterNotifications(allNotifications);
  const unreadCount = allNotifications.filter(n => !n.read).length;
  
  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              View and manage all your notifications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <Link to="/notification-preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {selectedFilter !== "all" && (
                  <Badge className="ml-2 px-1">1</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("all")}
                className={selectedFilter === "all" ? "bg-muted" : ""}
              >
                All notifications
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("unread")}
                className={selectedFilter === "unread" ? "bg-muted" : ""}
              >
                Unread
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("read")}
                className={selectedFilter === "read" ? "bg-muted" : ""}
              >
                Read
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("booking_confirmation")}
                className={selectedFilter === "booking_confirmation" ? "bg-muted" : ""}
              >
                Confirmations
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("booking_reminder")}
                className={selectedFilter === "booking_reminder" ? "bg-muted" : ""}
              >
                Reminders
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("booking_modification")}
                className={selectedFilter === "booking_modification" ? "bg-muted" : ""}
              >
                Modifications
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("booking_cancellation")}
                className={selectedFilter === "booking_cancellation" ? "bg-muted" : ""}
              >
                Cancellations
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedFilter("booking_conflict")}
                className={selectedFilter === "booking_conflict" ? "bg-muted" : ""}
              >
                Conflicts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Online Users
          </h3>
          <OnlineUsers />
        </Card>
        
        <Card className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No notifications found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search term" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/40 cursor-pointer ${
                    !notification.read ? "bg-muted/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <div className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </div>
                        <Badge variant={getNotificationTypeVariant(notification.type)} className="text-[10px]">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(notification.timestamp, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
