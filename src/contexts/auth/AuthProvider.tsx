
import React, { createContext, useState, useEffect, useCallback } from "react";
import { User, AuthContextType } from "./types";
import { 
  loginWithCredentials, 
  logoutUser, 
  resetUserPassword, 
  signInWithGoogleAuth 
} from "./actions";
import { 
  initializeAuthState,
  setupAuthStateChangeListener
} from "./utils/sessionUtils";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define logout function ahead to use in useSessionTimeout hook
  const logout = useCallback(async () => {
    await logoutUser(sessionTimeout, setUser, setSessionTimeoutState);
    toast.success("You've been signed out successfully");
  }, []);

  // Use the session timeout hook
  const { 
    sessionTimeout, 
    setSessionTimeoutState, 
    resetSessionTimeout 
  } = useSessionTimeout(user, logout);

  // Check for stored user on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // First, check for a Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found Supabase session:", session);
          
          // Get user data from Supabase
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            console.log("User data found:", userData);
            initializeAuthState(setUser, resetSessionTimeout, setIsLoading, userData);
          } else {
            console.log("No user data found, falling back to session initialization");
            initializeAuthState(setUser, resetSessionTimeout, setIsLoading);
          }
        } else {
          console.log("No Supabase session, checking local storage");
          setIsLoading(false); // Set loading to false immediately if no session found
          initializeAuthState(setUser, resetSessionTimeout, setIsLoading);
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setIsLoading(false); // Ensure loading state is updated even if there's an error
        initializeAuthState(setUser, resetSessionTimeout, setIsLoading);
      }
    };
    
    // Initialize auth immediately without delay
    initAuth();
    
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
