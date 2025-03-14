
import { supabase } from "@/lib/supabase-client";

export const signInWithGoogleAuth = async (
  setError: (error: string | null) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
