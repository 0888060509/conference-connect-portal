
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for login request
interface LoginRequest {
  email: string;
  password: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { email, password }: LoginRequest = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log request for debugging (exclude sensitive info)
    console.log(`Login attempt for email: ${email}`);

    // Check if email is valid according to directory rules
    const { data: isValidUser, error: validationError } = await supabase.rpc(
      "validate_directory_user",
      { email }
    );

    if (validationError) {
      console.error("Error validating directory user:", validationError);
      return new Response(
        JSON.stringify({ error: "Error validating user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If not a valid directory user, reject login
    if (!isValidUser) {
      console.log(`Email domain not in allowed directory domains: ${email}`);
      return new Response(
        JSON.stringify({ error: "Email domain not authorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success - return the session data
    return new Response(
      JSON.stringify({ 
        session: data.session,
        user: data.user
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unexpected error in custom-login:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
