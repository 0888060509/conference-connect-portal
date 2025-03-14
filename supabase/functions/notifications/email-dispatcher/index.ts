
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for email request
interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  template_id?: string;
  data?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
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
    
    // Check if user has permission to send emails
    const isAdmin = await checkIfAdmin(adminClient, userId);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions to send emails" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse request body
    const emailRequest: EmailRequest = await req.json();
    
    // Validate required fields
    if (!emailRequest.to || !(emailRequest.body || emailRequest.template_id)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If using template, get it from the database
    let emailContent = emailRequest.body;
    let emailSubject = emailRequest.subject;
    
    if (emailRequest.template_id) {
      const { data: template, error: templateError } = await adminClient
        .from("notification_templates")
        .select("subject, body_text, body_html")
        .eq("id", emailRequest.template_id)
        .single();
        
      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: "Template not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      emailSubject = template.subject;
      emailContent = template.body_html || template.body_text;
      
      // Replace placeholders with data values
      if (emailRequest.data) {
        for (const [key, value] of Object.entries(emailRequest.data)) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          emailContent = emailContent.replace(placeholder, value);
          emailSubject = emailSubject.replace(placeholder, value);
        }
      }
    }
    
    // In a real implementation, this would connect to an email service like SendGrid or AWS SES
    // For this demo, we'll just log the email details and pretend it was sent
    console.log("Sending email:");
    console.log(`To: ${emailRequest.to}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Body: ${emailContent}`);
    
    // Create a record of the email being sent
    const { data: notification, error: notificationError } = await adminClient
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: "send_email",
        resource_type: "email",
        resource_id: emailRequest.to,
        details: {
          subject: emailSubject,
          template_id: emailRequest.template_id
        }
      })
      .select()
      .single();
      
    if (notificationError) {
      console.error("Error logging email:", notificationError);
    }
    
    return new Response(
      JSON.stringify({ 
        message: "Email sent successfully",
        notification_id: notification?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in email-dispatcher:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to check if a user is an admin
async function checkIfAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
    
  if (error || !data) {
    return false;
  }
  
  return data.role === "admin";
}
