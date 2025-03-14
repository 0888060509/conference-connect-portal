import { supabaseClient, handleSupabaseError } from '@/lib/supabase-client';
import { offlineStore } from '@/lib/offline-store';
import { toast } from 'sonner';
import { format, parse, addDays, addWeeks, addMonths } from 'date-fns';

// Types for calendar functionality
export type RoomAvailability = 'available' | 'partial' | 'booked';

export interface BookingConflict {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  priority: BookingPriority;
}

export type BookingPriority = 'low' | 'normal' | 'high' | 'critical';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  weekdays?: number[];
  monthDay?: number;
  endType: 'never' | 'afterDate' | 'afterOccurrences';
  endDate?: Date;
  occurrences?: number;
  exceptionDates: Date[];
}

export interface ConflictSuggestion {
  startTime: string;
  endTime: string;
  roomId: string;
  roomName: string;
  type: 'time' | 'room';
}

// Function to fetch room availability for a specific date
export const fetchRoomAvailability = async (
  roomIds: string[],
  date: Date
): Promise<Record<string, RoomAvailability>> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('room_id, start_time, end_time')
      .in('room_id', roomIds)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .eq('status', 'confirmed');
    
    if (error) throw error;
    
    // Default all rooms to available
    const availabilityMap: Record<string, RoomAvailability> = {};
    roomIds.forEach(id => { availabilityMap[id] = 'available'; });
    
    // Group bookings by room
    const bookingsByRoom: Record<string, { start: string, end: string }[]> = {};
    data.forEach(booking => {
      if (!bookingsByRoom[booking.room_id]) {
        bookingsByRoom[booking.room_id] = [];
      }
      bookingsByRoom[booking.room_id].push({
        start: booking.start_time,
        end: booking.end_time
      });
    });
    
    // Calculate availability based on booking duration/coverage
    const businessHours = 10; // 8am-6pm = 10 hours of business time
    const businessStartHour = 8; // 8am
    
    Object.entries(bookingsByRoom).forEach(([roomId, bookings]) => {
      if (bookings.length === 0) {
        return; // Room is available if no bookings
      }
      
      // Calculate total booked hours
      let totalBookedMinutes = 0;
      bookings.forEach(booking => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        
        // Only count time within business hours
        const bookingStartHour = Math.max(start.getHours(), businessStartHour);
        const bookingEndHour = Math.min(end.getHours(), businessStartHour + businessHours);
        
        // Add minutes from hours difference
        totalBookedMinutes += (bookingEndHour - bookingStartHour) * 60;
        
        // Add remaining minutes
        if (bookingEndHour === end.getHours()) {
          totalBookedMinutes += end.getMinutes();
        }
        if (bookingStartHour === start.getHours()) {
          totalBookedMinutes -= start.getMinutes();
        }
      });
      
      const totalBusinessMinutes = businessHours * 60;
      const bookingRatio = totalBookedMinutes / totalBusinessMinutes;
      
      if (bookingRatio >= 0.8) {
        availabilityMap[roomId] = 'booked';
      } else if (bookingRatio > 0) {
        availabilityMap[roomId] = 'partial';
      }
    });
    
    return availabilityMap;
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to fetch room availability');
    
    // Fall back to available if there's an error
    const fallbackMap: Record<string, RoomAvailability> = {};
    roomIds.forEach(id => { fallbackMap[id] = 'available'; });
    return fallbackMap;
  }
};

