
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tccxjcddzwnpfpnmekgq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjY3hqY2RkenducGZwbm1la2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MTgyMzcsImV4cCI6MjA1NzQ5NDIzN30.zJ-qKQTGVVg48oMYplF1mFeNPzbPUebLxUeDb0AjCbY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
