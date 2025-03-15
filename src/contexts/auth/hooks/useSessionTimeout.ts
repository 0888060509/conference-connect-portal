
import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "../types";
import { SESSION_TIMEOUT_DURATION } from "../utils/sessionUtils";

export const useSessionTimeout = (user: User | null, logout: () => Promise<void>) => {
  const [sessionTimeoutState, setSessionTimeoutState] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log("Session timeout cleared");
    }
  }, []);

  const resetSessionTimeout = useCallback(() => {
    // Clear any existing timeout
    clearTimeoutRef();

    // If user is logged in, set a new timeout
    if (user) {
      console.log("Setting session timeout");
      
      // Set the new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Session timeout triggered, logging out");
        setSessionTimeoutState(true);
        logout();
      }, SESSION_TIMEOUT_DURATION);
    }
  }, [user, logout, clearTimeoutRef]);

  // Clear the timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeoutRef();
    };
  }, [clearTimeoutRef]);

  // Reset the timeout when the user changes
  useEffect(() => {
    if (user) {
      resetSessionTimeout();
    } else {
      clearTimeoutRef();
    }
    
    // This is important: only run when user changes
  }, [user, resetSessionTimeout, clearTimeoutRef]);

  return {
    sessionTimeout: sessionTimeoutState,
    setSessionTimeoutState,
    resetSessionTimeout
  };
};