// Function to check for booking conflicts
export const checkBookingConflicts = async (
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<BookingConflict[]> => {
  try {
    // Call the check_booking_conflicts RPC function
    const { data, error } = await supabaseClient.rpc(
      'check_booking_conflicts', 
      { 
        p_room_id: roomId,
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString(),
        p_booking_id: excludeBookingId || null
      }
    );
    
    if (error) throw error;
    
    // Convert the response to our BookingConflict type
    return (data || []).map((conflict: any) => ({
      id: conflict.conflicting_booking_id,
      title: conflict.title,
      start: new Date(conflict.start_time),
      end: new Date(conflict.end_time),
      userId: conflict.user_id,
      priority: 'normal' // Default priority, would need to extend the DB function to include this
    }));
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to check for booking conflicts');
    return [];
  }
};

// Function to create a booking
export const createBooking = async (
  booking: {
    title: string;
    description?: string;
    roomId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    recurring?: RecurrencePattern;
    attendees?: string[];
  }
): Promise<{ success: boolean; bookingId?: string; recurringId?: string; conflicts?: BookingConflict[] }> => {
  try {
    // Check for conflicts first
    const conflicts = await checkBookingConflicts(
      booking.roomId, 
      booking.startTime, 
      booking.endTime
    );
    
    if (conflicts.length > 0) {
      return { success: false, conflicts };
    }
    
    // Handle recurring booking if applicable
    let recurringId: string | undefined;
    
    if (booking.recurring) {
      // Create recurring pattern record
      const patternType = booking.recurring.type === 'yearly' ? 'monthly' : booking.recurring.type;
      
      const { data: recurringData, error: recurringError } = await supabaseClient
        .from('recurring_patterns')
        .insert({
          pattern_type: patternType,
          interval: booking.recurring.interval,
          days_of_week: booking.recurring.weekdays ? JSON.stringify(booking.recurring.weekdays) : null,
          start_date: format(booking.startTime, 'yyyy-MM-dd'),
          end_date: booking.recurring.endDate ? format(booking.recurring.endDate, 'yyyy-MM-dd') : null,
          occurrence_count: booking.recurring.occurrences,
          exception_dates: JSON.stringify(booking.recurring.exceptionDates || []),
          user_id: booking.userId
        })
        .select('id')
        .single();
      
      if (recurringError) throw recurringError;
      recurringId = recurringData?.id;
    }
    
    // Create the booking
    const { data: bookingData, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        title: booking.title,
        description: booking.description,
        room_id: booking.roomId,
        user_id: booking.userId,
        start_time: booking.startTime.toISOString(),
        end_time: booking.endTime.toISOString(),
        status: 'confirmed',
        recurring_id: recurringId
      })
      .select('id')
      .single();
    
    if (bookingError) throw bookingError;
    
    // If there are attendees, add them to the booking
    if (booking.attendees && booking.attendees.length > 0 && bookingData?.id) {
      const attendeeRecords = booking.attendees.map(userId => ({
        booking_id: bookingData.id,
        user_id: userId,
        status: 'invited'
      }));
      
      for (const attendee of attendeeRecords) {
        const { error: attendeeError } = await supabaseClient
          .from('booking_attendees')
          .insert(attendee);
        
        if (attendeeError) {
          console.error('Failed to add attendee:', attendeeError);
          // Continue anyway as the booking was created
        }
      }
    }
    
    // Create a notification for the booking
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: booking.userId,
        type: 'confirmation',  // Use valid type for notifications table
        message: `Booking "${booking.title}" created successfully`,
        booking_id: bookingData.id,
        is_read: false
      });
    
    toast.success('Booking created successfully');
    return { 
      success: true, 
      bookingId: bookingData?.id,
      recurringId 
    };
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to create booking');
    return { success: false };
  }
};

