import pool from "@/db/postgres";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed';
  attendees?: Attendee[];
  roomName?: string;
  location?: string;
}

/**
 * Get available rooms based on filter criteria
 */
export const getAvailableRooms = async (filters: RoomFilter) => {
  try {
    let query = 'SELECT id, name, number, building, floor, capacity, image_url, description, status FROM rooms WHERE status = $1';
    const queryParams: any[] = ['active'];
    let paramIndex = 2;

    // Apply filters
    if (filters.capacity) {
      query += ` AND capacity >= $${paramIndex}`;
      queryParams.push(filters.capacity);
      paramIndex++;
    }

    if (filters.building) {
      query += ` AND building = $${paramIndex}`;
      queryParams.push(filters.building);
      paramIndex++;
    }

    if (filters.floor) {
      query += ` AND floor = $${paramIndex}`;
      queryParams.push(filters.floor);
      paramIndex++;
    }

    const { rows: rooms } = await pool.query(query, queryParams);

    // If date and time filters are provided, filter out rooms with conflicting bookings
    if (filters.date && filters.startTime && filters.endTime) {
      const date = filters.date;
      const startTime = new Date(`${date.toISOString().split('T')[0]}T${filters.startTime}`);
      const endTime = new Date(`${date.toISOString().split('T')[0]}T${filters.endTime}`);
      
      // For each room, check if there's a conflicting booking
      const availableRooms = await Promise.all(
        rooms.map(async (room) => {
          const { rows: conflicts } = await pool.query(
            `SELECT id, title, start_time, end_time, user_id 
             FROM bookings 
             WHERE room_id = $1 
             AND status != 'cancelled'
             AND (
               (start_time <= $2 AND end_time > $2) OR
               (start_time < $3 AND end_time >= $3) OR
               (start_time >= $2 AND end_time <= $3)
             )`,
            [room.id, startTime.toISOString(), endTime.toISOString()]
          );

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
    const { rows } = await pool.query(
      `SELECT id, name, number, building, floor, capacity, image_url, description, status
       FROM rooms
       WHERE id = $1`,
      [roomId]
    );

    if (rows.length === 0) {
      throw new Error("Room not found");
    }

    return rows[0];
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

    let query = `
      SELECT id as conflicting_booking_id, title, start_time, end_time, user_id
      FROM bookings
      WHERE room_id = $1
      AND status != 'cancelled'
      AND (
        (start_time <= $2 AND end_time > $2) OR
        (start_time < $3 AND end_time >= $3) OR
        (start_time >= $2 AND end_time <= $3)
      )
    `;
    
    const queryParams = [roomId, startDateTime.toISOString(), endDateTime.toISOString()];
    
    if (excludeBookingId) {
      query += ' AND id != $4';
      queryParams.push(excludeBookingId);
    }

    const { rows: conflicts } = await pool.query(query, queryParams);

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
export const createBooking = async (bookingData: BookingFormData, userId: string): Promise<Booking> => {
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
    const { rows: [booking] } = await pool.query(
      `INSERT INTO bookings (
        room_id, 
        title, 
        description, 
        start_time, 
        end_time, 
        status, 
        user_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, room_id, title, description, start_time, end_time, status`,
      [
        bookingData.roomId,
        bookingData.title,
        bookingData.description,
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        'confirmed',
        userId
      ]
    );

    // If there are attendees, add them to the booking_attendees table
    if (bookingData.attendees && bookingData.attendees.length > 0) {
      // First, lookup the user IDs for the email addresses
      const { rows: users } = await pool.query(
        `SELECT id, email, first_name, last_name 
         FROM users 
         WHERE email = ANY($1)`,
        [bookingData.attendees]
      );

      if (users && users.length > 0) {
        // Create attendee records for each user
        const attendeeValues = users.map(user => 
          `('${booking.id}', '${user.id}', 'invited')`
        ).join(',');

        await pool.query(
          `INSERT INTO booking_attendees (booking_id, user_id, status)
           VALUES ${attendeeValues}`
        );
      }
    }

    // Get room details to include in the response
    const { rows: [room] } = await pool.query(
      `SELECT name, building, floor 
       FROM rooms 
       WHERE id = $1`,
      [bookingData.roomId]
    );

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
    const { rows: currentBookingResult } = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (currentBookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const currentBooking = currentBookingResult.rows[0];

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
      const updateFields = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const updateValues = Object.values(updateData);
      updateValues.unshift(bookingId);

      const { rowCount } = await pool.query(
        `UPDATE bookings SET ${updateFields} WHERE id = $1`,
        updateValues
      );

      if (rowCount === 0) {
        throw new Error('Failed to update booking');
      }
    }

    // Update attendees if provided
    if (bookingData.attendees) {
      // First, remove current attendees
      await pool.query(
        'DELETE FROM booking_attendees WHERE booking_id = $1',
        [bookingId]
      );

      // Then add new attendees
      if (bookingData.attendees.length > 0) {
        // Lookup the user IDs for the email addresses
        const { rows: users } = await pool.query(
          `SELECT id, email, first_name, last_name 
           FROM users 
           WHERE email = ANY($1)`,
          [bookingData.attendees]
        );

        if (users && users.length > 0) {
          // Create attendee records for each user
          const attendeeValues = users.map(user => 
            `('${bookingId}', '${user.id}', 'invited')`
          ).join(',');

          await pool.query(
            `INSERT INTO booking_attendees (booking_id, user_id, status)
             VALUES ${attendeeValues}`
          );
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
    const { rowCount } = await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
      [bookingId]
    );

    if (rowCount === 0) {
      throw new Error('Booking not found or already cancelled');
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
export const getUserBookings = async (status?: 'confirmed' | 'cancelled' | 'completed'): Promise<Booking[]> => {
  try {
    let query = `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.start_time,
        b.end_time,
        b.status,
        b.room_id,
        r.name AS room_name,
        r.building AS room_building,
        r.floor AS room_floor
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = $1
    `;

    const queryParams: any[] = [useAuth().user?.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    } else {
      query += ` AND b.status != 'cancelled'`;
    }

    query += ` ORDER BY b.start_time ASC`;

    const { rows: data } = await pool.query(query, queryParams);

    // Transform the data to match our interface
    const transformedBookings: Booking[] = data.map(booking => ({
      id: booking.id,
      roomId: booking.room_id,
      title: booking.title,
      description: booking.description,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      status: booking.status as 'confirmed' | 'cancelled' | 'pending' | 'completed',
      roomName: booking.room_name,
      location: booking.room_building ? `${booking.room_building}, ${booking.room_floor}` : undefined
    }));

    return transformedBookings;
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
    const { rows: bookingResult } = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.start_time,
        b.end_time,
        b.status,
        b.room_id,
        r.name AS room_name,
        r.building AS room_building,
        r.floor AS room_floor
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = $1
    `,
      [bookingId]
    );

    if (bookingResult.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult[0];

    const { rows: attendeesResult } = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        ba.status
      FROM booking_attendees ba
      JOIN users u ON ba.user_id = u.id
      WHERE ba.booking_id = $1
    `,
      [bookingId]
    );

    // Transform attendees data
    const attendees = attendeesResult.map(attendee => ({
      id: attendee.id,
      email: attendee.email,
      name: `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim(),
      status: attendee.status as 'invited' | 'confirmed' | 'declined'
    })) || [];

    return {
      id: booking.id,
      roomId: booking.room_id,
      title: booking.title,
      description: booking.description,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      status: booking.status as 'confirmed' | 'cancelled' | 'pending' | 'completed',
      attendees,
      roomName: booking.room_name,
      location: booking.room_building ? `${booking.room_building}, ${booking.room_floor}` : undefined
    };
  } catch (error) {
    console.error('Error in getBookingById:', error);
    toast.error('Failed to fetch booking details');
    throw error;
  }
};
