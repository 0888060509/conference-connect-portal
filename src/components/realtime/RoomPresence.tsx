
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RoomPresenceProps {
  roomId: string;
}

type RoomViewer = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: 'active' | 'idle' | 'offline';
};

interface RoomPresenceData {
  id: string;
  room_id: string;
  user_id: string;
  status: string;
  last_active: string;
  created_at: string;
  users?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export function RoomPresence({ roomId }: RoomPresenceProps) {
  const [viewers, setViewers] = useState<RoomViewer[]>([]);
  
  useEffect(() => {
    if (!roomId) return;

    // Record user presence in the room
    const recordPresence = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Insert or update presence record
      await supabase
        .from('room_presence' as any) // Type assertion to bypass TS error
        .upsert({
          room_id: roomId,
          user_id: user.id,
          status: 'active',
          last_active: new Date().toISOString(),
        }, { onConflict: 'room_id, user_id' })
        .select();

      // Set up interval to update presence
      const intervalId = setInterval(async () => {
        await supabase
          .from('room_presence' as any) // Type assertion to bypass TS error
          .upsert({
            room_id: roomId,
            user_id: user.id,
            status: 'active',
            last_active: new Date().toISOString(),
          }, { onConflict: 'room_id, user_id' })
          .select();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(intervalId);
    };
    
    const cleanup = recordPresence();
    
    // Subscribe to room presence changes
    const channel = supabase
      .channel('room-presence-' + roomId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_presence',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        fetchViewers();
      })
      .subscribe();
      
    // Fetch initial viewers
    fetchViewers();
    
    // Fetch viewers when presence changes
    async function fetchViewers() {
      try {
        // Get presence data and join with user profiles
        const { data, error } = await supabase
          .from('room_presence' as any) // Type assertion to bypass TS error
          .select(`
            id,
            user_id,
            status,
            last_active,
            users:user_id (
              email,
              first_name,
              last_name
            )
          `)
          .eq('room_id', roomId)
          .gt('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Only users active in the last 5 minutes
          
        if (error) {
          console.error("Error fetching room presence:", error);
          return;
        }
          
        if (data) {
          const typedData = data as unknown as RoomPresenceData[];
          const viewersList = typedData.map(presence => ({
            id: presence.user_id,
            email: presence.users?.email || '',
            first_name: presence.users?.first_name || '',
            last_name: presence.users?.last_name || '',
            status: presence.status as 'active' | 'idle' | 'offline',
          }));
          
          setViewers(viewersList);
        }
      } catch (err) {
        console.error("Error in fetchViewers:", err);
      }
    }
    
    return () => {
      cleanup.then(clearFn => clearFn && clearFn());
      supabase.removeChannel(channel);
      
      // When component unmounts, mark user as offline
      const removePresence = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          await supabase
            .from('room_presence' as any) // Type assertion to bypass TS error
            .delete()
            .eq('room_id', roomId)
            .eq('user_id', user.id);
        } catch (err) {
          console.error("Error removing presence:", err);
        }
      };
      
      removePresence();
    };
  }, [roomId]);
  
  if (viewers.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge variant="outline" className="text-xs px-2 py-0 h-5">
        {viewers.length} viewer{viewers.length !== 1 ? 's' : ''}
      </Badge>
      
      <div className="flex -space-x-2">
        {viewers.slice(0, 3).map((viewer) => (
          <TooltipProvider key={viewer.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${viewer.first_name}+${viewer.last_name}&background=random&size=32`} />
                  <AvatarFallback className="text-[10px]">
                    {viewer.first_name?.[0] || viewer.email?.[0]?.toUpperCase()}
                    {viewer.last_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{viewer.first_name} {viewer.last_name || ''}</p>
                <p className="text-xs text-muted-foreground">{viewer.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {viewers.length > 3 && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px]">
                    +{viewers.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {viewers.slice(3).map(v => `${v.first_name} ${v.last_name}`).join(', ')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
