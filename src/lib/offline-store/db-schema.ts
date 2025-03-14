
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Booking } from '@/hooks/use-bookings';
import { Room } from '@/hooks/use-rooms';

// Define a custom interface for the pending operations store
export interface PendingOperation {
  id?: number;
  timestamp: number;
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  processed: boolean;
}

// Define the schema structure for the database
export interface MeetingMasterDB extends DBSchema {
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
    indexes: { 'by-processed': number }; // Changed from boolean to number
  };
}

let dbPromise: Promise<IDBPDatabase<MeetingMasterDB>> | null = null;

export const initDB = async () => {
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
          // Convert boolean to number (0 for false, 1 for true)
          pendingStore.createIndex('by-processed', 'processed');
        }
      }
    });
  }
  return dbPromise;
};
