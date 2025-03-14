
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";

// Handle external auth user (Google, etc)
export const handleExternalAuthUser = async (authUser: any): Promise<User> => {
  try {
    // For demo, create a mock user based on the external auth
    // In a real app, you would fetch the user profile from your database
    const newUser: User = {
      id: authUser.id,
      email: authUser.email || "",
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "User",
      role: "user", // Default role for new users
    };
    
    // Store user if remember me is checked (for this demo, we always remember external auth)
    localStorage.setItem("meetingmaster_user", JSON.stringify(newUser));
    
    // Set session expiry
    localStorage.setItem("meetingmaster_session_expiry", (Date.now() + 1800000).toString());
    
    return newUser;
  } catch (err) {
    console.error("Error handling external auth user:", err);
    throw err;
  }
};

// Reset session timeout
export const setSessionTimeout = (callback: () => void): NodeJS.Timeout => {
  // Set new timeout (30 minutes = 1800000 ms)
  const newTimeout = setTimeout(() => {
    callback();
  }, 1800000);
  
  // Update session expiry time
  localStorage.setItem("meetingmaster_session_expiry", (Date.now() + 1800000).toString());
  
  return newTimeout;
};

// Initialize auth state
export const initializeAuthState = async (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    const storedUser = localStorage.getItem("meetingmaster_user");
    const storedExpiry = localStorage.getItem("meetingmaster_session_expiry");
    
    if (storedUser && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      
      // Check if session is still valid
      if (expiryTime > Date.now()) {
        setUser(JSON.parse(storedUser));
        resetSessionTimeout();
      } else {
        // Session expired
        localStorage.removeItem("meetingmaster_user");
        localStorage.removeItem("meetingmaster_session_expiry");
      }
    }
    
    // Check for Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userObj = await handleExternalAuthUser(session.user);
      setUser(userObj);
      resetSessionTimeout();
    }
  } catch (e) {
    console.error("Auth initialization error:", e);
  } finally {
    // Ensure loading state is resolved
    setIsLoading(false);
  }
};

// Setup auth state change listener
export const setupAuthStateChangeListener = (
  setUser: (user: User | null) => void,
  resetSessionTimeout: () => void
) => {
  return supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userObj = await handleExternalAuthUser(session.user);
        setUser(userObj);
        resetSessionTimeout();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("meetingmaster_user");
        localStorage.removeItem("meetingmaster_session_expiry");
      }
    }
  );
};
