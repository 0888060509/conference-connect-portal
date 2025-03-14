
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  AlertCircle,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

type AnnouncementType = 'info' | 'warning' | 'success' | 'error';

interface BroadcastMessage {
  id: string;
  message: string;
  type: AnnouncementType;
  sender_id: string;
  expires_at: string | null;
  created_at: string;
}

export function SystemAnnouncement() {
  const [announcements, setAnnouncements] = useState<BroadcastMessage[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissed_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Fetch initial announcements
    const fetchAnnouncements = async () => {
      const now = new Date().toISOString();
      
      const { data } = await supabase
        .from('broadcast_messages')
        .select('*')
        .or(`expires_at.gt.${now},expires_at.is.null`)
        .order('created_at', { ascending: false });
        
      if (data) {
        setAnnouncements(data as BroadcastMessage[]);
      }
    };
    
    fetchAnnouncements();
    
    // Subscribe to new announcements
    const channel = supabase
      .channel('public:broadcast_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'broadcast_messages'
      }, (payload) => {
        const newAnnouncement = payload.new as BroadcastMessage;
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Save dismissed IDs to localStorage
  useEffect(() => {
    localStorage.setItem('dismissed_announcements', JSON.stringify(dismissedIds));
  }, [dismissedIds]);
  
  // Filter out expired and dismissed announcements
  const activeAnnouncements = announcements.filter(announcement => {
    // Check if dismissed
    if (dismissedIds.includes(announcement.id)) return false;
    
    // Check if expired
    if (announcement.expires_at) {
      const expiryDate = new Date(announcement.expires_at);
      if (expiryDate < new Date()) return false;
    }
    
    return true;
  });
  
  if (activeAnnouncements.length === 0) {
    return null;
  }
  
  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };
  
  const getIcon = (type: AnnouncementType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getVariant = (type: AnnouncementType): "default" | "destructive" => {
    return type === 'error' ? "destructive" : "default";
  };
  
  return (
    <div className="space-y-4">
      {activeAnnouncements.map((announcement) => (
        <Alert key={announcement.id} variant={getVariant(announcement.type)}>
          <div className="flex items-start">
            <div className="flex-1">
              {getIcon(announcement.type)}
              <AlertTitle className="ml-6 -mt-5">Announcement</AlertTitle>
              <AlertDescription className="ml-6">
                {announcement.message}
              </AlertDescription>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
