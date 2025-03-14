
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAction } from "./AuditService";

export interface BackupRecord {
  id: string;
  backup_name: string;
  backup_size?: number;
  status: 'pending' | 'completed' | 'failed';
  backup_date: string;
  created_by?: string;
  details?: any;
}

export const getBackupHistory = async (): Promise<BackupRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('backup_history')
      .select(`
        *,
        creator:created_by (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order('backup_date', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Failed to fetch backup history:', error);
    toast.error('Failed to load backup history');
    throw error;
  }
};

export const createBackup = async (backupName: string): Promise<BackupRecord> => {
  try {
    // First, create a pending backup record
    const { data: backupRecord, error: recordError } = await supabase
      .from('backup_history')
      .insert({
        backup_name: backupName,
        status: 'pending'
      })
      .select()
      .single();
    
    if (recordError) throw recordError;
    
    toast.info('Backup process started');
    
    // In a real application, we would trigger a server-side backup process here
    // For this demo, we'll simulate a backup with a delay
    setTimeout(async () => {
      try {
        // Update the backup record with success status
        const { error: updateError } = await supabase
          .from('backup_history')
          .update({
            status: 'completed',
            backup_size: Math.floor(Math.random() * 100) + 1, // Random size in MB
            details: {
              tables_included: ['rooms', 'bookings', 'users', 'settings'],
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', backupRecord.id);
        
        if (updateError) throw updateError;
        
        // Log the action
        await logAction({
          action: 'backup_create',
          resourceType: 'backup',
          resourceId: backupRecord.id,
          details: { name: backupName }
        });
        
        toast.success(`Backup "${backupName}" completed successfully`);
      } catch (error) {
        console.error('Failed to update backup status:', error);
        
        // Update with failed status
        await supabase
          .from('backup_history')
          .update({
            status: 'failed',
            details: { error: error.message }
          })
          .eq('id', backupRecord.id);
      }
    }, 3000); // Simulate a 3-second backup process
    
    return backupRecord;
  } catch (error) {
    console.error('Failed to create backup:', error);
    toast.error('Failed to create backup');
    throw error;
  }
};

export const restoreBackup = async (backupId: string): Promise<void> => {
  try {
    // Get backup details first
    const { data: backup, error: getError } = await supabase
      .from('backup_history')
      .select('backup_name, status')
      .eq('id', backupId)
      .single();
    
    if (getError) throw getError;
    
    if (backup.status !== 'completed') {
      toast.error('Cannot restore an incomplete backup');
      return;
    }
    
    toast.info(`Restoring backup "${backup.backup_name}"...`);
    
    // In a real application, we would trigger a server-side restore process
    // For this demo, we'll simulate a restore with a delay
    setTimeout(async () => {
      try {
        // Log the action
        await logAction({
          action: 'backup_restore',
          resourceType: 'backup',
          resourceId: backupId,
          details: { name: backup.backup_name }
        });
        
        toast.success(`Backup "${backup.backup_name}" restored successfully`);
      } catch (error) {
        console.error('Failed to log restore action:', error);
        toast.error('Error during restore process');
      }
    }, 4000); // Simulate a 4-second restore process
  } catch (error) {
    console.error(`Failed to restore backup ${backupId}:`, error);
    toast.error('Failed to restore backup');
    throw error;
  }
};

export const deleteBackup = async (backupId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('backup_history')
      .delete()
      .eq('id', backupId);
    
    if (error) throw error;
    
    toast.success('Backup deleted successfully');
  } catch (error) {
    console.error(`Failed to delete backup ${backupId}:`, error);
    toast.error('Failed to delete backup');
    throw error;
  }
};
