
import { createClient } from '@supabase/supabase-js';

// Use import.meta.env instead of process.env for Vite projects
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tccxjcddzwnpfpnmekgq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjY3hqY2RkenducGZwbm1la2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MTgyMzcsImV4cCI6MjA1NzQ5NDIzN30.zJ-qKQTGVVg48oMYplF1mFeNPzbPUebLxUeDb0AjCbY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
