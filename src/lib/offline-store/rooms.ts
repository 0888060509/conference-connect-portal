
import { Room } from '@/hooks/use-rooms';
import { initDB } from './db-schema';

export const roomOperations = {
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
  }
};
