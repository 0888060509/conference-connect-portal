
import { supabaseClient } from './supabase-client';
import { offlineStore, syncPendingOperations } from './offline-store';
import { toast } from 'sonner';

// Initial sync from server to local DB
export const initDataSync = async () => {
  // Check if online
  if (navigator.onLine) {
    try {
      // Sync rooms
      const { data: rooms, error: roomsError } = await supabaseClient
        .from('rooms')
        .select('*');
      
      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
      } else if (rooms) {
        await offlineStore.storeRooms(rooms);
        console.log(`Synced ${rooms.length} rooms to local DB`);
      }
      
      // Sync bookings
      const { data: bookings, error: bookingsError } = await supabaseClient
        .from('bookings')
        .select('*');
      
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      } else if (bookings) {
        await offlineStore.storeBookings(bookings);
        console.log(`Synced ${bookings.length} bookings to local DB`);
      }
      
      // Sync pending operations if any
      await syncPendingOperations();
      
    } catch (error) {
      console.error('Error during initial data sync:', error);
    }
  }
  
  // Set up network status listeners
  setupNetworkListeners();
};

// Setup network status listeners
const setupNetworkListeners = () => {
  window.addEventListener('online', async () => {
    console.log('App is back online, syncing pending operations...');
    toast.info('Connection restored. Syncing data...');
    
    try {
      await syncPendingOperations();
      toast.success('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync some data');
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline, operations will be queued');
    toast.warning('You are offline. Changes will be saved when you reconnect.');
  });
};

// Function to perform admin data sync using edge function
export const performAdminDataSync = async () => {
  if (!navigator.onLine) {
    toast.warning('Cannot sync while offline');
    return;
  }
  
  try {
    // Get pending operations
    const pendingOps = await offlineStore.getPendingOperations();
    
    if (pendingOps.length === 0) {
      toast.info('No pending changes to sync');
      return;
    }
    
    // Call the sync-data edge function
    const { data, error } = await supabaseClient.functions.invoke('admin/sync-data', {
      body: { pendingOperations: pendingOps }
    });
    
    if (error) {
      throw error;
    }
    
    // Process results
    const { results } = data;
    
    // Count successes and failures
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    
    // Mark successful operations as processed
    for (let i = 0; i < results.length; i++) {
      if (results[i].success && pendingOps[i].id) {
        await offlineStore.markOperationProcessed(pendingOps[i].id);
      }
    }
    
    // Clear processed operations
    await offlineStore.clearProcessedOperations();
    
    // Show result toast
    if (failures > 0) {
      toast.warning(`Sync completed with issues: ${successes} successful, ${failures} failed`);
    } else {
      toast.success(`All ${successes} changes synced successfully`);
    }
    
  } catch (error) {
    console.error('Error performing admin data sync:', error);
    toast.error('Failed to sync data: ' + (error.message || 'Unknown error'));
  }
};
