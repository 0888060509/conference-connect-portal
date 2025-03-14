
import { supabase } from "@/lib/supabase-client";

export const resetUserPassword = async (
  email: string,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Try Supabase password reset
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (supabaseError) {
      throw supabaseError;
    }
    
    console.log(`Password reset requested for ${email}`);
    
    return Promise.resolve();
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unknown error occurred");
    return Promise.reject(err);
  } finally {
    setIsLoading(false);
  }
};
