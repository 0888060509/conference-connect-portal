
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Import the Supabase client from the integrations folder
import { supabase } from '@/integrations/supabase/client';

// Create supabase client using the imported one's URL and key
export const supabaseClient = createClient<Database>(
  supabase.getUrl().toString(),
  supabase.getPublicKey() || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (url, options) => {
        return fetch(url, options);
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
