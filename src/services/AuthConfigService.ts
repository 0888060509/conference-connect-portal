import { supabase } from "@/integrations/supabase/client";
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
  secret: string;
  redirect_uri: string;
  tenant_id?: string;
}

export interface OAuthProviders {
  google: OAuthProvider;
  microsoft: OAuthProvider;
}

export interface EmailTemplate {
  subject: string;
  content_html: string;
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
  provider: 'azure_ad' | 'ldap' | 'okta' | 'google';
  config: Record<string, any>;
  enabled: boolean;
  sync_interval: number;
  last_sync: string | null;
}

const jsonToPasswordPolicy = (json: Json | null): PasswordPolicy => {
  if (!json || typeof json !== 'object') {
    return {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_number: true,
      require_special: false
    };
  }
  
  const obj = json as Record<string, any>;
  
  return {
    min_length: Number(obj.min_length) || 8,
    require_uppercase: Boolean(obj.require_uppercase),
    require_lowercase: Boolean(obj.require_lowercase),
    require_number: Boolean(obj.require_number),
    require_special: Boolean(obj.require_special)
  };
};

const jsonToSessionSettings = (json: Json | null): SessionSettings => {
  if (!json || typeof json !== 'object') {
    return {
      session_duration_seconds: 3600,
      refresh_token_rotation: true,
      refresh_token_expiry_days: 30
    };
  }
  
  const obj = json as Record<string, any>;
  
  return {
    session_duration_seconds: Number(obj.session_duration_seconds) || 3600,
    refresh_token_rotation: Boolean(obj.refresh_token_rotation),
    refresh_token_expiry_days: Number(obj.refresh_token_expiry_days) || 30
  };
};

const jsonToOAuthProviders = (json: Json | null): OAuthProviders => {
  if (!json || typeof json !== 'object') {
    return {
      google: {
        enabled: false,
        client_id: '',
        secret: '',
        redirect_uri: ''
      },
      microsoft: {
        enabled: false,
        client_id: '',
        secret: '',
        redirect_uri: '',
        tenant_id: ''
      }
    };
  }
  
  const obj = json as Record<string, any>;
  
  return {
    google: {
      enabled: Boolean(obj.google?.enabled),
      client_id: String(obj.google?.client_id || ''),
      secret: String(obj.google?.secret || ''),
      redirect_uri: String(obj.google?.redirect_uri || '')
    },
    microsoft: {
      enabled: Boolean(obj.microsoft?.enabled),
      client_id: String(obj.microsoft?.client_id || ''),
      secret: String(obj.microsoft?.secret || ''),
      redirect_uri: String(obj.microsoft?.redirect_uri || ''),
      tenant_id: String(obj.microsoft?.tenant_id || '')
    }
  };
};

const jsonToEmailTemplates = (json: Json | null): EmailTemplates => {
  if (!json || typeof json !== 'object') {
    return {
      verification: {
        subject: 'Verify your email',
        content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>',
        custom_template: false,
        html_content: ''
      },
      password_reset: {
        subject: 'Reset your password',
        content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>',
        custom_template: false,
        html_content: ''
      },
      magic_link: {
        subject: 'Your magic link',
        content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>',
        custom_template: false,
        html_content: ''
      }
    };
  }
  
  const obj = json as Record<string, any>;
  
  return {
    verification: {
      subject: String(obj.verification?.subject || 'Verify your email'),
      content_html: String(obj.verification?.content_html || '<p>Please verify your email</p>'),
      custom_template: Boolean(obj.verification?.custom_template),
      html_content: String(obj.verification?.html_content || '')
    },
    password_reset: {
      subject: String(obj.password_reset?.subject || 'Reset your password'),
      content_html: String(obj.password_reset?.content_html || '<p>Reset your password</p>'),
      custom_template: Boolean(obj.password_reset?.custom_template),
      html_content: String(obj.password_reset?.html_content || '')
    },
    magic_link: {
      subject: String(obj.magic_link?.subject || 'Your magic link'),
      content_html: String(obj.magic_link?.content_html || '<p>Click to sign in</p>'),
      custom_template: Boolean(obj.magic_link?.custom_template),
      html_content: String(obj.magic_link?.html_content || '')
    }
  };
};

const jsonToDirectoryIntegration = (json: Json): DirectoryIntegration => {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid directory integration data');
  }
  
  const obj = json as Record<string, any>;
  const provider = String(obj.provider || 'azure_ad');
  
  if (!['azure_ad', 'ldap', 'okta', 'google'].includes(provider)) {
    throw new Error(`Invalid provider type: ${provider}`);
  }
  
  return {
    id: String(obj.id || ''),
    provider: provider as DirectoryIntegration['provider'],
    config: obj.config || {},
    enabled: Boolean(obj.enabled),
    sync_interval: Number(obj.sync_interval || 24),
    last_sync: obj.last_sync ? String(obj.last_sync) : null
  };
};

