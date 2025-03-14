
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
}

export interface OAuthProviders {
  google: OAuthProvider;
  microsoft: OAuthProvider;
}

export interface EmailTemplate {
  subject: string;
  content_html: string;
}

export interface EmailTemplates {
  verification: EmailTemplate;
  password_reset: EmailTemplate;
  magic_link: EmailTemplate;
}

// Helper functions to safely cast between types
const jsonToPasswordPolicy = (json: Json | null): PasswordPolicy => {
  if (!json || typeof json !== 'object') {
    // Default policy if none exists
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
    // Default settings if none exists
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
    // Default providers if none exists
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
  
  const obj = json as Record<string, any>;
  const defaultProvider = {
    enabled: false,
    client_id: '',
    secret: '',
    redirect_uri: ''
  };
  
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
      redirect_uri: String(obj.microsoft?.redirect_uri || '')
    }
  };
};

const jsonToEmailTemplates = (json: Json | null): EmailTemplates => {
  if (!json || typeof json !== 'object') {
    // Default templates if none exists
    return {
      verification: {
        subject: 'Verify your email',
        content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>'
      },
      password_reset: {
        subject: 'Reset your password',
        content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>'
      },
      magic_link: {
        subject: 'Your magic link',
        content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>'
      }
    };
  }
  
  const obj = json as Record<string, any>;
  const defaultTemplate = {
    subject: '',
    content_html: ''
  };
  
  return {
    verification: {
      subject: String(obj.verification?.subject || 'Verify your email'),
      content_html: String(obj.verification?.content_html || '<p>Please verify your email</p>')
    },
    password_reset: {
      subject: String(obj.password_reset?.subject || 'Reset your password'),
      content_html: String(obj.password_reset?.content_html || '<p>Reset your password</p>')
    },
    magic_link: {
      subject: String(obj.magic_link?.subject || 'Your magic link'),
      content_html: String(obj.magic_link?.content_html || '<p>Click to sign in</p>')
    }
  };
};

class AuthConfigService {
  // Get password policy from auth settings
  async getPasswordPolicy(): Promise<PasswordPolicy> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'password_policy')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Default policy if none exists
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
      // Return default policy
      return {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: false
      };
    }
  }
  
  // Update password policy
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
  
  // Get session settings from auth settings
  async getSessionSettings(): Promise<SessionSettings> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'session_settings')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Default settings if none exists
        return {
          session_duration_seconds: 3600,
          refresh_token_rotation: true,
          refresh_token_expiry_days: 30
        };
      }
      
      return jsonToSessionSettings(data.setting_value);
    } catch (error) {
      console.error('Error fetching session settings:', error);
      // Return default settings
      return {
        session_duration_seconds: 3600,
        refresh_token_rotation: true,
        refresh_token_expiry_days: 30
      };
    }
  }
  
  // Update session settings
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
  
  // Get OAuth providers config from auth settings
  async getOAuthProviders(): Promise<OAuthProviders> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'oauth_providers')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Default providers if none exists
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
      // Return default providers
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
  
  // Update OAuth providers config
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
  
  // Get email templates from auth settings
  async getEmailTemplates(): Promise<EmailTemplates> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'email_templates')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Default templates if none exists
        return {
          verification: {
            subject: 'Verify your email',
            content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>'
          },
          password_reset: {
            subject: 'Reset your password',
            content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>'
          },
          magic_link: {
            subject: 'Your magic link',
            content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>'
          }
        };
      }
      
      return jsonToEmailTemplates(data.setting_value);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      // Return default templates
      return {
        verification: {
          subject: 'Verify your email',
          content_html: '<p>Please verify your email by clicking the link: {{ .ConfirmationURL }}</p>'
        },
        password_reset: {
          subject: 'Reset your password',
          content_html: '<p>Reset your password by clicking the link: {{ .ConfirmationURL }}</p>'
        },
        magic_link: {
          subject: 'Your magic link',
          content_html: '<p>Click the link to sign in: {{ .ConfirmationURL }}</p>'
        }
      };
    }
  }
  
  // Update email templates
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
  
  // Check if email verification is required for signup
  async isEmailVerificationRequired(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'email_verification_required')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return true; // Default to true if setting doesn't exist
      }
      
      return Boolean(data.setting_value);
    } catch (error) {
      console.error('Error checking email verification requirement:', error);
      return true; // Default to true on error
    }
  }
  
  // Set whether email verification is required for signup
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
  
  // Get MFA settings for an organization
  async getMfaSettings(): Promise<{ is_required: boolean, allowed_methods: string[] }> {
    try {
      const { data, error } = await supabase
        .from('auth_settings')
        .select('setting_value')
        .eq('setting_key', 'mfa_settings')
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Default MFA settings if none exists
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
      // Return default settings
      return {
        is_required: false,
        allowed_methods: ['totp']
      };
    }
  }
  
  // Update MFA settings for an organization
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
}

export const authConfigService = new AuthConfigService();
