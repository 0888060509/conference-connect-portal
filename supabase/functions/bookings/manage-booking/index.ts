
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for booking data
interface BookingData {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  recurring_id?: string;
  status?: "confirmed" | "cancelled" | "completed";
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
    
    // Create a booking
    if (req.method === "POST") {
      const bookingData: BookingData = await req.json();
      
      // Validate required fields
      if (!bookingData.room_id || !bookingData.title || !bookingData.start_time || !bookingData.end_time) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Validate room exists
      const { data: room, error: roomError } = await adminClient
        .from("rooms")
        .select("id, status")
        .eq("id", bookingData.room_id)
        .single();
        
      if (roomError || !room) {
        return new Response(
          JSON.stringify({ error: "Room not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if room is available
      if (room.status !== "active") {
        return new Response(
          JSON.stringify({ error: "Room is not available for booking" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check for conflicts
      const { data: conflicts, error: conflictError } = await adminClient.rpc(
        "check_booking_conflicts",
        {
          p_room_id: bookingData.room_id,
          p_start_time: bookingData.start_time,
          p_end_time: bookingData.end_time
        }
      );
      
      if (conflictError) {
        return new Response(
          JSON.stringify({ error: "Error checking for conflicts" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (conflicts && conflicts.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: "Booking conflict detected", 
            conflicts 
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create the booking
      const { data: booking, error: bookingError } = await adminClient
        .from("bookings")
        .insert({
          ...bookingData,
          user_id: userId
        })
        .select()
        .single();
        
      if (bookingError) {
        return new Response(
          JSON.stringify({ error: "Error creating booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: "create_booking",
          resource_type: "booking",
          resource_id: booking.id,
          details: { room_id: bookingData.room_id }
        });
      
      return new Response(
        JSON.stringify({ message: "Booking created successfully", booking }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Update a booking
    else if (req.method === "PUT" || req.method === "PATCH") {
      const url = new URL(req.url);
      const bookingId = url.searchParams.get("id");
      
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: "Booking ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if booking exists and belongs to user
      const { data: existingBooking, error: bookingCheckError } = await adminClient
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
        
      if (bookingCheckError || !existingBooking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has permission to update this booking
      const isAdmin = await checkIfAdmin(adminClient, userId);
      if (existingBooking.user_id !== userId && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to update this booking" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const bookingData: Partial<BookingData> = await req.json();
      
      // If updating time or room, check for conflicts
      if ((bookingData.start_time || bookingData.end_time || bookingData.room_id) && 
          bookingData.status !== "cancelled") {
        
        const startTime = bookingData.start_time || existingBooking.start_time;
        const endTime = bookingData.end_time || existingBooking.end_time;
        const roomId = bookingData.room_id || existingBooking.room_id;
        
        // Check for conflicts
        const { data: conflicts, error: conflictError } = await adminClient.rpc(
          "check_booking_conflicts",
          {
            p_room_id: roomId,
            p_start_time: startTime,
            p_end_time: endTime,
            p_booking_id: bookingId
          }
        );
        
        if (conflictError) {
          return new Response(
            JSON.stringify({ error: "Error checking for conflicts" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (conflicts && conflicts.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: "Booking conflict detected", 
              conflicts 
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Update the booking
      const { data: updatedBooking, error: updateError } = await adminClient
        .from("bookings")
        .update(bookingData)
        .eq("id", bookingId)
        .select()
        .single();
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Error updating booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: "update_booking",
          resource_type: "booking",
          resource_id: bookingId,
          details: bookingData
        });
      
      return new Response(
        JSON.stringify({ message: "Booking updated successfully", booking: updatedBooking }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Delete a booking
    else if (req.method === "DELETE") {
      const url = new URL(req.url);
      const bookingId = url.searchParams.get("id");
      
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: "Booking ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if booking exists and belongs to user
      const { data: existingBooking, error: bookingCheckError } = await adminClient
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
        
      if (bookingCheckError || !existingBooking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has permission to delete this booking
      const isAdmin = await checkIfAdmin(adminClient, userId);
      if (existingBooking.user_id !== userId && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to delete this booking" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Delete the booking
      const { error: deleteError } = await adminClient
        .from("bookings")
        .delete()
        .eq("id", bookingId);
        
      if (deleteError) {
        return new Response(
          JSON.stringify({ error: "Error deleting booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: "delete_booking",
          resource_type: "booking",
          resource_id: bookingId,
          details: { room_id: existingBooking.room_id }
        });
      
      return new Response(
        JSON.stringify({ message: "Booking deleted successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Get booking details
    else if (req.method === "GET") {
      const url = new URL(req.url);
      const bookingId = url.searchParams.get("id");
      
      if (bookingId) {
        // Get single booking
        const { data: booking, error } = await adminClient
          .from("bookings")
          .select(`
            *,
            room:rooms(*),
            user:users(id, email, first_name, last_name)
          `)
          .eq("id", bookingId)
          .single();
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Error fetching booking" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (!booking) {
          return new Response(
            JSON.stringify({ error: "Booking not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Check if user has permission to view this booking
        const isAdmin = await checkIfAdmin(adminClient, userId);
        if (booking.user_id !== userId && !isAdmin) {
          return new Response(
            JSON.stringify({ error: "You don't have permission to view this booking" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ booking }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // List bookings with filtering
        const roomId = url.searchParams.get("roomId");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const status = url.searchParams.get("status");
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const offset = parseInt(url.searchParams.get("offset") || "0");
        
        // Build query
        let query = adminClient
          .from("bookings")
          .select(`
            *,
            room:rooms(id, name, building, floor, status),
            user:users(id, email, first_name, last_name)
          `);
        
        // Apply filters
        if (roomId) query = query.eq("room_id", roomId);
        if (startDate) query = query.gte("start_time", startDate);
        if (endDate) query = query.lte("end_time", endDate);
        if (status) query = query.eq("status", status);
        
        // Admin can see all bookings, regular users only see their own
        const isAdmin = await checkIfAdmin(adminClient, userId);
        if (!isAdmin) {
          query = query.eq("user_id", userId);
        }
        
        // Apply pagination
        query = query.range(offset, offset + limit - 1);
        
        // Execute query
        const { data: bookings, error, count } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ error: "Error fetching bookings" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get total count for pagination
        const { count: totalCount, error: countError } = await adminClient
          .from("bookings")
          .select("*", { count: "exact", head: true });
          
        return new Response(
          JSON.stringify({ 
            bookings, 
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
    }
    else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in manage-booking:", error.message);
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
