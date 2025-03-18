
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RoomFilter {
  capacity?: number;
  amenities?: string[];
  building?: string;
  floor?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
}

export interface BookingFormData {
  roomId: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees?: string[]; // Array of email addresses
}

export interface Attendee {
  id: string;
  email: string;
  name: string;
  status: 'invited' | 'confirmed' | 'declined';
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled' | 'pending';
  attendees?: Attendee[];
  roomName?: string;
  location?: string;
}

/**
 * Get available rooms based on filter criteria
 */
export const getAvailableRooms = async (filters: RoomFilter) => {
  try {
    // Start building the query
    let query = supabase
      .from('rooms')
      .select(`
        id,
        name,
        number,
        building,
        floor,
        capacity,
        image_url,
        description,
        status
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters.capacity) {
      query = query.gte('capacity', filters.capacity);
    }

    if (filters.building) {
      query = query.eq('building', filters.building);
    }

    if (filters.floor) {
      query = query.eq('floor', filters.floor);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }

    // If date and time filters are provided, filter out rooms with conflicting bookings
    if (filters.date && filters.startTime && filters.endTime) {
      const date = filters.date;
      const startTime = new Date(`${date.toISOString().split('T')[0]}T${filters.startTime}`);
      const endTime = new Date(`${date.toISOString().split('T')[0]}T${filters.endTime}`);
      
      // For each room, check if there's a conflicting booking
      const availableRooms = await Promise.all(
        rooms.map(async (room) => {
          const { data: conflicts, error } = await supabase.rpc(
            'check_booking_conflicts',
            {
              p_room_id: room.id,
              p_start_time: startTime.toISOString(),
              p_end_time: endTime.toISOString()
            }
          );

          if (error) {
            console.error('Error checking booking conflicts:', error);
            return null;
          }

          // If no conflicts, the room is available
          return conflicts.length === 0 ? room : null;
        })
      );

      return availableRooms.filter(room => room !== null);
    }

    return rooms;
  } catch (error) {
    console.error('Error in getAvailableRooms:', error);
    toast.error('Failed to fetch available rooms');
    throw error;
  }
};

/**
 * Get room details by ID
 */
export const getRoomById = async (roomId: string) => {
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select(`
        id,
        name,
        number,
        building,
        floor,
        capacity,
        image_url,
        description,
        status
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room details:', error);
      throw error;
    }

    return room;
  } catch (error) {
    console.error('Error in getRoomById:', error);
    toast.error('Failed to fetch room details');
    throw error;
  }
};

/**
 * Check if a room is available for a specific time period
 */
export const checkRoomAvailability = async (
  roomId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) => {
  try {
    const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
    const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);

    const { data: conflicts, error } = await supabase.rpc(
      'check_booking_conflicts',
      {
        p_room_id: roomId,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_booking_id: excludeBookingId || null
      }
    );

    if (error) {
      console.error('Error checking room availability:', error);
      throw error;
    }

    return { 
      available: conflicts.length === 0,
      conflicts 
    };
  } catch (error) {
    console.error('Error in checkRoomAvailability:', error);
    toast.error('Failed to check room availability');
    throw error;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: BookingFormData): Promise<Booking> => {
  try {
    // Check if the room is available first
    const { available, conflicts } = await checkRoomAvailability(
      bookingData.roomId,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime
    );

    if (!available) {
      toast.error('This room is not available for the selected time period');
      throw new Error('Room not available');
    }

    // Format the date and times for the database
    const startDateTime = new Date(`${bookingData.date.toISOString().split('T')[0]}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.date.toISOString().split('T')[0]}T${bookingData.endTime}`);

    // Insert the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: bookingData.roomId,
        title: bookingData.title,
        description: bookingData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw bookingError;
    }

    // If there are attendees, add them to the booking_attendees table
    if (bookingData.attendees && bookingData.attendees.length > 0) {
      // First, lookup the user IDs for the email addresses
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('email', bookingData.attendees);

      if (usersError) {
        console.error('Error fetching attendees:', usersError);
        // Continue anyway, we'll just add the ones we found
      }

      if (users && users.length > 0) {
        // Create attendee records for each user
        const attendeeRecords = users.map(user => ({
          booking_id: booking.id,
          user_id: user.id,
          status: 'invited'
        }));

        const { error: attendeesError } = await supabase
          .from('booking_attendees')
          .insert(attendeeRecords);

        if (attendeesError) {
          console.error('Error adding attendees:', attendeesError);
          // Continue anyway, the booking was created
        }
      }
    }

    // Get room details to include in the response
    const { data: room } = await supabase
      .from('rooms')
      .select('name, building, floor')
      .eq('id', bookingData.roomId)
      .single();

    toast.success('Booking created successfully');

    return {
      id: booking.id,
      roomId: booking.room_id,
      title: booking.title,
      description: booking.description,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      status: booking.status,
      roomName: room?.name,
      location: room ? `${room.building}, ${room.floor}` : undefined
    };
  } catch (error) {
    console.error('Error in createBooking:', error);
    toast.error('Failed to create booking');
    throw error;
  }
};

