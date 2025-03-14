
import { supabase } from "@/lib/supabase-client";
import { User, MOCK_USERS, UserImpl } from "../types";

export const loginWithCredentials = async (
  email: string,
  password: string,
  remember = false,
  setUser: (user: User | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void,
  resetSessionTimeout: () => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // First try Supabase auth
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (data?.user) {
      // Supabase auth successful
      console.log("Supabase auth successful:", data.user);
      
      // Fetch additional user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userData) {
        const user = new UserImpl({
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'user',
          department: userData.department,
          created_at: userData.created_at,
          last_login: userData.last_login,
          preferences: userData.preferences
        });
        
        setUser(user);
        
        // Store session info if "remember me" is checked
        if (remember) {
          localStorage.setItem("meetingmaster_user", JSON.stringify(user));
        }
        
        // Set session expiry
        resetSessionTimeout();
        return;
      } else {
        console.warn("User authenticated but no profile data found");
        
        // Create a basic user object from auth data
        const user = new UserImpl({
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          role: 'user', // Default role
          created_at: data.user.created_at
        });
        
        setUser(user);
        
        // Store session info if "remember me" is checked
        if (remember) {
          localStorage.setItem("meetingmaster_user", JSON.stringify(user));
        }
        
        // Set session expiry
        resetSessionTimeout();
        return;
      }
    }
    
    if (supabaseError) {
      console.error("Supabase auth error:", supabaseError);
      
      // For demo purposes, fall back to mock authentication
      console.warn("Falling back to mock authentication");
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