class AuthConfigService {
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'password_policy')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_number: true,
          require_special: false
        };
      }
      
      return jsonToPasswordPolicy(data.setting_value);
    } catch (error) {
      console.error('Error fetching password policy:', error);
      return {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: false
      };
    }
  }
  
  async updatePasswordPolicy(policy: PasswordPolicy): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'password_policy',
          setting_value: policy as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating password policy:', error);
      return false;
    }
  }
  
  async getSessionSettings(): Promise<SessionSettings> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'session_settings')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          session_duration_seconds: 3600,
          refresh_token_rotation: true,
          refresh_token_expiry_days: 30
        };
      }
      
      return jsonToSessionSettings(data.setting_value);
    } catch (error) {
      console.error('Error fetching session settings:', error);
      return {
        session_duration_seconds: 3600,
        refresh_token_rotation: true,
        refresh_token_expiry_days: 30
      };
    }
  }
  
  async updateSessionSettings(settings: SessionSettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'session_settings',
          setting_value: settings as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating session settings:', error);
      return false;
    }
  }
  
  async getOAuthProviders(): Promise<OAuthProviders> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'oauth_providers')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          google: {
            enabled: false,
            client_id: '',
            secret: '',
            redirect_uri: ''
          },
          microsoft: {
            enabled: false,
            client_id: '',
            secret: '',
            redirect_uri: ''
          }
        };
      }
      
      return jsonToOAuthProviders(data.setting_value);
    } catch (error) {
      console.error('Error fetching OAuth providers:', error);
      return {
        google: {
          enabled: false,
          client_id: '',
          secret: '',
          redirect_uri: ''
        },
        microsoft: {
          enabled: false,
          client_id: '',
          secret: '',
          redirect_uri: ''
        }
      };
    }
  }
  
  async updateOAuthProviders(providers: OAuthProviders): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'oauth_providers',
          setting_value: providers as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating OAuth providers:', error);
      return false;
    }
  }
  
  async getEmailTemplates(): Promise<EmailTemplates> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'email_templates')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          verification: {
            subject: 'Verify your email',
            content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>',
            custom_template: false
          },
          password_reset: {
            subject: 'Reset your password',
            content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>',
            custom_template: false
          },
          magic_link: {
            subject: 'Your magic link',
            content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>',
            custom_template: false
          }
        };
      }
      
      return jsonToEmailTemplates(data.setting_value);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return {
        verification: {
          subject: 'Verify your email',
          content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>',
          custom_template: false
        },
        password_reset: {
          subject: 'Reset your password',
          content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>',
          custom_template: false
        },
        magic_link: {
          subject: 'Your magic link',
          content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>',
          custom_template: false
        }
      };
    }
  }
  
  async updateEmailTemplates(templates: EmailTemplates): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'email_templates',
          setting_value: templates as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating email templates:', error);
      return false;
    }
  }
  
  async isEmailVerificationRequired(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'email_verification_required')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return true;
      }
      
      return Boolean(data.setting_value);
    } catch (error) {
      console.error('Error checking email verification requirement:', error);
      return true;
    }
  }
  
  async setEmailVerificationRequired(required: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'email_verification_required',
          setting_value: required,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error setting email verification requirement:', error);
      return false;
    }
  }
  
  async getMfaSettings(): Promise<{ is_required: boolean, allowed_methods: string[] }> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'mfa_settings')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return {
          is_required: false,
          allowed_methods: ['totp']
        };
      }
      
      const settingValue = data.setting_value as any;
      
      return {
        is_required: Boolean(settingValue.is_required),
        allowed_methods: Array.isArray(settingValue.allowed_methods) 
          ? settingValue.allowed_methods 
          : ['totp']
      };
    } catch (error) {
      console.error('Error fetching MFA settings:', error);
      return {
        is_required: false,
        allowed_methods: ['totp']
      };
    }
  }
  
  async updateMfaSettings(settings: { is_required: boolean, allowed_methods: string[] }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_settings')
        .upsert({
          setting_key: 'mfa_settings',
          setting_value: settings as unknown as Json,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating MFA settings:', error);
      return false;
    }
  }
  
  async getDirectoryIntegrations(): Promise<DirectoryIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('directory_integrations')
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(item => jsonToDirectoryIntegration(item as unknown as Json));
    } catch (error) {
      console.error('Error fetching directory integrations:', error);
      return [];
    }
  }
  
  async createDirectoryIntegration(integration: Omit<DirectoryIntegration, 'id' | 'last_sync'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('directory_integrations')
        .insert({
          provider: integration.provider,
          config: integration.config as unknown as Json,
          enabled: integration.enabled,
          sync_interval: integration.sync_interval,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error creating directory integration:', error);
      throw error;
    }
  }
  
  async updateDirectoryIntegration(integration: DirectoryIntegration): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('directory_integrations')
        .update({
          provider: integration.provider,
          config: integration.config as unknown as Json,
          enabled: integration.enabled,
          sync_interval: integration.sync_interval,
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating directory integration:', error);
      return false;
    }
  }
  
  async deleteDirectoryIntegration(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('directory_integrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting directory integration:', error);
      return false;
    }
  }
}

export const authConfigService = new AuthConfigService();
