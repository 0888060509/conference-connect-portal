
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
    const redirectUrl = `${baseUrl}/dashboard`;
    
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
      setError(error.message);
      setIsLoading(false);
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

// Add a helper function to properly handle Google metadata
export const processGoogleAuthUserData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found");
      return null;
    }
    
    const { user } = session;
    
    if (!user) {
      console.log("No user found in session");
      return null;
    }
    
    // Log what metadata we have access to from Google
    console.log("Google auth user metadata:", user.user_metadata);
    
    // Check if this user already exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "row not found"
      console.error("Error checking for existing user:", userError);
    }
    
    // If user doesn't exist yet, we'll create them (this should be handled by the trigger but just in case)
    if (!existingUser) {
      console.log("User not found in database, creating new user record");
      
      // Extract data from Google metadata
      const firstName = user.user_metadata?.full_name 
        ? user.user_metadata.full_name.split(' ')[0] 
        : user.user_metadata?.name?.split(' ')[0] || '';
        
      const lastName = user.user_metadata?.full_name 
        ? user.user_metadata.full_name.split(' ').slice(1).join(' ') 
        : user.user_metadata?.name?.split(' ').slice(1).join(' ') || '';
      
      // Create user record manually
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error creating user record:", insertError);
      } else {
        console.log("Successfully created user record for:", user.email);
      }
    } else {
      // Update the last_login time
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Error updating last_login:", updateError);
      }
    }
    
    return user;
  } catch (err) {
    console.error("Error processing Google auth user:", err);
    return null;
  }
};
