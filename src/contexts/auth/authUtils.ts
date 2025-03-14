
import { User } from "./types";
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
