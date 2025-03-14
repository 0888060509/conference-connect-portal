import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Booking } from '@/hooks/use-bookings';
import { Room } from '@/hooks/use-rooms';
import { supabaseClient } from '@/lib/supabase-client';

// Define a custom interface for the pending operations store
interface PendingOperation {
  id?: number;
  timestamp: number;
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  processed: boolean;
}

// Define the schema structure for the database
interface MeetingMasterDB extends DBSchema {
  rooms: {
    key: string;
    value: Room;
    indexes: { 'by-name': string };
  };
  bookings: {
    key: string;
    value: Booking;
    indexes: { 'by-user': string; 'by-room': string; 'by-start-date': string };
  };
  pendingOperations: {
    key: number;
    value: PendingOperation;
    indexes: { 'by-processed': boolean };
  } & Record<string, any>;
}

let dbPromise: Promise<IDBPDatabase<MeetingMasterDB>> | null = null;

const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<MeetingMasterDB>('meeting-master', 1, {
      upgrade(db) {
        // Create rooms store
        if (!db.objectStoreNames.contains('rooms')) {
          const roomsStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomsStore.createIndex('by-name', 'name');
        }
        
        // Create bookings store
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingsStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingsStore.createIndex('by-user', 'user_id');
          bookingsStore.createIndex('by-room', 'room_id');
          bookingsStore.createIndex('by-start-date', 'start_time');
        }
        
        // Create pending operations store for offline sync
        if (!db.objectStoreNames.contains('pendingOperations')) {
          const pendingStore = db.createObjectStore('pendingOperations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          pendingStore.createIndex('by-processed', 'processed');
        }
      }
    });
  }
  return dbPromise;
};

export const offlineStore = {
  async getRoom(id: string): Promise<Room | undefined> {
    const db = await initDB();
    return db.get('rooms', id);
  },
  
  async getRooms(): Promise<Room[]> {
    const db = await initDB();
    return db.getAll('rooms');
  },
  
  async storeRooms(rooms: Room[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('rooms', 'readwrite');
    for (const room of rooms) {
      await tx.store.put(room);
    }
    await tx.done;
  },
  
  async getBooking(id: string): Promise<Booking | undefined> {
    const db = await initDB();
    return db.get('bookings', id);
  },
  
  async getBookings(): Promise<Booking[]> {
    const db = await initDB();
    return db.getAll('bookings');
  },
  
  async getUserBookings(userId: string): Promise<Booking[]> {
    const db = await initDB();
    const index = db.transaction('bookings').store.index('by-user');
    return index.getAll(userId);
  },
  
  async getRoomBookings(roomId: string): Promise<Booking[]> {
    const db = await initDB();
    const index = db.transaction('bookings').store.index('by-room');
    return index.getAll(roomId);
  },
  
  async storeBookings(bookings: Booking[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('bookings', 'readwrite');
    for (const booking of bookings) {
      await tx.store.put(booking);
    }
    await tx.done;
  },
  
  async addPendingOperation(operation: 'insert' | 'update' | 'delete', table: string, data: any): Promise<number> {
    const db = await initDB();
    const tx = db.transaction('pendingOperations', 'readwrite');
    const pendingOperation: PendingOperation = {
      timestamp: Date.now(),
      operation,
      table,
      data,
      processed: false
    };
    const id = await tx.store.add(pendingOperation);
    await tx.done;
    return id;
  },
  
  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await initDB();
    const index = db.transaction('pendingOperations').store.index('by-processed');
    return index.getAll(false);
  },
  
  async markOperationProcessed(id: number): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('pendingOperations', 'readwrite');
    const operation = await tx.store.get(id);
    if (operation) {
      operation.processed = true;
      await tx.store.put(operation);
    }
    await tx.done;
  },
  
  async clearProcessedOperations(): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('pendingOperations', 'readwrite');
    const index = tx.store.index('by-processed');
    let cursor = await index.openCursor(true);
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }
};

export const syncPendingOperations = async (): Promise<void> => {
  const pendingOps = await offlineStore.getPendingOperations();
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
        await offlineStore.markOperationProcessed(op.id);
      }
    } catch (error) {
      console.error('Failed to sync operation:', op, error);
      // Don't mark as processed on error to retry later
    }
  }
  
  // Clear processed operations
  await offlineStore.clearProcessedOperations();
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
