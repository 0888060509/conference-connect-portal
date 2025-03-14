
import { useEffect } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  schema?: string;
  table: string;
  event?: EventType;
  filter?: string;
  onError?: (error: Error) => void;
}

/**
 * Hook for subscribing to Supabase Realtime changes
 * 
 * @param callback Function called when a matching change occurs
 * @param options Configuration options for the subscription
 * @returns A cleanup function that unsubscribes from the channel
 * 
 * @example
 * ```tsx
 * useRealtime((payload) => {
 *   console.log('New booking:', payload.new);
 * }, {
 *   table: 'bookings',
 *   event: 'INSERT',
 *   filter: 'room_id=eq.123',
 * });
 * ```
 */
export function useRealtime<T = any>(
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  options: UseRealtimeOptions
) {
  const { schema = 'public', table, event = '*', filter, onError } = options;

  useEffect(() => {
    // Create a unique channel name
    const channelName = `${schema}:${table}:${event}${filter ? `:${filter}` : ''}`;
    
    // Configure channel
    let channel: RealtimeChannel;
    
    try {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter,
          }, 
          (payload) => {
            // Use type assertion to handle the payload correctly
            callback(payload as unknown as RealtimePostgresChangesPayload<T>);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIPTION_ERROR' && onError) {
            onError(new Error(`Subscription error for ${channelName}`));
          }
        });
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error('Unknown error in Realtime subscription'));
      }
      return;
    }
    
    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [schema, table, event, filter, callback, onError]);
}

/**
 * Hook for tracking user presence in a channel
 * 
 * @param channelName Unique name for the presence channel
 * @param presenceData Data to share with other clients
 * @param callbacks Optional presence event callbacks
 * @returns Current presence state and a function to update presence
 */
export function usePresence<T extends Record<string, any>>(
  channelName: string,
  presenceData: T,
  callbacks?: {
    onSync?: (state: Record<string, T[]>) => void;
    onJoin?: (key: string, newPresences: T[]) => void;
    onLeave?: (key: string, leftPresences: T[]) => void;
  }
) {
  useEffect(() => {
    // Set up presence channel
    const channel = supabase.channel(channelName);
    
    // Configure presence handlers
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (callbacks?.onSync) {
          // Type assertion to handle the state correctly
          callbacks.onSync(state as unknown as Record<string, T[]>);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (callbacks?.onJoin) {
          // Type assertion to handle the presences correctly
          callbacks.onJoin(key, newPresences as unknown as T[]);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (callbacks?.onLeave) {
          // Type assertion to handle the presences correctly
          callbacks.onLeave(key, leftPresences as unknown as T[]);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(presenceData);
        }
      });
      
    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, presenceData, callbacks]);
}
