
import { useState, useEffect, useCallback } from 'react';
import { setSessionTimeout } from '../utils/sessionUtils';

export const useSessionTimeout = (user: any, logoutFn: () => void) => {
  const [sessionTimeout, setSessionTimeoutState] = useState<NodeJS.Timeout | null>(null);

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    const newTimeout = setSessionTimeout(() => {
      logoutFn();
    });
    
    setSessionTimeoutState(newTimeout);
  }, [sessionTimeout, logoutFn]);

  // Set up activity listeners to reset session timeout
  /*
  useEffect(() => {
    if (user) {
      // Reset timeout on user activity
      const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
      const resetTimeout = () => resetSessionTimeout();
      
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimeout);
      });
      
      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, resetTimeout);
        });
      };
    }
  }, [user, resetSessionTimeout]);
*/
  return { sessionTimeout, setSessionTimeoutState, resetSessionTimeout };
};
