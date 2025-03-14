
import { supabase } from "@/integrations/supabase/client";
import { User, MOCK_USERS } from "../types";
import { handleExternalAuthUser } from "../utils/sessionUtils";

export const loginWithCredentials = async (
  email: string,
  password: string,
  remember = false,
  setUser: (user: User | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void,
  resetSessionTimeout: () => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // First try Supabase auth
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (data.user) {
      // Supabase auth successful, user will be set by the auth state change listener
      return;
    }
    
    // If Supabase auth fails, try mock authentication for demo purposes
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication (in a real app, this would validate against a backend)
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && password === "password") { // Mock password check
      setUser(foundUser);
      
      // Store user if "remember me" is checked
      if (remember) {
        localStorage.setItem("meetingmaster_user", JSON.stringify(foundUser));
      }
      
      // Set session expiry
      resetSessionTimeout();
    } else {
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unknown error occurred");
    throw err;
  } finally {
    setIsLoading(false);
  }
};

export const logoutUser = async (
  sessionTimeout: NodeJS.Timeout | null,
  setUser: (user: User | null) => void,
  setSessionTimeoutState: (timeout: NodeJS.Timeout | null) => void
) => {
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear local user state
  setUser(null);
  
  // Clear session timeout
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
    setSessionTimeoutState(null);
  }
  
  // Clear stored data
  localStorage.removeItem("meetingmaster_user");
  localStorage.removeItem("meetingmaster_session_expiry");
};

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
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (supabaseError) {
      throw supabaseError;
    }
    
    // For demo purposes, also check mock users
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      // We don't throw an error here to prevent user enumeration
      console.log(`Password reset requested for ${email} (not in mock users)`);
    } else {
      console.log(`Password reset requested for ${email} (mock user)`);
    }
    
    return Promise.resolve();
  } catch (err) {
    setError(err instanceof Error ? err.message : "An unknown error occurred");
    return Promise.reject(err);
  } finally {
    setIsLoading(false);
  }
};

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
        },
        skipBrowserRedirect: false
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
