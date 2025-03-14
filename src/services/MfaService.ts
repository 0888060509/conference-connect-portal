
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MfaMethod {
  type: 'totp' | 'sms'; // Time-based one-time password or SMS
  id: string;
  name: string;
  verified: boolean;
  created_at: string;
}

interface TotpSetupResponse {
  qr_code: string;
  secret: string;
  uri: string;
}

class MfaService {
  async setupTotp(userId: string): Promise<TotpSetupResponse | null> {
    try {
      // In a real implementation, we would call Supabase Auth API to set up TOTP
      // For demo purposes, we'll just simulate the response
      const response: TotpSetupResponse = {
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        secret: 'ABCDEFGHIJKLMNOP',
        uri: 'otpauth://totp/MeetingMaster:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=MeetingMaster'
      };
      
      // Add the method to the MFA settings
      const newMethod: MfaMethod = {
        type: 'totp',
        id: crypto.randomUUID(),
        name: 'Authenticator App',
        verified: false,
        created_at: new Date().toISOString()
      };
      
      // Get current MFA settings
      const { data: mfaData } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (mfaData) {
        // Update existing settings
        const methods = [...mfaData.methods, newMethod];
        await supabase
          .from('mfa_settings')
          .update({ methods })
          .eq('user_id', userId);
      } else {
        // Create new settings
        await supabase
          .from('mfa_settings')
          .insert({
            user_id: userId,
            is_enabled: false,
            methods: [newMethod],
            recovery_codes: []
          });
      }
      
      return response;
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      toast.error('Failed to set up authenticator app');
      return null;
    }
  }
  
  async verifyTotp(
    userId: string, 
    methodId: string, 
    code: string
  ): Promise<boolean> {
    try {
      // In a real implementation, we would verify the TOTP code with Supabase Auth API
      // For demo purposes, we'll just accept any 6-digit code
      if (!/^\d{6}$/.test(code)) {
        toast.error('Invalid code format. Must be 6 digits.');
        return false;
      }
      
      // Get current MFA settings
      const { data: mfaData, error } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      // Find the method and mark it as verified
      const methods = mfaData.methods.map((method: MfaMethod) => {
        if (method.id === methodId) {
          return { ...method, verified: true };
        }
        return method;
      });
      
      // Update the MFA settings
      await supabase
        .from('mfa_settings')
        .update({ methods })
        .eq('user_id', userId);
      
      toast.success('Authenticator app verified successfully');
      return true;
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast.error('Failed to verify authenticator app');
      return false;
    }
  }
  
  async enableMfa(userId: string): Promise<boolean> {
    try {
      // Get current MFA settings
      const { data: mfaData, error } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      // Check if there's at least one verified method
      const hasVerifiedMethod = mfaData.methods.some((method: MfaMethod) => method.verified);
      
      if (!hasVerifiedMethod) {
        toast.error('You need at least one verified method to enable MFA');
        return false;
      }
      
      // Generate recovery codes if none exist
      let recoveryCodes = mfaData.recovery_codes;
      if (!recoveryCodes || recoveryCodes.length === 0) {
        recoveryCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 7) + 
          '-' + 
          Math.random().toString(36).substring(2, 7)
        );
      }
      
      // Update the MFA settings
      await supabase
        .from('mfa_settings')
        .update({ 
          is_enabled: true,
          recovery_codes: recoveryCodes 
        })
        .eq('user_id', userId);
      
      toast.success('MFA enabled successfully');
      return true;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      toast.error('Failed to enable MFA');
      return false;
    }
  }
  
  async disableMfa(userId: string): Promise<boolean> {
    try {
      // Update the MFA settings
      await supabase
        .from('mfa_settings')
        .update({ is_enabled: false })
        .eq('user_id', userId);
      
      toast.success('MFA disabled successfully');
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Failed to disable MFA');
      return false;
    }
  }
  
  async getRecoveryCodes(userId: string): Promise<string[]> {
    try {
      // Get current MFA settings
      const { data: mfaData, error } = await supabase
        .from('mfa_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      return mfaData.recovery_codes || [];
    } catch (error) {
      console.error('Error getting recovery codes:', error);
      toast.error('Failed to get recovery codes');
      return [];
    }
  }
  
  async regenerateRecoveryCodes(userId: string): Promise<string[]> {
    try {
      // Generate new recovery codes
      const recoveryCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 7) + 
        '-' + 
        Math.random().toString(36).substring(2, 7)
      );
      
      // Update the MFA settings
      await supabase
        .from('mfa_settings')
        .update({ recovery_codes: recoveryCodes })
        .eq('user_id', userId);
      
      toast.success('Recovery codes regenerated successfully');
      return recoveryCodes;
    } catch (error) {
      console.error('Error regenerating recovery codes:', error);
      toast.error('Failed to regenerate recovery codes');
      return [];
    }
  }
}

// Export singleton instance
export const mfaService = new MfaService();
