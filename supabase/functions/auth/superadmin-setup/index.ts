
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
    
    // Verify if the current user is already an admin
    const { data: isAdmin, error: adminCheckError } = await adminClient
      .from("users")
      .select("role")
      .eq("id", currentUserId)
      .single();
      
    if (adminCheckError) {
      return new Response(
        JSON.stringify({ error: "Error checking admin status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (isAdmin?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions. Only admins can set up superadmins." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      // Add a new superadmin email
      const { email } = await req.json();
      
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return new Response(
          JSON.stringify({ error: "Valid email is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get current superadmin emails
      const { data: settings, error: settingsError } = await adminClient
        .from("system_settings")
        .select("*")
        .eq("setting_key", "superadmin_emails")
        .maybeSingle();
      
      const normalizedEmail = email.toLowerCase().trim();
      let emails: string[] = [];
      
      if (settings) {
        // Update existing setting
        emails = settings.setting_value as string[] || [];
        
        if (emails.includes(normalizedEmail)) {
          return new Response(
            JSON.stringify({ message: "Email is already in the superadmin list" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        emails.push(normalizedEmail);
        
        const { error: updateError } = await adminClient
          .from("system_settings")
          .update({ 
            setting_value: emails,
            updated_by: currentUserId,
            updated_at: new Date().toISOString()
          })
          .eq("id", settings.id);
          
        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Error updating superadmin emails" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // Create new setting
        emails = [normalizedEmail];
        
        const { error: insertError } = await adminClient
          .from("system_settings")
          .insert({
            setting_key: "superadmin_emails",
            setting_value: emails,
            description: "List of email addresses that should automatically be granted admin role",
            updated_by: currentUserId
          });
          
        if (insertError) {
          return new Response(
            JSON.stringify({ error: "Error creating superadmin emails setting" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Also set the user as admin if they already exist
      const { data: existingUser } = await adminClient
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
        
      if (existingUser) {
        await adminClient
          .from("users")
          .update({ role: "admin" })
          .eq("id", existingUser.id);
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: currentUserId,
          action: "superadmin_email_added",
          resource_type: "system_settings",
          details: { email: normalizedEmail }
        });
      
      return new Response(
        JSON.stringify({ 
          message: "Superadmin email added successfully", 
          superadmin_emails: emails 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (req.method === "GET") {
      // Get the list of superadmin emails
      const { data, error } = await adminClient
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "superadmin_emails")
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ error: "Error fetching superadmin emails" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const emails = (data?.setting_value as string[]) || [];
      
      return new Response(
        JSON.stringify({ superadmin_emails: emails }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (req.method === "DELETE") {
      // Remove a superadmin email
      const url = new URL(req.url);
      const emailToRemove = url.searchParams.get("email");
      
      if (!emailToRemove) {
        return new Response(
          JSON.stringify({ error: "Email parameter is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get current superadmin emails
      const { data, error } = await adminClient
        .from("system_settings")
        .select("*")
        .eq("setting_key", "superadmin_emails")
        .single();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Error fetching superadmin emails" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const normalizedEmail = emailToRemove.toLowerCase().trim();
      let emails = data.setting_value as string[] || [];
      
      if (!emails.includes(normalizedEmail)) {
        return new Response(
          JSON.stringify({ message: "Email is not in the superadmin list" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      emails = emails.filter(email => email !== normalizedEmail);
      
      const { error: updateError } = await adminClient
        .from("system_settings")
        .update({ 
          setting_value: emails,
          updated_by: currentUserId,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.id);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Error updating superadmin emails" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: currentUserId,
          action: "superadmin_email_removed",
          resource_type: "system_settings",
          details: { email: normalizedEmail }
        });
      
      return new Response(
        JSON.stringify({ 
          message: "Superadmin email removed successfully", 
          superadmin_emails: emails 
        }),
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
    console.error("Unexpected error in superadmin-setup:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
