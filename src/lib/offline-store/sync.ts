
import { supabaseClient } from '@/lib/supabase-client';
import { pendingOperations } from './pending-operations';

export const syncPendingOperations = async (): Promise<void> => {
  const pendingOps = await pendingOperations.getPendingOperations();
  if (pendingOps.length === 0) return;
  
  // Sort by timestamp to maintain operation order
  pendingOps.sort((a, b) => a.timestamp - b.timestamp);
  
  for (const op of pendingOps) {
    try {
      // Process each operation based on type and table
      if (op.table === 'rooms') {
        if (op.operation === 'insert' || op.operation === 'update') {
          await supabaseClient
            .from('rooms')
            .upsert(op.data);
        } else if (op.operation === 'delete') {
          await supabaseClient
            .from('rooms')
            .delete()
            .eq('id', op.data.id);
        }
      } else if (op.table === 'bookings') {
        if (op.operation === 'insert' || op.operation === 'update') {
          await supabaseClient
            .from('bookings')
            .upsert(op.data);
        } else if (op.operation === 'delete') {
          await supabaseClient
            .from('bookings')
            .delete()
            .eq('id', op.data.id);
        }
      }
      
      // Mark operation as processed
      if (op.id) {
        await pendingOperations.markOperationProcessed(op.id);
      }
    } catch (error) {
      console.error('Failed to sync operation:', op, error);
      // Don't mark as processed on error to retry later
    }
  }
  
  // Clear processed operations
  await pendingOperations.clearProcessedOperations();
};

// Listen for online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('App is back online, syncing pending operations...');
    syncPendingOperations()
      .then(() => console.log('Sync completed'))
      .catch(err => console.error('Sync failed:', err));
  });
}
