
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type OnlineUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  last_active: string;
};

export function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  useEffect(() => {
    // Set up presence channel
    const channel = supabase.channel('online-users');
    
    const trackPresence = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();
        
      // Track presence
      await channel.track({
        user_id: user.id,
        email: user.email,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        online_at: new Date().toISOString(),
      });
    };
    
    // Set up presence handlers
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        
        // Convert presence state to array of users
        const presentUsers = Object.keys(newState).map(key => {
          const userPresence = newState[key][0] as any;
          return {
            id: key,
            email: userPresence.email,
            first_name: userPresence.first_name,
            last_name: userPresence.last_name,
            last_active: userPresence.online_at,
          };
        });
        
        setOnlineUsers(presentUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Could show a toast when someone joins
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Could show a toast when someone leaves
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (onlineUsers.length === 0) {
    return <div className="text-sm text-muted-foreground">No users currently online</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {onlineUsers.map((user) => (
        <TooltipProvider key={user.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`} />
                  <AvatarFallback>
                    {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                    {user.last_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.first_name} {user.last_name || ''}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
