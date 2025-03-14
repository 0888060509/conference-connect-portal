
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

// Define a fallback type for DB schema values if not provided by idb
interface DBSchemaValue {
  key: string | number;
  value: any;
  indexes?: { [key: string]: string | number | boolean | Date };
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
    indexes: { 'by-processed': boolean };
  };
  // Add string index signature for compatibility
  [key: string]: DBSchemaValue;
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
          pendingStore.createIndex('by-processed', 'processed');
        }
      }
    });
  }
  return dbPromise;
};
