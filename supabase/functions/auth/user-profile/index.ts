
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for profile update request
interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  department?: string;
  preferences?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT token from the request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token and get user ID
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = user.id;

    // Handle different request methods
    if (req.method === "GET") {
      // Fetch user profile
      const { data: profile, error: profileError } = await adminClient
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) {
        return new Response(
          JSON.stringify({ error: "Error fetching profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get assigned roles
      const { data: roleAssignments, error: rolesError } = await adminClient
        .from("user_role_assignments")
        .select("role")
        .eq("user_id", userId);
        
      if (rolesError) {
        return new Response(
          JSON.stringify({ error: "Error fetching roles" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const roles = roleAssignments?.map(r => r.role) || [];
      
      return new Response(
        JSON.stringify({ profile: { ...profile, roles } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (req.method === "PUT" || req.method === "PATCH") {
      // Update user profile
      const updates: ProfileUpdateRequest = await req.json();
      
      // Validate input
      if (Object.keys(updates).length === 0) {
        return new Response(
          JSON.stringify({ error: "No update data provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Only allow certain fields to be updated
      const allowedUpdates: Record<string, any> = {};
      if (updates.first_name !== undefined) allowedUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) allowedUpdates.last_name = updates.last_name;
      if (updates.department !== undefined) allowedUpdates.department = updates.department;
      if (updates.preferences !== undefined) allowedUpdates.preferences = updates.preferences;
      
      const { data, error } = await adminClient
        .from("users")
        .update(allowedUpdates)
        .eq("id", userId)
        .select()
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ error: "Error updating profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update user metadata in auth.users if name changed
      if (updates.first_name !== undefined || updates.last_name !== undefined) {
        await adminClient.auth.admin.updateUserById(userId, {
          user_metadata: { 
            first_name: updates.first_name || user.user_metadata?.first_name,
            last_name: updates.last_name || user.user_metadata?.last_name
          }
        });
      }
      
      return new Response(
        JSON.stringify({ profile: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in user-profile:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
