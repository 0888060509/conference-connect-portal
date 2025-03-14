
import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeOptions = {
  table: string;
  filter?: string;
  onError?: (error: Error) => void;
};

/**
 * Hook to subscribe to real-time changes for a specific table
 */
export function useRealtime<T>(
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  options: RealtimeOptions
) {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      try {
        const { table, filter } = options;
        
        channel = supabaseClient
          .channel(`table-changes-${table}-${filter || 'all'}`)
          
        if (filter) {
          channel = channel.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: filter,
            },
            (payload) => {
              callback(payload as RealtimePostgresChangesPayload<T>);
            }
          );
        } else {
          channel = channel.on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
            },
            (payload) => {
              callback(payload as RealtimePostgresChangesPayload<T>);
            }
          );
        }
        
        // Subscribe to broadcast messages as well (for system-wide notifications)
        channel = channel.on(
          'broadcast',
          { event: `${table}-change` },
          (payload) => {
            // Type assertion to safely handle the broadcast payload
            callback(payload as unknown as RealtimePostgresChangesPayload<T>);
          }
        );
        
        // Start the subscription
        channel.subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`Realtime subscription status: ${status}`);
          }
        });
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    };

    subscribe();

    // Clean up subscription
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [callback, options.table, options.filter]);
}
