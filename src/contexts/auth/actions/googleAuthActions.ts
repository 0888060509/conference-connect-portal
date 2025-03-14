
import { supabase } from "@/lib/supabase-client";

export const signInWithGoogleAuth = async (
  setError: (error: string | null) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Get the current origin for dynamic redirect
    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log("Setting Google auth redirect to:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    
    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sign in with Google";
    console.error("Google auth error:", message);
    setError(message);
    throw err;
  } finally {
    // Don't set loading to false here as we're redirecting to Google
    // Loading state will be handled when user returns from redirect
  }
};

// Function to set user as superadmin
export const setSuperAdminRole = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (error) {
      console.error("Error setting superadmin role:", error);
      throw error;
    }
    
    console.log("Successfully set superadmin role for user:", userId);
    return true;
  } catch (err) {
    console.error("Failed to set superadmin role:", err);
    return false;
  }
};

// Function to check if an email is configured as a superadmin
export const checkSuperAdminEmail = async (email: string): Promise<boolean> => {
  try {
    // Get list of superadmin emails from settings
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'superadmin_emails')
      .single();
    
    if (error) {
      console.error("Error fetching superadmin emails:", error);
      return false;
    }
    
    if (!data || !data.setting_value) {
      return false;
    }
    
    // Check if the provided email is in the superadmin list
    const superadminEmails = (data.setting_value as string[]) || [];
    return superadminEmails.includes(email.toLowerCase());
  } catch (err) {
    console.error("Error checking superadmin email:", err);
    return false;
  }
};
