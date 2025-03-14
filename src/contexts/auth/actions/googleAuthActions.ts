
import { supabase } from "@/lib/supabase-client";

export const signInWithGoogleAuth = async (
  setError: (error: string | null) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setError(null);
    setIsLoading(true);
    
    // Get current origin for redirects
    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log("Redirect URL:", redirectUrl);
    
    // Use immediate_redirect: false to prevent popup blockers
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
    
    console.log("Google sign-in initiated successfully");
    return data;
  } catch (err) {
    console.error("Google sign-in exception:", err);
    setError(err instanceof Error ? err.message : "Google sign-in failed");
    setIsLoading(false);
    throw err;
  }
};
