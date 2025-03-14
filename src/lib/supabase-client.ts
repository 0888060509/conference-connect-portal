
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (...args) => {
        return fetch(...args);
      },
    },
  }
);

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
