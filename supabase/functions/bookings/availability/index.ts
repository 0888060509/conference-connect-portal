
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for availability blocks
interface AvailabilityBlock {
  start: string;
  end: string;
  available: boolean;
  booking?: {
    id: string;
    title: string;
    user_id: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get parameters from URL
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");
    const date = url.searchParams.get("date");
    const duration = parseInt(url.searchParams.get("duration") || "60"); // Duration in minutes
    
    // Validate required parameters
    if (!roomId || !date) {
      return new Response(
        JSON.stringify({ error: "Room ID and date are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if room exists
    const { data: room, error: roomError } = await adminClient
      .from("rooms")
      .select("id, status")
      .eq("id", roomId)
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
    
    // Prepare date range for the requested date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get all bookings for the room on the specified date
    const { data: bookings, error: bookingsError } = await adminClient
      .from("bookings")
      .select("id, title, start_time, end_time, user_id")
      .eq("room_id", roomId)
      .eq("status", "confirmed")
      .gte("start_time", startOfDay.toISOString())
      .lte("end_time", endOfDay.toISOString())
      .order("start_time", { ascending: true });
      
    if (bookingsError) {
      return new Response(
        JSON.stringify({ error: "Error fetching bookings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Define business hours (8:00 AM to 8:00 PM by default)
    const businessHoursStart = 8; // 8:00 AM
    const businessHoursEnd = 20; // 8:00 PM
    
    // Generate availability blocks for the entire day within business hours
    const availabilityBlocks: AvailabilityBlock[] = [];
    const durationInMs = duration * 60 * 1000;
    
    // Start with the whole day divided into blocks
    for (let hour = businessHoursStart; hour < businessHoursEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const blockStart = new Date(date);
        blockStart.setHours(hour, minute, 0, 0);
        
        const blockEnd = new Date(blockStart.getTime() + durationInMs);
        
        // Don't include blocks that extend beyond business hours
        if (blockEnd.getHours() > businessHoursEnd || 
            (blockEnd.getHours() === businessHoursEnd && blockEnd.getMinutes() > 0)) {
          continue;
        }
        
        // Check if this block overlaps with any booking
        let isAvailable = true;
        let overlappingBooking = null;
        
        for (const booking of bookings) {
          const bookingStart = new Date(booking.start_time);
          const bookingEnd = new Date(booking.end_time);
          
          // Check for overlap
          if ((blockStart < bookingEnd && blockEnd > bookingStart)) {
            isAvailable = false;
            overlappingBooking = {
              id: booking.id,
              title: booking.title,
              user_id: booking.user_id
            };
            break;
          }
        }
        
        availabilityBlocks.push({
          start: blockStart.toISOString(),
          end: blockEnd.toISOString(),
          available: isAvailable,
          booking: overlappingBooking
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        room_id: roomId,
        date,
        duration_minutes: duration,
        availability_blocks: availabilityBlocks
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in availability:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
