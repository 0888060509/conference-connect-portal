
import React, { createContext, useState, useEffect, useCallback } from "react";
import { User, AuthContextType } from "./types";
import { 
  loginWithCredentials, 
  logoutUser, 
  resetUserPassword, 
  signInWithGoogleAuth 
} from "./actions/authActions";
import { 
  initializeAuthState,
  setupAuthStateChangeListener
} from "./utils/sessionUtils";
import { useSessionTimeout } from "./hooks/useSessionTimeout";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define logout function ahead to use in useSessionTimeout hook
  const logout = useCallback(async () => {
    await logoutUser(sessionTimeout, setUser, setSessionTimeoutState);
  }, []);

  // Use the session timeout hook
  const { 
    sessionTimeout, 
    setSessionTimeoutState, 
    resetSessionTimeout 
  } = useSessionTimeout(user, logout);

  // Check for stored user on initial load
  useEffect(() => {
    // Simulate network delay to make loading state visible
    setTimeout(() => {
      initializeAuthState(setUser, resetSessionTimeout, setIsLoading);
    }, 1000);
    
    // Set up auth state change listener
    const { data: { subscription } } = setupAuthStateChangeListener(setUser, resetSessionTimeout);
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [resetSessionTimeout]);

  const login = async (email: string, password: string, remember = false) => {
    return loginWithCredentials(
      email, 
      password, 
      remember, 
      setUser, 
      setIsLoading, 
      setError, 
      resetSessionTimeout
    );
  };

  const resetPassword = async (email: string) => {
    return resetUserPassword(email, setIsLoading, setError);
  };

  const signInWithGoogle = async () => {
    return signInWithGoogleAuth(setError, setIsLoading);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
