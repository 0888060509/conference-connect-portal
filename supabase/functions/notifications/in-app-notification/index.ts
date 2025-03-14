
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for notification request
interface NotificationRequest {
  user_id: string;
  booking_id: string;
  message: string;
  type: "confirmation" | "reminder" | "cancellation" | "modification";
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
    
    const senderId = user.id;
    
    // Create a notification
    if (req.method === "POST") {
      const notificationRequest: NotificationRequest = await req.json();
      
      // Validate required fields
      if (!notificationRequest.user_id || !notificationRequest.booking_id || 
          !notificationRequest.message || !notificationRequest.type) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create the notification
      const { data: notification, error: notificationError } = await adminClient
        .from("notifications")
        .insert({
          user_id: notificationRequest.user_id,
          booking_id: notificationRequest.booking_id,
          message: notificationRequest.message,
          type: notificationRequest.type
        })
        .select()
        .single();
        
      if (notificationError) {
        return new Response(
          JSON.stringify({ error: "Error creating notification" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Notification created successfully", 
          notification 
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Mark notification as read
    else if (req.method === "PATCH") {
      const url = new URL(req.url);
      const notificationId = url.searchParams.get("id");
      
      if (!notificationId) {
        return new Response(
          JSON.stringify({ error: "Notification ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if notification exists and belongs to the user
      const { data: existingNotification, error: notificationCheckError } = await adminClient
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();
        
      if (notificationCheckError || !existingNotification) {
        return new Response(
          JSON.stringify({ error: "Notification not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has permission to update this notification
      if (existingNotification.user_id !== senderId) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to update this notification" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Mark notification as read
      const { data: updatedNotification, error: updateError } = await adminClient
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select()
        .single();
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Error updating notification" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Notification marked as read", 
          notification: updatedNotification 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Get notifications for current user
    else if (req.method === "GET") {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const unreadOnly = url.searchParams.get("unread") === "true";
      
      // Build query
      let query = adminClient
        .from("notifications")
        .select(`
          *,
          booking:bookings(id, title, start_time, end_time)
        `)
        .eq("user_id", senderId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (unreadOnly) {
        query = query.eq("is_read", false);
      }
      
      const { data: notifications, error: notificationsError, count } = await query;
      
      if (notificationsError) {
        return new Response(
          JSON.stringify({ error: "Error fetching notifications" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get total count for pagination
      const { count: totalCount, error: countError } = await adminClient
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", senderId)
        .eq("is_read", unreadOnly ? false : null);
      
      return new Response(
        JSON.stringify({ 
          notifications,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: (offset + limit) < (totalCount || 0)
          }
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
    console.error("Unexpected error in in-app-notification:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
