
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Use import.meta.env instead of process.env for Vite projects
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tccxjcddzwnpfpnmekgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjY3hqY2RkenducGZwbm1la2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MTgyMzcsImV4cCI6MjA1NzQ5NDIzN30.zJ-qKQTGVVg48oMYplF1mFeNPzbPUebLxUeDb0AjCbY';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// For backward compatibility with existing code
export const supabaseClient = supabase;

// Error handler for Supabase operations
export const handleSupabaseError = (error: Error | null, message: string = 'An error occurred'): void => {
  if (error) {
    console.error(`${message}:`, error);
    toast.error(message);
  }
};

// Retry logic for failed requests
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      
      if (attempt < maxRetries - 1) {
        // Wait for delay before retrying (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
};
