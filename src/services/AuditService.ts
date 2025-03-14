
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AuditAction = 
  | 'room_create' 
  | 'room_update' 
  | 'room_delete' 
  | 'user_role_assign' 
  | 'user_role_revoke'
  | 'settings_update'
  | 'backup_create'
  | 'backup_restore'
  | 'report_generate';

export type ResourceType = 
  | 'room' 
  | 'user' 
  | 'role' 
  | 'settings' 
  | 'backup' 
  | 'report';

export interface AuditLogEntry {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: any;
}

export const logAction = async (logEntry: AuditLogEntry): Promise<void> => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action: logEntry.action,
        resource_type: logEntry.resourceType,
        resource_id: logEntry.resourceId,
        details: logEntry.details,
        ip_address: window.location.hostname // Simplified - in production would use a proper IP detection
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // We don't show toast here as this is a background operation
  }
};

export const getAuditLogs = async (limit = 50, offset = 0, filters?: {
  action?: AuditAction,
  resourceType?: ResourceType,
  userId?: string,
  fromDate?: Date,
  toDate?: Date
}) => {
  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users:user_id (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters if provided
    if (filters) {
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate.toISOString());
      }
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { logs: data, count };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    toast.error('Failed to load audit logs');
    throw error;
  }
};
