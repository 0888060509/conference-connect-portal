
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { RRule, RRuleSet, rrulestr } from "https://esm.sh/rrule@2.8.1";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for recurring pattern request
interface RecurringPatternRequest {
  pattern_type: "daily" | "weekly" | "monthly";
  interval: number;
  start_date: string;
  end_date?: string;
  occurrence_count?: number;
  days_of_week?: number[];
}

// Interface for recurring booking request
interface RecurringBookingRequest {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  pattern: RecurringPatternRequest;
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
    
    const userId = user.id;
    
    // Generate recurring pattern
    if (req.method === "POST") {
      const url = new URL(req.url);
      const action = url.searchParams.get("action") || "generate";
      
      if (action === "generate") {
        const { pattern }: { pattern: RecurringPatternRequest } = await req.json();
        
        // Validate required fields
        if (!pattern.pattern_type || !pattern.interval || !pattern.start_date) {
          return new Response(
            JSON.stringify({ error: "Missing required pattern fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (!pattern.end_date && !pattern.occurrence_count) {
          return new Response(
            JSON.stringify({ error: "Either end date or occurrence count is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Generate occurrences using RRule
        const options: any = {
          freq: getFrequency(pattern.pattern_type),
          interval: pattern.interval,
          dtstart: new Date(pattern.start_date)
        };
        
        // Add weekday settings for weekly patterns
        if (pattern.pattern_type === "weekly" && pattern.days_of_week && pattern.days_of_week.length > 0) {
          options.byweekday = pattern.days_of_week.map(day => day - 1); // RRule uses 0-6 for Mon-Sun
        }
        
        // Set end condition
        if (pattern.end_date) {
          options.until = new Date(pattern.end_date);
        } else if (pattern.occurrence_count) {
          options.count = pattern.occurrence_count;
        }
        
        const rule = new RRule(options);
        const occurrences = rule.all();
        
        return new Response(
          JSON.stringify({ 
            pattern,
            occurrences: occurrences.map(date => date.toISOString().split('T')[0]),
            rule: rule.toString()
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } 
      else if (action === "create") {
        const bookingRequest: RecurringBookingRequest = await req.json();
        
        // Validate required fields
        if (!bookingRequest.room_id || !bookingRequest.title || 
            !bookingRequest.start_time || !bookingRequest.end_time || !bookingRequest.pattern) {
          return new Response(
            JSON.stringify({ error: "Missing required booking or pattern fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Create recurring pattern
        const { data: patternData, error: patternError } = await adminClient
          .from("recurring_patterns")
          .insert({
            pattern_type: bookingRequest.pattern.pattern_type,
            interval: bookingRequest.pattern.interval,
            start_date: bookingRequest.pattern.start_date,
            end_date: bookingRequest.pattern.end_date,
            occurrence_count: bookingRequest.pattern.occurrence_count,
            days_of_week: bookingRequest.pattern.days_of_week,
            user_id: userId
          })
          .select()
          .single();
          
        if (patternError) {
          return new Response(
            JSON.stringify({ error: "Error creating recurring pattern" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Generate all booking dates using RRule
        const options: any = {
          freq: getFrequency(bookingRequest.pattern.pattern_type),
          interval: bookingRequest.pattern.interval,
          dtstart: new Date(bookingRequest.pattern.start_date)
        };
        
        if (bookingRequest.pattern.pattern_type === "weekly" && 
            bookingRequest.pattern.days_of_week && 
            bookingRequest.pattern.days_of_week.length > 0) {
          options.byweekday = bookingRequest.pattern.days_of_week.map(day => day - 1);
        }
        
        if (bookingRequest.pattern.end_date) {
          options.until = new Date(bookingRequest.pattern.end_date);
        } else if (bookingRequest.pattern.occurrence_count) {
          options.count = bookingRequest.pattern.occurrence_count;
        }
        
        const rule = new RRule(options);
        const occurrences = rule.all();
        
        // Create bookings for each occurrence
        const startDate = new Date(bookingRequest.start_time);
        const endDate = new Date(bookingRequest.end_time);
        const duration = endDate.getTime() - startDate.getTime();
        
        const bookingsToCreate = occurrences.map(date => {
          const eventStartTime = new Date(date);
          eventStartTime.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
          
          const eventEndTime = new Date(eventStartTime.getTime() + duration);
          
          return {
            room_id: bookingRequest.room_id,
            title: bookingRequest.title,
            description: bookingRequest.description,
            start_time: eventStartTime.toISOString(),
            end_time: eventEndTime.toISOString(),
            user_id: userId,
            recurring_id: patternData.id
          };
        });
        
        // Check for any conflicts in all bookings
        const conflictPromises = bookingsToCreate.map(booking => 
          adminClient.rpc("check_booking_conflicts", {
            p_room_id: booking.room_id,
            p_start_time: booking.start_time,
            p_end_time: booking.end_time
          })
        );
        
        const conflictResults = await Promise.all(conflictPromises);
        
        // Collect all conflicts
        const conflicts = [];
        for (let i = 0; i < conflictResults.length; i++) {
          const { data, error } = conflictResults[i];
          if (error) {
            return new Response(
              JSON.stringify({ error: "Error checking for conflicts" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          if (data && data.length > 0) {
            conflicts.push({
              date: occurrences[i].toISOString().split('T')[0],
              booking: bookingsToCreate[i],
              conflicts: data
            });
          }
        }
        
        if (conflicts.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: "Booking conflicts detected", 
              conflicts,
              pattern: patternData
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Create all bookings
        const { data: bookings, error: bookingError } = await adminClient
          .from("bookings")
          .insert(bookingsToCreate)
          .select();
          
        if (bookingError) {
          return new Response(
            JSON.stringify({ error: "Error creating recurring bookings" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Log the action
        await adminClient
          .from("audit_logs")
          .insert({
            user_id: userId,
            action: "create_recurring_bookings",
            resource_type: "recurring_pattern",
            resource_id: patternData.id,
            details: { 
              room_id: bookingRequest.room_id,
              booking_count: bookings.length 
            }
          });
        
        return new Response(
          JSON.stringify({ 
            message: "Recurring bookings created successfully", 
            pattern: patternData,
            bookings 
          }),
          { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      else {
        return new Response(
          JSON.stringify({ error: "Invalid action parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // Get pattern details or list patterns
    else if (req.method === "GET") {
      const url = new URL(req.url);
      const patternId = url.searchParams.get("id");
      
      if (patternId) {
        // Get single pattern with its bookings
        const { data: pattern, error: patternError } = await adminClient
          .from("recurring_patterns")
          .select("*")
          .eq("id", patternId)
          .single();
          
        if (patternError || !pattern) {
          return new Response(
            JSON.stringify({ error: "Recurring pattern not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Check if user has permission to view this pattern
        const isAdmin = await checkIfAdmin(adminClient, userId);
        if (pattern.user_id !== userId && !isAdmin) {
          return new Response(
            JSON.stringify({ error: "You don't have permission to view this pattern" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get associated bookings
        const { data: bookings, error: bookingsError } = await adminClient
          .from("bookings")
          .select("*")
          .eq("recurring_id", patternId)
          .order("start_time", { ascending: true });
          
        if (bookingsError) {
          return new Response(
            JSON.stringify({ error: "Error fetching bookings" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ pattern, bookings }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // List patterns
        let query = adminClient
          .from("recurring_patterns")
          .select(`
            *,
            bookings!recurring_id(id, title, room_id, start_time, end_time, status)
          `);
        
        // Admin can see all patterns, regular users only see their own
        const isAdmin = await checkIfAdmin(adminClient, userId);
        if (!isAdmin) {
          query = query.eq("user_id", userId);
        }
        
        const { data: patterns, error } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ error: "Error fetching recurring patterns" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ patterns }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // Update a pattern
    else if (req.method === "PUT" || req.method === "PATCH") {
      const url = new URL(req.url);
      const patternId = url.searchParams.get("id");
      
      if (!patternId) {
        return new Response(
          JSON.stringify({ error: "Pattern ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if pattern exists and belongs to user
      const { data: existingPattern, error: patternCheckError } = await adminClient
        .from("recurring_patterns")
        .select("*")
        .eq("id", patternId)
        .single();
        
      if (patternCheckError || !existingPattern) {
        return new Response(
          JSON.stringify({ error: "Recurring pattern not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has permission to update this pattern
      const isAdmin = await checkIfAdmin(adminClient, userId);
      if (existingPattern.user_id !== userId && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to update this pattern" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const patternData: Partial<RecurringPatternRequest> = await req.json();
      
      // Update exception dates
      if (patternData.days_of_week && Array.isArray(patternData.days_of_week)) {
        const { data: updatedPattern, error: updateError } = await adminClient
          .from("recurring_patterns")
          .update(patternData)
          .eq("id", patternId)
          .select()
          .single();
          
        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Error updating pattern" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ message: "Pattern updated successfully", pattern: updatedPattern }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Invalid update request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // Delete a pattern and its bookings
    else if (req.method === "DELETE") {
      const url = new URL(req.url);
      const patternId = url.searchParams.get("id");
      
      if (!patternId) {
        return new Response(
          JSON.stringify({ error: "Pattern ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if pattern exists and belongs to user
      const { data: existingPattern, error: patternCheckError } = await adminClient
        .from("recurring_patterns")
        .select("*")
        .eq("id", patternId)
        .single();
        
      if (patternCheckError || !existingPattern) {
        return new Response(
          JSON.stringify({ error: "Recurring pattern not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check if user has permission to delete this pattern
      const isAdmin = await checkIfAdmin(adminClient, userId);
      if (existingPattern.user_id !== userId && !isAdmin) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to delete this pattern" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Delete associated bookings first (foreign key constraint)
      const { error: deleteBookingsError } = await adminClient
        .from("bookings")
        .delete()
        .eq("recurring_id", patternId);
        
      if (deleteBookingsError) {
        return new Response(
          JSON.stringify({ error: "Error deleting associated bookings" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Delete the pattern
      const { error: deletePatternError } = await adminClient
        .from("recurring_patterns")
        .delete()
        .eq("id", patternId);
        
      if (deletePatternError) {
        return new Response(
          JSON.stringify({ error: "Error deleting recurring pattern" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the action
      await adminClient
        .from("audit_logs")
        .insert({
          user_id: userId,
          action: "delete_recurring_pattern",
          resource_type: "recurring_pattern",
          resource_id: patternId
        });
      
      return new Response(
        JSON.stringify({ message: "Recurring pattern and associated bookings deleted successfully" }),
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
    console.error("Unexpected error in recurring-patterns:", error.message);
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

// Helper function to convert pattern type to RRule frequency
function getFrequency(patternType: string): number {
  switch (patternType) {
    case "daily":
      return RRule.DAILY;
    case "weekly":
      return RRule.WEEKLY;
    case "monthly":
      return RRule.MONTHLY;
    default:
      return RRule.DAILY;
  }
}
