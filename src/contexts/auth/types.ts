
import { User as SupabaseUser } from "@supabase/supabase-js";

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

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>; // Updated to match the return type from signInWithGoogleAuth
  error: string | null;
  clearError: () => void;
}

// Mock user data (in a real app, this would come from a backend)
export const MOCK_USERS: User[] = [
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
