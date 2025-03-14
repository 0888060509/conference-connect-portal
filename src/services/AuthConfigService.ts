
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/contexts/auth/types";
import { Json } from "@/integrations/supabase/types";

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_number: boolean;
  require_special: boolean;
}

export interface SessionSettings {
  session_duration_seconds: number;
  refresh_token_rotation: boolean;
  refresh_token_expiry_days: number;
}

export interface OAuthProvider {
  enabled: boolean;
  client_id: string;
  client_secret: string;
  tenant_id?: string; // For Microsoft
}

export interface OAuthProviders {
  google: OAuthProvider;
  microsoft: OAuthProvider;
}

export interface EmailTemplate {
  subject: string;
  custom_template: boolean;
  html_content?: string;
}

export interface EmailTemplates {
  verification: EmailTemplate;
  password_reset: EmailTemplate;
  magic_link: EmailTemplate;
}

export interface DirectoryIntegration {
  id: string;
  provider: string;
  config: any;
  enabled: boolean;
  last_sync: string | null;
  sync_interval: number;
}

export interface JwtClaimMapping {
  id: string;
  directory_attribute: string;
  jwt_claim: string;
  transform_function: string | null;
  is_active: boolean;
}

export interface MfaSettings {
  is_enabled: boolean;
  methods: any[];
  recovery_codes: string[];
}

