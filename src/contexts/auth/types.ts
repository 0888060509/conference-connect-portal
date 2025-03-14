
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";

// Define user roles
export type UserRole = "user" | "admin";

// Define user interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  role: UserRole;
  created_at?: string;
  last_login?: string;
  preferences?: Json;
  
  // Computed property for easy access to full name
  get name(): string;
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

// Modified User class to include a name getter
export class UserImpl implements User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  role: UserRole;
  created_at?: string;
  last_login?: string;
  preferences?: Json;

  constructor(data: Omit<User, 'name'>) {
    this.id = data.id;
    this.email = data.email;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.department = data.department;
    this.role = data.role;
    this.created_at = data.created_at;
    this.last_login = data.last_login;
    this.preferences = data.preferences;
  }

  get name(): string {
    const fullName = `${this.first_name} ${this.last_name}`.trim();
    return fullName || this.email;
  }
}

// Mock user data (in a real app, this would come from a backend)
export const MOCK_USERS: User[] = [
  new UserImpl({
    id: "1",
    email: "admin@example.com",
    first_name: "Admin",
    last_name: "User",
    role: "admin",
    department: "IT"
  }),
  new UserImpl({
    id: "2",
    email: "user@example.com",
    first_name: "Regular",
    last_name: "User",
    role: "user",
    department: "Marketing"
  })
];