// Function to update a booking
export const updateBooking = async (
  bookingId: string,
  updates: {
    title?: string;
    description?: string;
    roomId?: string;
    startTime?: Date;
    endTime?: Date;
    attendees?: string[];
  }
): Promise<{ success: boolean; conflicts?: BookingConflict[] }> => {
  try {
    // Get the current booking data
    const { data: currentBooking, error: fetchError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!currentBooking) throw new Error('Booking not found');
    
    // Check for conflicts if changing room, start time, or end time
    if (updates.roomId || updates.startTime || updates.endTime) {
      const conflicts = await checkBookingConflicts(
        updates.roomId || currentBooking.room_id,
        updates.startTime ? new Date(updates.startTime) : new Date(currentBooking.start_time),
        updates.endTime ? new Date(updates.endTime) : new Date(currentBooking.end_time),
        bookingId
      );
      
      if (conflicts.length > 0) {
        return { success: false, conflicts };
      }
    }
    
    // Prepare updates
    const bookingUpdates: any = {};
    if (updates.title) bookingUpdates.title = updates.title;
    if (updates.description) bookingUpdates.description = updates.description;
    if (updates.roomId) bookingUpdates.room_id = updates.roomId;
    if (updates.startTime) bookingUpdates.start_time = updates.startTime.toISOString();
    if (updates.endTime) bookingUpdates.end_time = updates.endTime.toISOString();
    
    // Update the booking
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update(bookingUpdates)
      .eq('id', bookingId);
    
    if (updateError) throw updateError;
    
    // If attendees are provided, update them
    if (updates.attendees) {
      // First delete existing attendees
      const { error: deleteError } = await supabaseClient
        .from('booking_attendees')
        .delete()
        .eq('booking_id', bookingId);
      
      if (deleteError) throw deleteError;
      
      // Then add new attendees
      if (updates.attendees.length > 0) {
        for (const userId of updates.attendees) {
          const { error: insertError } = await supabaseClient
            .from('booking_attendees')
            .insert({
              booking_id: bookingId,
              user_id: userId,
              status: 'invited'
            });
            
          if (insertError) throw insertError;
        }
      }
    }
    
    toast.success('Booking updated successfully');
    return { success: true };
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to update booking');
    return { success: false };
  }
};

// Function to cancel a booking
export const cancelBooking = async (
  bookingId: string,
  reason?: string
): Promise<boolean> => {
  try {
    // Update booking status to cancelled
    const { error } = await supabaseClient
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    
    if (error) throw error;
    
    // Create a notification for the cancellation
    const { data: booking, error: fetchError } = await supabaseClient
      .from('bookings')
      .select('title, user_id')
      .eq('id', bookingId)
      .single();
    
    if (!fetchError && booking) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: booking.user_id,
          type: 'cancellation', // Use valid type for notifications table
          message: `Booking "${booking.title}" has been cancelled${reason ? `: ${reason}` : ''}`,
          booking_id: bookingId,
          is_read: false
        });
    }
    
    toast.success('Booking cancelled successfully');
    return true;
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to cancel booking');
    return false;
  }
};

// Function to generate iCalendar data for a booking
export const generateICalendar = async (
  bookingId: string
): Promise<string | null> => {
  try {
    // Fetch booking details
    const { data: booking, error } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        room:room_id(name, building, floor, number),
        attendees:booking_attendees(user_id)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error || !booking) throw error || new Error('Booking not found');
    
    // Fetch attendee details
    const attendeeIds = booking.attendees.map((a: any) => a.user_id);
    
    let attendeeEmails: string[] = [];
    if (attendeeIds.length > 0) {
      const { data: users, error: userError } = await supabaseClient
        .from('users')
        .select('email')
        .in('id', attendeeIds);
      
      if (!userError && users) {
        attendeeEmails = users.map(u => u.email);
      }
    }
    
    // Get organizer info
    const { data: organizer, error: organizerError } = await supabaseClient
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', booking.user_id)
      .single();
    
    if (organizerError || !organizer) throw organizerError || new Error('Organizer not found');
    
    // Generate iCalendar content
    const now = new Date();
    const uid = `${bookingId}@meetingmaster.app`;
    const location = [
      booking.room.name,
      booking.room.building,
      booking.room.floor ? `Floor ${booking.room.floor}` : null,
      booking.room.number ? `Room ${booking.room.number}` : null
    ].filter(Boolean).join(', ');
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MeetingMaster//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${format(now, 'yyyyMMddTHHmmssZ')}`,
      `DTSTART:${format(new Date(booking.start_time), 'yyyyMMddTHHmmssZ')}`,
      `DTEND:${format(new Date(booking.end_time), 'yyyyMMddTHHmmssZ')}`,
      `SUMMARY:${booking.title}`,
      booking.description ? `DESCRIPTION:${booking.description.replace(/\n/g, '\\n')}` : '',
      `LOCATION:${location}`,
      `ORGANIZER;CN=${organizer.first_name} ${organizer.last_name}:mailto:${organizer.email}`,
      ...attendeeEmails.map(email => `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${email}`),
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    
    return icalContent;
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to generate iCalendar data');
    return null;
  }
};