class AuthConfigService {
  // Password policy management
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'password_policy')
        .single();
      
      if (error) throw error;
      
      // Explicitly cast the JSON data to the correct type
      return data.setting_value as unknown as PasswordPolicy;
    } catch (error) {
      console.error('Error fetching password policy:', error);
      toast.error('Failed to load password policy settings');
      
      // Return default policy if fetch fails
      return {
        min_length: 10,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: true
      };
    }
  }
  
  async updatePasswordPolicy(policy: PasswordPolicy): Promise<void> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .update({ setting_value: policy as unknown as Json })
        .eq('setting_key', 'password_policy');
      
      if (error) throw error;
      toast.success('Password policy updated successfully');
    } catch (error) {
      console.error('Error updating password policy:', error);
      toast.error('Failed to update password policy');
      throw error;
    }
  }
  
  // Session settings management
  async getSessionSettings(): Promise<SessionSettings> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'session_settings')
        .single();
      
      if (error) throw error;
      
      return data.setting_value as unknown as SessionSettings;
    } catch (error) {
      console.error('Error fetching session settings:', error);
      toast.error('Failed to load session settings');
      
      // Return default settings if fetch fails
      return {
        session_duration_seconds: 3600,
        refresh_token_rotation: true,
        refresh_token_expiry_days: 7
      };
    }
  }
  
  async updateSessionSettings(settings: SessionSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .update({ setting_value: settings as unknown as Json })
        .eq('setting_key', 'session_settings');
      
      if (error) throw error;
      toast.success('Session settings updated successfully');
    } catch (error) {
      console.error('Error updating session settings:', error);
      toast.error('Failed to update session settings');
      throw error;
    }
  }
  
  // OAuth providers management
  async getOAuthProviders(): Promise<OAuthProviders> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'oauth_providers')
        .single();
      
      if (error) throw error;
      
      return data.setting_value as unknown as OAuthProviders;
    } catch (error) {
      console.error('Error fetching OAuth providers:', error);
      toast.error('Failed to load OAuth provider settings');
      
      // Return default empty providers if fetch fails
      return {
        google: {
          enabled: false,
          client_id: '',
          client_secret: ''
        },
        microsoft: {
          enabled: false,
          client_id: '',
          client_secret: '',
          tenant_id: ''
        }
      };
    }
  }
  
  async updateOAuthProviders(providers: OAuthProviders): Promise<void> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .update({ setting_value: providers as unknown as Json })
        .eq('setting_key', 'oauth_providers');
      
      if (error) throw error;
      toast.success('OAuth providers updated successfully');
    } catch (error) {
      console.error('Error updating OAuth providers:', error);
      toast.error('Failed to update OAuth providers');
      throw error;
    }
  }
  
  // Email templates management
  async getEmailTemplates(): Promise<EmailTemplates> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'email_templates')
        .single();
      
      if (error) throw error;
      
      return data.setting_value as unknown as EmailTemplates;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email template settings');
      
      // Return default templates if fetch fails
      return {
        verification: {
          subject: 'Verify your email',
          custom_template: false
        },
        password_reset: {
          subject: 'Reset your password',
          custom_template: false
        },
        magic_link: {
          subject: 'Your magic link',
          custom_template: false
        }
      };
    }
  }
  
  async updateEmailTemplates(templates: EmailTemplates): Promise<void> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .update({ setting_value: templates as unknown as Json })
        .eq('setting_key', 'email_templates');
      
      if (error) throw error;
      toast.success('Email templates updated successfully');
    } catch (error) {
      console.error('Error updating email templates:', error);
      toast.error('Failed to update email templates');
      throw error;
    }
  }
  
  // Directory integration management
  async getDirectoryIntegrations(): Promise<DirectoryIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('directory_integrations')
        .select('*');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching directory integrations:', error);
      toast.error('Failed to load directory integrations');
      return [];
    }
  }
  
  async updateDirectoryIntegration(integration: DirectoryIntegration): Promise<void> {
    try {
      const { error } = await supabase
        .from('directory_integrations')
        .update({
          provider: integration.provider,
          config: integration.config,
          enabled: integration.enabled,
          sync_interval: integration.sync_interval,
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);
      
      if (error) throw error;
      toast.success('Directory integration updated successfully');
    } catch (error) {
      console.error('Error updating directory integration:', error);
      toast.error('Failed to update directory integration');
      throw error;
    }
  }
  
  async createDirectoryIntegration(integration: Omit<DirectoryIntegration, 'id' | 'last_sync'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('directory_integrations')
        .insert({
          provider: integration.provider,
          config: integration.config,
          enabled: integration.enabled,
          sync_interval: integration.sync_interval
        })
        .select();
      
      if (error) throw error;
      toast.success('Directory integration created successfully');
      return data[0].id;
    } catch (error) {
      console.error('Error creating directory integration:', error);
      toast.error('Failed to create directory integration');
      throw error;
    }
  }
  
  async deleteDirectoryIntegration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('directory_integrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Directory integration deleted successfully');
    } catch (error) {
      console.error('Error deleting directory integration:', error);
      toast.error('Failed to delete directory integration');
      throw error;
    }
  }
  
  // JWT claim mappings management
  async getJwtClaimMappings(): Promise<JwtClaimMapping[]> {
    try {
      const { data, error } = await supabase
        .from('jwt_claim_mappings')
        .select('*');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching JWT claim mappings:', error);
      toast.error('Failed to load JWT claim mappings');
      return [];
    }
  }
  
  async updateJwtClaimMapping(mapping: JwtClaimMapping): Promise<void> {
    try {
      const { error } = await supabase
        .from('jwt_claim_mappings')
        .update({
          directory_attribute: mapping.directory_attribute,
          jwt_claim: mapping.jwt_claim,
          transform_function: mapping.transform_function,
          is_active: mapping.is_active
        })
        .eq('id', mapping.id);
      
      if (error) throw error;
      toast.success('JWT claim mapping updated successfully');
    } catch (error) {
      console.error('Error updating JWT claim mapping:', error);
      toast.error('Failed to update JWT claim mapping');
      throw error;
    }
  }
  
  async createJwtClaimMapping(mapping: Omit<JwtClaimMapping, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('jwt_claim_mappings')
        .insert({
          directory_attribute: mapping.directory_attribute,
          jwt_claim: mapping.jwt_claim,
          transform_function: mapping.transform_function,
          is_active: mapping.is_active
        })
        .select();
      
      if (error) throw error;
      toast.success('JWT claim mapping created successfully');
      return data[0].id;
    } catch (error) {
      console.error('Error creating JWT claim mapping:', error);
      toast.error('Failed to create JWT claim mapping');
      throw error;
    }
  }
  
  async deleteJwtClaimMapping(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('jwt_claim_mappings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('JWT claim mapping deleted successfully');
    } catch (error) {
      console.error('Error deleting JWT claim mapping:', error);
      toast.error('Failed to delete JWT claim mapping');
      throw error;
    }
  }
  
  // MFA management
  async getUserMfaSettings(userId: string): Promise<MfaSettings | null> {
    try {
      const { data, error } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Convert the database record to the MfaSettings interface
      return {
        is_enabled: data.is_enabled || false,
        methods: (data.methods || []) as any[],
        recovery_codes: (data.recovery_codes || []) as string[]
      };
    } catch (error) {
      console.error('Error fetching MFA settings:', error);
      toast.error('Failed to load MFA settings');
      return null;
    }
  }
  
  async updateUserMfaSettings(userId: string, settings: Partial<MfaSettings>): Promise<void> {
    try {
      // Check if settings exist for user
      const { data: existingSettings } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('mfa_settings')
          .update({
            is_enabled: settings.is_enabled !== undefined ? settings.is_enabled : existingSettings.is_enabled,
            methods: settings.methods || existingSettings.methods,
            recovery_codes: settings.recovery_codes || existingSettings.recovery_codes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('mfa_settings')
          .insert({
            user_id: userId,
            is_enabled: settings.is_enabled || false,
            methods: settings.methods || [],
            recovery_codes: settings.recovery_codes || []
          });
        
        if (error) throw error;
      }
      
      toast.success('MFA settings updated successfully');
    } catch (error) {
      console.error('Error updating MFA settings:', error);
      toast.error('Failed to update MFA settings');
      throw error;
    }
  }
  
  // Password validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // These are client-side validations; the server has the ultimate validation
    if (password.length < 10) {
      errors.push('Password must be at least 10 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const authConfigService = new AuthConfigService();