/**
 * Update an existing booking
 */
export const updateBooking = async (
  bookingId: string, 
  bookingData: Partial<BookingFormData>
): Promise<void> => {
  try {
    // Get the current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
      throw fetchError;
    }

    // Prepare update data
    const updateData: any = {};

    if (bookingData.title) updateData.title = bookingData.title;
    if (bookingData.description !== undefined) updateData.description = bookingData.description;

    // If date or times are being updated, check availability
    if (bookingData.date || bookingData.startTime || bookingData.endTime) {
      const date = bookingData.date || new Date(currentBooking.start_time);
      const startTime = bookingData.startTime || 
        new Date(currentBooking.start_time).toISOString().split('T')[1].substring(0, 5);
      const endTime = bookingData.endTime || 
        new Date(currentBooking.end_time).toISOString().split('T')[1].substring(0, 5);
      
      // Check if the room is available for the new time
      const roomId = bookingData.roomId || currentBooking.room_id;
      const { available } = await checkRoomAvailability(
        roomId, 
        date,
        startTime,
        endTime,
        bookingId
      );

      if (!available) {
        toast.error('The room is not available for the selected time period');
        throw new Error('Room not available for the updated time');
      }

      // Format the date and times for the database
      const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${startTime}`);
      const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${endTime}`);
      
      updateData.start_time = startDateTime.toISOString();
      updateData.end_time = endDateTime.toISOString();
      
      if (bookingData.roomId && bookingData.roomId !== currentBooking.room_id) {
        updateData.room_id = bookingData.roomId;
      }
    }

    // Update the booking if we have changes
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        throw updateError;
      }
    }

    // Update attendees if provided
    if (bookingData.attendees) {
      // First, remove current attendees
      const { error: deleteError } = await supabase
        .from('booking_attendees')
        .delete()
        .eq('booking_id', bookingId);

      if (deleteError) {
        console.error('Error removing current attendees:', deleteError);
        // Continue anyway
      }

      // Then add new attendees
      if (bookingData.attendees.length > 0) {
        // Lookup the user IDs for the email addresses
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email')
          .in('email', bookingData.attendees);

        if (usersError) {
          console.error('Error fetching attendees:', usersError);
          // Continue anyway
        }

        if (users && users.length > 0) {
          // Create attendee records for each user
          const attendeeRecords = users.map(user => ({
            booking_id: bookingId,
            user_id: user.id,
            status: 'invited'
          }));

          const { error: attendeesError } = await supabase
            .from('booking_attendees')
            .insert(attendeeRecords);

          if (attendeesError) {
            console.error('Error adding attendees:', attendeesError);
            // Continue anyway
          }
        }
      }
    }

    toast.success('Booking updated successfully');
  } catch (error) {
    console.error('Error in updateBooking:', error);
    toast.error('Failed to update booking');
    throw error;
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }

    toast.success('Booking cancelled successfully');
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    toast.error('Failed to cancel booking');
    throw error;
  }
};

/**
 * Get a user's bookings
 */
export const getUserBookings = async (status?: string): Promise<Booking[]> => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        status,
        room_id,
        rooms (
          name,
          building,
          floor
        )
      `);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'cancelled');
    }

    // Order by start_time descending (newest first)
    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }

    // Transform the data to match our interface
    return data.map(booking => ({
      id: booking.id,
      roomId: booking.room_id,
      title: booking.title,
      description: booking.description,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      status: booking.status,
      roomName: booking.rooms?.name,
      location: booking.rooms ? `${booking.rooms.building}, ${booking.rooms.floor}` : undefined
    }));
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    toast.error('Failed to fetch bookings');
    throw error;
  }
};

/**
 * Get booking details by ID
 */
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        status,
        room_id,
        rooms (
          name,
          building,
          floor
        ),
        booking_attendees (
          user_id,
          status,
          users (
            id,
            email,
            first_name,
            last_name
          )
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }

    // Transform attendees data
    const attendees = booking.booking_attendees?.map(attendee => ({
      id: attendee.user_id,
      email: attendee.users.email,
      name: `${attendee.users.first_name || ''} ${attendee.users.last_name || ''}`.trim(),
      status: attendee.status
    })) || [];

    return {
      id: booking.id,
      roomId: booking.room_id,
      title: booking.title,
      description: booking.description,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      status: booking.status,
      attendees,
      roomName: booking.rooms?.name,
      location: booking.rooms ? `${booking.rooms.building}, ${booking.rooms.floor}` : undefined
    };
  } catch (error) {
    console.error('Error in getBookingById:', error);
    toast.error('Failed to fetch booking details');
    throw error;
  }
};
