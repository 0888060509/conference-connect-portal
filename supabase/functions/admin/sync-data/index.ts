
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT token from the request header for authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token and get user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = user.id;
    
    // Check if user is an admin
    const { data: userData, error: userRoleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
      
    if (userRoleError || userData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body for operations
    const { pendingOperations } = await req.json();
    
    if (!pendingOperations || !Array.isArray(pendingOperations)) {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const results = [];
    
    // Process each operation
    for (const op of pendingOperations) {
      try {
        const { operation, table, data } = op;
        
        if (!operation || !table || !data) {
          results.push({
            success: false,
            error: "Invalid operation format",
            operation: op
          });
          continue;
        }
        
        let result;
        
        // Execute operation based on type
        if (operation === "insert") {
          result = await supabase
            .from(table)
            .insert(data)
            .select();
        } 
        else if (operation === "update") {
          if (!data.id) {
            results.push({
              success: false,
              error: "Missing ID for update operation",
              operation: op
            });
            continue;
          }
          
          const { id, ...updates } = data;
          result = await supabase
            .from(table)
            .update(updates)
            .eq("id", id)
            .select();
        } 
        else if (operation === "delete") {
          if (!data.id) {
            results.push({
              success: false,
              error: "Missing ID for delete operation",
              operation: op
            });
            continue;
          }
          
          result = await supabase
            .from(table)
            .delete()
            .eq("id", data.id);
        } else {
          results.push({
            success: false,
            error: "Unknown operation type",
            operation: op
          });
          continue;
        }
        
        // Handle operation result
        if (result.error) {
          results.push({
            success: false,
            error: result.error.message,
            operation: op
          });
        } else {
          results.push({
            success: true,
            data: result.data,
            operation: op
          });
          
          // Log the action in audit logs
          await supabase
            .from("audit_logs")
            .insert({
              user_id: userId,
              action: `${operation}_${table}`,
              resource_type: table,
              resource_id: data.id,
              details: { offline_sync: true }
            });
        }
      } catch (error) {
        console.error("Error processing operation:", error);
        results.push({
          success: false,
          error: error.message,
          operation: op
        });
      }
    }
    
    // Return results of all operations
    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
