
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoleRequest {
  userId: string;
  role: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
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
    
    const currentUserId = user.id;
    
    // Check if current user is an admin
    const { data: isAdmin, error: adminCheckError } = await adminClient
      .from("users")
      .select("role")
      .eq("id", currentUserId)
      .single();
      
    if (adminCheckError || isAdmin?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle different request methods
    if (req.method === "GET") {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        // Get all roles for all users
        const { data, error } = await adminClient
          .from("user_role_assignments")
          .select(`
            id,
            user_id,
            role,
            assigned_at,
            assigned_by,
            users!assigned_by:users(email, first_name, last_name)
          `);
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Error fetching roles" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ roles: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Get roles for specific user
        const { data, error } = await adminClient
          .from("user_role_assignments")
          .select("role")
          .eq("user_id", userId);
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Error fetching roles" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const roles = data?.map(r => r.role) || [];
        
        return new Response(
          JSON.stringify({ roles }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } 
    else if (req.method === "POST") {
      // Assign role to user
      const { userId, role }: RoleRequest = await req.json();
      
      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: "User ID and role are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user exists
      const { data: userExists, error: userCheckError } = await adminClient
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();
        
      if (userCheckError || !userExists) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if assignment already exists
      const { data: existingRole } = await adminClient
        .from("user_role_assignments")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();
        
      if (existingRole) {
        return new Response(
          JSON.stringify({ message: "Role already assigned", id: existingRole.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create role assignment
      const { data, error } = await adminClient
        .from("user_role_assignments")
        .insert({
          user_id: userId,
          role,
          assigned_by: currentUserId
        })
        .select()
        .single();
        
      if (error) {
        return new Response(
          JSON.stringify({ error: "Error assigning role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: currentUserId,
          action: "assign_role",
          resource_type: "user_role",
          resource_id: data.id,
          details: { user_id: userId, role }
        });
      
      return new Response(
        JSON.stringify({ message: "Role assigned successfully", assignment: data }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (req.method === "DELETE") {
      // Remove role from user
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      const role = url.searchParams.get("role");
      
      if (!userId || !role) {
        return new Response(
          JSON.stringify({ error: "User ID and role are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Delete role assignment
      const { data, error } = await adminClient
        .from("user_role_assignments")
        .delete()
        .eq("user_id", userId)
        .eq("role", role)
        .select();
        
      if (error) {
        return new Response(
          JSON.stringify({ error: "Error removing role" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (data && data.length > 0) {
        // Log the action
        await adminClient
          .from("audit_logs")
          .insert({
            user_id: currentUserId,
            action: "remove_role",
            resource_type: "user_role",
            resource_id: data[0].id,
            details: { user_id: userId, role }
          });
          
        return new Response(
          JSON.stringify({ message: "Role removed successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ message: "Role was not assigned" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in role-management:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
