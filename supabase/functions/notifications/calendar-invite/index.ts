
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for calendar invite request
interface CalendarInviteRequest {
  booking_id: string;
  attendees: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
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
    
    // Parse request body
    const inviteRequest: CalendarInviteRequest = await req.json();
    
    // Validate required fields
    if (!inviteRequest.booking_id) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get booking details
    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .select(`
        *,
        room:rooms(id, name, building, floor, number),
        user:users(id, email, first_name, last_name)
      `)
      .eq("id", inviteRequest.booking_id)
      .single();
      
    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if user has permission to access this booking
    const isAdmin = await checkIfAdmin(adminClient, userId);
    if (booking.user_id !== userId && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to access this booking" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate iCalendar content (RFC 5545)
    const organizer = booking.user.email;
    const attendees = inviteRequest.attendees || [];
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    // Format dates for iCalendar
    const formatDateForIcal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icalContent = generateICalContent(
      booking.id,
      booking.title,
      booking.description || '',
      formatDateForIcal(startTime),
      formatDateForIcal(endTime),
      organizer,
      attendees,
      `${booking.room.name}, ${booking.room.building || ''} ${booking.room.floor || ''} ${booking.room.number || ''}`.trim()
    );
    
    // In a real implementation, this would be sent via email to all attendees
    // For this demo, we'll just return the iCalendar content
    
    // Add attendees to booking_attendees table
    if (attendees.length > 0) {
      const attendeeRecords = attendees.map(email => ({
        booking_id: booking.id,
        user_id: getUserIdByEmail(email) || email, // In real app, would need to look up user IDs
        status: "invited"
      }));
      
      const { error: attendeesError } = await adminClient
        .from("booking_attendees")
        .upsert(attendeeRecords, { onConflict: 'booking_id,user_id' });
        
      if (attendeesError) {
        console.error("Error adding attendees:", attendeesError);
      }
    }
    
    // Log the action
    await adminClient
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: "generate_calendar_invite",
        resource_type: "booking",
        resource_id: booking.id,
        details: { attendees }
      });
    
    return new Response(
      JSON.stringify({ 
        message: "Calendar invite generated successfully",
        booking,
        icalContent,
        attendees 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="booking-${booking.id}.ics"`
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error in calendar-invite:", error.message);
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

// Helper function to generate iCalendar content
function generateICalContent(
  id: string,
  summary: string,
  description: string,
  dtstart: string,
  dtend: string,
  organizer: string,
  attendees: string[],
  location: string
): string {
  const icalLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Meeting Room Booking System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${id}@meetingroom.booking.system`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN=${organizer}:mailto:${organizer}`
  ];
  
  // Add attendees
  attendees.forEach(attendee => {
    icalLines.push(`ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendee}:mailto:${attendee}`);
  });
  
  icalLines.push(
    "END:VEVENT",
    "END:VCALENDAR"
  );
  
  return icalLines.join("\r\n");
}

// Dummy function to simulate looking up user IDs by email
// In a real app, this would query the database
function getUserIdByEmail(email: string): string | null {
  return null;
}
