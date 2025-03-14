
import { initDB, PendingOperation } from './db-schema';

export const pendingOperations = {
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
    const id = await tx.store.add(pendingOperation) as number;
    await tx.done;
    return id;
  },
  
  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await initDB();
    const index = db.transaction('pendingOperations').store.index('by-processed');
    // Use 0 to represent false in IndexedDB
    return index.getAll(0);
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
    // Use 1 to represent true in IndexedDB
    let cursor = await index.openCursor(1);
    
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    await tx.done;
  }
};
