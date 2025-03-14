
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
