
import { supabase } from "@/lib/supabase-client";
import { User } from "../types";

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
