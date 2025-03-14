
import { roomOperations } from './offline-store/rooms';
import { bookingOperations } from './offline-store/bookings';
import { pendingOperations } from './offline-store/pending-operations';
import { syncPendingOperations } from './offline-store/sync';
import type { PendingOperation } from './offline-store/db-schema';

// Re-export all the operations
export const offlineStore = {
  // Room operations
  getRoom: roomOperations.getRoom,
  getRooms: roomOperations.getRooms,
  storeRooms: roomOperations.storeRooms,
  
  // Booking operations
  getBooking: bookingOperations.getBooking,
  getBookings: bookingOperations.getBookings,
  getUserBookings: bookingOperations.getUserBookings,
  getRoomBookings: bookingOperations.getRoomBookings,
  storeBookings: bookingOperations.storeBookings,
  
  // Pending operations
  addPendingOperation: pendingOperations.addPendingOperation,
  getPendingOperations: pendingOperations.getPendingOperations,
  markOperationProcessed: pendingOperations.markOperationProcessed,
  clearProcessedOperations: pendingOperations.clearProcessedOperations
};

// Re-export the sync function
export { syncPendingOperations };
// Re-export the PendingOperation type with the 'export type' syntax
export type { PendingOperation };
