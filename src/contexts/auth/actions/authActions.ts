import { supabase } from "@/lib/supabase-client";
import { User, MOCK_USERS, UserImpl } from "../types";
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
    
    if (data?.user) {
      // Supabase auth successful
      console.log("Supabase auth successful:", data.user);
      
      // Fetch additional user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userData) {
        const user = new UserImpl({
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'user',
          department: userData.department,
          created_at: userData.created_at,
          last_login: userData.last_login,
          preferences: userData.preferences
        });
        
        setUser(user);
        
        // Store session info if "remember me" is checked
        if (remember) {
          localStorage.setItem("meetingmaster_user", JSON.stringify(user));
        }
        
        // Set session expiry
        resetSessionTimeout();
        return;
      } else {
        console.warn("User authenticated but no profile data found");
        
        // Create a basic user object from auth data
        const user = new UserImpl({
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          role: 'user', // Default role
          created_at: data.user.created_at
        });
        
        setUser(user);
        
        // Store session info if "remember me" is checked
        if (remember) {
          localStorage.setItem("meetingmaster_user", JSON.stringify(user));
        }
        
        // Set session expiry
        resetSessionTimeout();
        return;
      }
    }
    
    if (supabaseError) {
      console.error("Supabase auth error:", supabaseError);
      
      // For demo purposes, fall back to mock authentication
      console.warn("Falling back to mock authentication");
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

export const createNewUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Create new user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create user");
    throw err;
  } finally {
    setIsLoading(false);
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    department?: string;
  },
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Update user metadata in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: updates.first_name,
        last_name: updates.last_name
      }
    });
    
    if (authError) throw authError;
    
    // Update user data in our users table
    const { error: dbError } = await supabase
      .from('users')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        department: updates.department,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (dbError) throw dbError;
    
    return true;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update profile");
    return false;
  } finally {
    setIsLoading(false);
  }
};
