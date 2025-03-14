
import { User, UserImpl } from "../types";
import { supabase } from "@/lib/supabase-client";

// Define the session timeout duration (30 minutes)
export const SESSION_TIMEOUT_DURATION = 30 * 60 * 1000;

// Helper function to set a session timeout
export const setSessionTimeout = (logoutCallback: () => void): NodeJS.Timeout => {
  console.log("Setting session timeout");
  return setTimeout(logoutCallback, SESSION_TIMEOUT_DURATION);
};

export const initializeAuthState = async (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void,
  setIsLoading: (isLoading: boolean) => void,
  userData?: any
) => {
  try {
    // If userData was provided, use it directly
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
      resetSessionTimeout();
      setIsLoading(false);
      return;
    } else {
      // Check for an active session in Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("Active session found for user:", session.user.email);
        
        // If we have a session, fetch the user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          console.log("User data retrieved from database:", userData.email);
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
          resetSessionTimeout();
        } else if (error) {
          console.error("Error fetching user data:", error);
          // Create a basic user from the session data
          const user = new UserImpl({
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            role: 'user',
            created_at: session.user.created_at
          });
          
          setUser(user);
          resetSessionTimeout();
        } else {
          console.log("No user data found, but session exists. Creating basic user from session.");
          // Create a basic user from the session data
          const user = new UserImpl({
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            role: 'user',
            created_at: session.user.created_at
          });
          
          setUser(user);
          resetSessionTimeout();
        }
      } else {
        // If no active session, check local storage as fallback for demo purposes
        console.log("No active session, checking local storage");
        checkLocalStorage(setUser, resetSessionTimeout);
      }
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
      console.log("User signed in:", session.user.email);
      // User signed in, fetch their data from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
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
        resetSessionTimeout();
      } else {
        // If no user data found, create a basic user from session
        console.log("No user data found in database after sign in. Creating from session.");
        const user = new UserImpl({
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: 'user',
          created_at: session.user.created_at
        });
        
        setUser(user);
        resetSessionTimeout();
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out");
      setUser(null);
    } else if (event === 'TOKEN_REFRESHED') {
      console.log("Token refreshed");
      // Don't change the user state as this is just a token refresh
    }
  });
};

export const handleExternalAuthUser = async (session: any) => {
  if (!session || !session.user) return null;
  
  console.log("Processing external auth user:", session.user);
  
  // Check if we need to create or update user profile in our tables
  try {
    // Handle profile data for users coming from OAuth providers
    const metadata = session.user.user_metadata || {};
    const avatarUrl = metadata.avatar_url || null;
    const fullName = metadata.full_name || null;
    
    console.log("OAuth metadata:", metadata);
    
    // Check if we need to update the user profile in our users table
    if (avatarUrl || fullName) {
      // Split name if available
      let firstName = '';
      let lastName = '';
      
      if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Update profile if needed
      const { error } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          first_name: firstName || metadata.first_name || '',
          last_name: lastName || metadata.last_name || '',
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error("Error updating user profile:", error);
      }
    }
    
    return session;
  } catch (error) {
    console.error("Error processing external auth user:", error);
    return session;
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
      console.log("Found user data in local storage");
      const userData = JSON.parse(storedUser);
      // Convert plain object to UserImpl instance
      const user = new UserImpl(userData);
      setUser(user);
      resetSessionTimeout();
    } else {
      console.log("No user data found in local storage");
      setUser(null);
    }
  } catch (err) {
    console.error("Error checking local storage:", err);
    setUser(null);
  }
};
