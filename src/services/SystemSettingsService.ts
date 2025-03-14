
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAction } from "./AuditService";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export const getSystemSettings = async (): Promise<SystemSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    toast.error('Failed to load system settings');
    throw error;
  }
};

export const getSystemSetting = async (key: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found, return null instead of throwing
        return null;
      }
      throw error;
    }
    
    return data?.setting_value;
  } catch (error) {
    console.error(`Failed to fetch system setting ${key}:`, error);
    throw error;
  }
};

export const updateSystemSetting = async (
  key: string, 
  value: any, 
  description?: string
): Promise<void> => {
  try {
    // Check if setting exists
    const { data: existingSetting, error: checkError } = await supabase
      .from('system_settings')
      .select('id')
      .eq('setting_key', key)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingSetting) {
      // Update existing setting
      result = await supabase
        .from('system_settings')
        .update({
          setting_value: value,
          description: description,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);
    } else {
      // Insert new setting
      result = await supabase
        .from('system_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          description: description
        });
    }
    
    if (result.error) throw result.error;
    
    // Log the action
    await logAction({
      action: 'settings_update',
      resourceType: 'settings',
      details: { key, previous: existingSetting ? 'updated' : 'created' }
    });
    
    toast.success(`System setting "${key}" has been ${existingSetting ? 'updated' : 'created'}`);
  } catch (error) {
    console.error(`Failed to update system setting ${key}:`, error);
    toast.error(`Failed to update system setting`);
    throw error;
  }
};

export const deleteSystemSetting = async (key: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('setting_key', key);
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'settings_update',
      resourceType: 'settings',
      details: { key, action: 'deleted' }
    });
    
    toast.success(`System setting "${key}" has been deleted`);
  } catch (error) {
    console.error(`Failed to delete system setting ${key}:`, error);
    toast.error(`Failed to delete system setting`);
    throw error;
  }
};
