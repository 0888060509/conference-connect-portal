
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";

export const initializeAuthState = async (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    // Check for an active session in Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // If we have a session, fetch the user data from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role,
          department: userData.department,
          created_at: userData.created_at,
          last_login: userData.last_login,
          preferences: userData.preferences
        };
        
        setUser(user);
        resetSessionTimeout();
      } else {
        // If no user data found, check local storage as fallback
        checkLocalStorage(setUser, resetSessionTimeout);
      }
    } else {
      // If no active session, check local storage as fallback for demo purposes
      checkLocalStorage(setUser, resetSessionTimeout);
    }
  } catch (err) {
    console.error("Error initializing auth state:", err);
    // Fallback to local storage
    checkLocalStorage(setUser, resetSessionTimeout);
  } finally {
    setIsLoading(false);
  }
};

export const setupAuthStateChangeListener = (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void
) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      // User signed in, fetch their data from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role,
          department: userData.department,
          created_at: userData.created_at,
          last_login: userData.last_login,
          preferences: userData.preferences
        };
        
        setUser(user);
        resetSessionTimeout();
      }
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });
};

export const handleExternalAuthUser = async (
  user: any,
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void
) => {
  try {
    // Fetch user data from our users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userData) {
      const appUser: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role,
        department: userData.department,
        created_at: userData.created_at,
        last_login: userData.last_login,
        preferences: userData.preferences
      };
      
      setUser(appUser);
      resetSessionTimeout();
    }
  } catch (err) {
    console.error("Error handling external auth user:", err);
  }
};

// Helper function to check local storage for user data (used for demo/fallback)
const checkLocalStorage = (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void
) => {
  try {
    const storedUser = localStorage.getItem("meetingmaster_user");
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      setUser(user);
      resetSessionTimeout();
    }
  } catch (err) {
    console.error("Error checking local storage:", err);
  }
};
