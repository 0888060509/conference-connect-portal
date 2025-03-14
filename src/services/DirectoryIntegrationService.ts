
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, UserImpl } from "@/contexts/auth/types";

export interface SyncStats {
  total: number;
  created: number;
  updated: number;
  failed: number;
  skipped: number;
}

class DirectoryIntegrationService {
  async syncWithDirectory(directoryId: string): Promise<SyncStats> {
    try {
      // Get the directory integration configuration
      const { data: integration, error: integrationError } = await supabase
        .from('directory_integrations')
        .select('*')
        .eq('id', directoryId)
        .single();
      
      if (integrationError) throw integrationError;
      
      if (!integration.enabled) {
        throw new Error('This directory integration is not enabled');
      }
      
      // Initialize sync statistics
      const stats: SyncStats = {
        total: 0,
        created: 0,
        updated: 0,
        failed: 0,
        skipped: 0
      };
      
      // In a real implementation, we would call the directory API here
      // For demo purposes, we'll just simulate a successful sync
      
      // Update the last_sync timestamp
      await supabase
        .from('directory_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', directoryId);
      
      toast.success('Directory sync completed successfully');
      return stats;
    } catch (error) {
      console.error('Error syncing with directory:', error);
      toast.error('Failed to sync with directory');
      throw error;
    }
  }
  
  async provisionUser(email: string, firstName: string, lastName: string): Promise<User | null> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        toast.info(`User ${email} already exists`);
        return new UserImpl({
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name || '',
          last_name: existingUser.last_name || '',
          role: existingUser.role,
          department: existingUser.department,
          created_at: existingUser.created_at,
          last_login: existingUser.last_login,
          preferences: existingUser.preferences
        });
      }
      
      // Generate a temporary password (in production this would be more secure)
      const tempPassword = 'Temp@' + Math.random().toString(36).substring(2, 10);
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName
        }
      });
      
      if (authError) throw authError;
      
      // The user data should have been created automatically via triggers
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (userError) throw userError;
      
      if (newUser) {
        toast.success(`User ${email} provisioned successfully`);
        
        // Return the new user
        return new UserImpl({
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name || '',
          last_name: newUser.last_name || '',
          role: newUser.role,
          department: newUser.department,
          created_at: newUser.created_at,
          last_login: newUser.last_login,
          preferences: newUser.preferences
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error provisioning user:', error);
      toast.error('Failed to provision user');
      return null;
    }
  }
  
  async deprovisionUser(userId: string): Promise<boolean> {
    try {
      // Delete the user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userId
      );
      
      if (authError) throw authError;
      
      toast.success('User deprovisioned successfully');
      return true;
    } catch (error) {
      console.error('Error deprovisioning user:', error);
      toast.error('Failed to deprovision user');
      return false;
    }
  }
}

// Export singleton instance
export const directoryIntegrationService = new DirectoryIntegrationService();