// Function to generate recurring meeting instances
export const generateRecurringInstances = (
  startDate: Date,
  pattern: RecurrencePattern,
  timeSlot: { startTime: string; endTime: string }
): { date: Date; startTime: string; endTime: string }[] => {
  const instances: { date: Date; startTime: string; endTime: string }[] = [];
  let currentDate = new Date(startDate);
  
  // Function to check if a date should be included based on pattern
  const shouldIncludeDate = (date: Date): boolean => {
    // Check exception dates
    if (pattern.exceptionDates.some(exDate => 
      exDate.getFullYear() === date.getFullYear() && 
      exDate.getMonth() === date.getMonth() && 
      exDate.getDate() === date.getDate()
    )) {
      return false;
    }
    
    // For weekly pattern, check if the day of week is included
    if (pattern.type === 'weekly' && pattern.weekdays) {
      return pattern.weekdays.includes(date.getDay());
    }
    
    // For monthly pattern, check if it's the right day of month
    if (pattern.type === 'monthly' && pattern.monthDay) {
      return date.getDate() === pattern.monthDay;
    }
    
    return true;
  };
  
  // Determine end condition
  const maxOccurrences = pattern.endType === 'afterOccurrences' ? pattern.occurrences || 10 : 52; // Max 1 year
  const endDate = pattern.endType === 'afterDate' && pattern.endDate ? pattern.endDate : 
                 pattern.endType === 'never' ? addDays(new Date(), 365) : // Default to 1 year if 'never'
                 addDays(new Date(), 365); // Fallback to 1 year
  
  let occurrenceCount = 0;
  
  // Generate instances based on pattern
  while (occurrenceCount < maxOccurrences && currentDate <= endDate) {
    if (shouldIncludeDate(currentDate)) {
      instances.push({
        date: new Date(currentDate),
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      });
      occurrenceCount++;
    }
    
    // Advance to next potential date based on pattern
    if (pattern.type === 'daily') {
      currentDate = addDays(currentDate, pattern.interval);
    } else if (pattern.type === 'weekly') {
      // For weekly, if we're checking specific days, increment by 1 day
      // Otherwise, increment by the interval in weeks
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        currentDate = addDays(currentDate, 1);
      } else {
        currentDate = addWeeks(currentDate, pattern.interval);
      }
    } else if (pattern.type === 'monthly') {
      currentDate = addMonths(currentDate, pattern.interval);
    } else if (pattern.type === 'yearly') {
      currentDate = addMonths(currentDate, 12 * pattern.interval);
    }
  }
  
  return instances;
};

// Helper function to suggest alternative times when conflict occurs
export const generateTimeSuggestions = async (
  roomId: string,
  date: Date,
  duration: number // in minutes
): Promise<{ startTime: string; endTime: string }[]> => {
  try {
    // Fetch all bookings for the room on the given day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('start_time, end_time')
      .eq('room_id', roomId)
      .eq('status', 'confirmed')
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .order('start_time');
    
    if (error) throw error;
    
    // Define business hours (e.g., 8am to 6pm)
    const businessStartHour = 8;
    const businessEndHour = 18;
    
    // Create time slots at 30-minute intervals
    const timeSlots: { start: Date; end: Date; available: boolean }[] = [];
    
    for (let hour = businessStartHour; hour < businessEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === businessEndHour - 1 && minute + duration > 60) {
          continue; // Skip if slot would extend beyond business hours
        }
        
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + duration);
        
        timeSlots.push({ start, end, available: true });
      }
    }
    
    // Mark slots as unavailable based on existing bookings
    if (data) {
      data.forEach(booking => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        
        timeSlots.forEach(slot => {
          // If there's any overlap, mark as unavailable
          if (
            (slot.start < bookingEnd && slot.end > bookingStart) || 
            (bookingStart < slot.end && bookingEnd > slot.start)
          ) {
            slot.available = false;
          }
        });
      });
    }
    
    // Return available time slots formatted as strings
    return timeSlots
      .filter(slot => slot.available)
      .map(slot => ({
        startTime: format(slot.start, 'HH:mm'),
        endTime: format(slot.end, 'HH:mm')
      }));
  } catch (error) {
    handleSupabaseError(error as Error, 'Failed to generate time suggestions');
    return [];
  }
};
