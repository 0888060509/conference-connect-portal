
import { Booking } from '@/hooks/use-bookings';
import { initDB } from './db-schema';

export const bookingOperations = {
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
  }
};
