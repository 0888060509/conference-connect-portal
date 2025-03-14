
import { supabaseClient } from '@/lib/supabase-client';
import { offlineStore } from '@/lib/offline-store';
import { toast } from 'sonner';
import { Booking } from '@/hooks/use-bookings';

/**
 * Sync essential data for offline use
 */
export async function syncDataForOffline(): Promise<void> {
  try {
    // Sync rooms
    const { data: rooms, error: roomsError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('status', 'active');
      
    if (roomsError) throw roomsError;
    if (rooms) await offlineStore.storeRooms(rooms);
    
    // Get current user's ID
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    
    // Sync user's bookings (past 30 days and future 60 days)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', pastDate.toISOString())
      .lte('end_time', futureDate.toISOString());
      
    if (bookingsError) throw bookingsError;
    if (bookings) {
      // Convert database status to our local status type
      const adaptedBookings = bookings.map(booking => ({
        ...booking,
        status: booking.status === 'completed' ? 'confirmed' : booking.status
      })) as unknown as Booking[];
      
      await offlineStore.storeBookings(adaptedBookings);
    }
    
    console.log('Data synchronized for offline use');
  } catch (error) {
    console.error('Failed to sync data for offline use:', error);
    toast.error('Failed to sync some data for offline use');
  }
}

/**
 * Initialize data sync when user logs in
 */
export function initDataSync(): void {
  // Sync when the user logs in
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      syncDataForOffline();
    }
  });
  
  // Set up periodic sync if online
  if (typeof window !== 'undefined') {
    // Sync every hour if the user is online
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        syncDataForOffline();
      }
    }, 60 * 60 * 1000); // 1 hour
    
    // Clean up interval on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(syncInterval);
    });
  }
}
