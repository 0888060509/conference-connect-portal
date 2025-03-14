
import { supabase } from "@/lib/supabase-client";

export const createNewUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Create new user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create user");
    throw err;
  } finally {
    setIsLoading(false);
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    department?: string;
  },
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Update user metadata in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: updates.first_name,
        last_name: updates.last_name
      }
    });
    
    if (authError) throw authError;
    
    // Update user data in our users table
    const { error: dbError } = await supabase
      .from('users')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        department: updates.department,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (dbError) throw dbError;
    
    return true;
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update profile");
    return false;
  } finally {
    setIsLoading(false);
  }
};
