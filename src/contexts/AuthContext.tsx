
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import * as AuthService from "../services/AuthService";

// Define user roles
export type UserRole = "user" | "admin";

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "meetly_auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const userData = await AuthService.verifyToken(token);
          if (userData) {
            setUser(userData);
          } else {
            // Invalid token
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await AuthService.login(email, password);
      
      if (!result) {
        throw new Error("Failed to sign in");
      }
      
      setUser(result.user);
      
      // Store token in localStorage if remember is true, otherwise in sessionStorage
      if (remember) {
        localStorage.setItem(TOKEN_KEY, result.token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, result.token);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AuthService.resetPasswordRequest(email);
      
      toast.success("Password reset email sent. Check your inbox.");
      
      return Promise.resolve();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
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
