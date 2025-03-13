
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export type NotificationType = 
  | "booking_confirmation" 
  | "booking_reminder" 
  | "booking_modification" 
  | "booking_cancellation" 
  | "admin_request" 
  | "admin_issue" 
  | "booking_conflict";

export type NotificationChannel = 
  | "email" 
  | "in_app" 
  | "push" 
  | "calendar";

export interface NotificationPreferences {
  channels: {
    [key in NotificationType]: {
      email: boolean;
      in_app: boolean;
      push: boolean;
      calendar: boolean;
    }
  };
  reminderTimes: {
    minutes: number[];
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedId?: string; // e.g., booking ID, room ID
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  sendNotification: (
    type: NotificationType, 
    title: string, 
    message: string, 
    channels?: NotificationChannel[],
    actionUrl?: string,
    relatedId?: string
  ) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

const defaultPreferences: NotificationPreferences = {
  channels: {
    booking_confirmation: { email: true, in_app: true, push: true, calendar: true },
    booking_reminder: { email: true, in_app: true, push: true, calendar: false },
    booking_modification: { email: true, in_app: true, push: true, calendar: true },
    booking_cancellation: { email: true, in_app: true, push: true, calendar: true },
    admin_request: { email: true, in_app: true, push: false, calendar: false },
    admin_issue: { email: true, in_app: true, push: true, calendar: false },
    booking_conflict: { email: true, in_app: true, push: true, calendar: false }
  },
  reminderTimes: {
    minutes: [15, 60, 1440] // 15 mins, 1 hour, 1 day
  }
};

// Sample notifications for demo
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "booking_confirmation",
    title: "Booking Confirmed",
    message: "Your booking for Conference Room A on June 15 has been confirmed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: "/my-bookings",
    relatedId: "bk-001"
  },
  {
    id: "notif-002",
    type: "booking_reminder",
    title: "Meeting Reminder",
    message: "Your meeting in Meeting Room 101 starts in 15 minutes.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    actionUrl: "/my-bookings",
    relatedId: "bk-002"
  },
  {
    id: "notif-003",
    type: "booking_modification",
    title: "Booking Updated",
    message: "Your booking details for Executive Boardroom have been updated.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: "/my-bookings",
    relatedId: "bk-003"
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const savedPrefs = localStorage.getItem('notification_preferences');
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
  }, [preferences]);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  // This would connect to backend services in a real app
  const sendNotification = async (
    type: NotificationType, 
    title: string, 
    message: string, 
    channels: NotificationChannel[] = ["in_app"],
    actionUrl?: string,
    relatedId?: string
  ) => {
    // Create new notification object
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl,
      relatedId
    };
    
    // Add to in-app notifications
    if (channels.includes("in_app")) {
      setNotifications(prev => [newNotification, ...prev]);
    }
    
    // Show toast for immediate feedback
    toast({
      title,
      description: message,
    });
    
    // In a real app, these would call actual services
    if (channels.includes("email")) {
      console.log("Sending email notification:", { type, title, message });
    }
    
    if (channels.includes("push")) {
      console.log("Sending push notification:", { type, title, message });
    }
    
    if (channels.includes("calendar")) {
      console.log("Sending calendar invitation:", { type, title, message });
    }
    
    return Promise.resolve();
  };
  
  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPrefs,
      channels: {
        ...prev.channels,
        ...(newPrefs.channels || {})
      }
    }));
  };
  
  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        preferences,
        markAsRead, 
        markAllAsRead, 
        sendNotification,
        updatePreferences
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  
  return context;
};
