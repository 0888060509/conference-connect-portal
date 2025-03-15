
import { supabase } from "@/lib/supabase-client";

export const signInWithGoogleAuth = async (
  setError: (error: string | null) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Get the current origin for dynamic redirect
    const currentUrl = window.location.href;
    const baseUrl = window.location.origin;
    
    // Default redirect to the root/dashboard
    const redirectUrl = `${baseUrl}/`;
    
    console.log("Starting Google auth with redirect to:", redirectUrl);
    console.log("Current URL:", currentUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account', // Always show the account selector
          access_type: 'offline' // Needed for refresh tokens
        }
      }
    });
    
    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
    
    console.log("Google auth initiated, redirecting to provider");
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sign in with Google";
    console.error("Google auth error:", message);
    setError(message);
    setIsLoading(false); // Important: Set loading to false on error
    throw err;
  }
  // We don't set loading to false on success since we're redirecting to Google
};
