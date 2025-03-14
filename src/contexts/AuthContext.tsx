
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define user roles
export type UserRole = "user" | "admin";

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (in a real app, this would come from a backend)
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    department: "IT",
    position: "System Administrator"
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    department: "Marketing",
    position: "Marketing Specialist"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check for stored user on initial load
  useEffect(() => {
    const checkAuth = async () => {
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
          handleExternalAuthUser(session.user);
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
      } finally {
        // Ensure loading state is resolved
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          handleExternalAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("meetingmaster_user");
          localStorage.removeItem("meetingmaster_session_expiry");
        }
      }
    );
    
    // Simulate network delay to make loading state visible
    setTimeout(checkAuth, 1000);
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle external auth user (Google, etc)
  const handleExternalAuthUser = async (authUser: any) => {
    try {
      // For demo, create a mock user based on the external auth
      // In a real app, you would fetch the user profile from your database
      const newUser: User = {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "User",
        role: "user", // Default role for new users
      };
      
      setUser(newUser);
      
      // Store user if remember me is checked (for this demo, we always remember external auth)
      localStorage.setItem("meetingmaster_user", JSON.stringify(newUser));
      
      // Set session expiry
      resetSessionTimeout();
    } catch (err) {
      console.error("Error handling external auth user:", err);
    }
  };

  // Set up activity listeners to reset session timeout
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
  }, [user]);

  const resetSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    // Set new timeout (30 minutes = 1800000 ms)
    const newTimeout = setTimeout(() => {
      logout();
    }, 1800000);
    
    setSessionTimeout(newTimeout);
    
    // Update session expiry time
    localStorage.setItem("meetingmaster_session_expiry", (Date.now() + 1800000).toString());
  };

  const login = async (email: string, password: string, remember = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try Supabase auth
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (data.user) {
        // Supabase auth successful, user will be set by the auth state change listener
        return;
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

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local user state
    setUser(null);
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    
    // Clear stored data
    localStorage.removeItem("meetingmaster_user");
    localStorage.removeItem("meetingmaster_session_expiry");
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try Supabase password reset
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // For demo purposes, also check mock users
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        // We don't throw an error here to prevent user enumeration
        console.log(`Password reset requested for ${email} (not in mock users)`);
      } else {
        console.log(`Password reset requested for ${email} (mock user)`);
      }
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value = {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
