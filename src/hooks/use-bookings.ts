
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { createQueryHook, createMutationHook } from './use-query-factory';
import { useRealtime } from './use-realtime';

export type Booking = {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  recurring_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BookingWithRoom = Booking & {
  room: {
    id: string;
    name: string;
    building?: string;
    floor?: string;
    number?: string;
  }
};

/**
 * Hook for fetching all bookings with optional filtering
 */
export function useBookings(options: {
  status?: 'confirmed' | 'cancelled' | 'completed';
  roomId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const queryFn = async () => {
    let query = supabaseClient
      .from('bookings')
      .select('*, room:room_id(id, name, building, floor, number)', { count: 'exact' });
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.roomId) {
      query = query.eq('room_id', options.roomId);
    }
    
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options.startDate) {
      query = query.gte('start_time', options.startDate);
    }
    
    if (options.endDate) {
      query = query.lte('end_time', options.endDate);
    }
    
    query = query.order('start_time', { ascending: true });
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    if (count !== null) setTotalCount(count);
    
    return data as BookingWithRoom[];
  };
  
  const bookingsQuery = createQueryHook<BookingWithRoom[]>(
    ['bookings', options],
    queryFn
  )();
  
  // Set up real-time subscription for bookings
  useRealtime<Booking>((payload) => {
    bookingsQuery.refetch();
  }, {
    table: 'bookings',
    onError: (error) => console.error('Realtime subscription error:', error)
  });
  
  return {
    ...bookingsQuery,
    totalCount,
    pagination: {
      limit: options.limit || 10,
      offset: options.offset || 0,
      totalPages: Math.ceil(totalCount / (options.limit || 10)),
      currentPage: Math.floor((options.offset || 0) / (options.limit || 10)) + 1,
    }
  };
}

/**
 * Hook for fetching a user's bookings
 */
export function useUserBookings(userId?: string) {
  const queryFn = async () => {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*, room:room_id(id, name, building, floor, number)')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data as BookingWithRoom[];
  };
  
  const bookingsQuery = createQueryHook<BookingWithRoom[]>(
    ['userBookings', userId],
    queryFn,
    { enabled: !!userId }
  )();
  
  // Set up real-time subscription for user's bookings
  useRealtime<Booking>((payload) => {
    if (payload.new && 'user_id' in payload.new && payload.new.user_id === userId) {
      bookingsQuery.refetch();
    }
  }, {
    table: 'bookings',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onError: (error) => console.error('Realtime subscription error:', error)
  });
  
  return bookingsQuery;
}

/**
 * Hook for fetching a single booking by ID
 */
export function useBooking(id: string | undefined) {
  const queryFn = async () => {
    if (!id) throw new Error('Booking ID is required');
    
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*, room:room_id(id, name, building, floor, number)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as BookingWithRoom;
  };
  
  return createQueryHook<BookingWithRoom>(
    ['booking', id],
    queryFn,
    { enabled: !!id }
  )();
}

/**
 * Hook for creating a new booking
 */
export function useCreateBooking() {
  const mutationFn = async (newBooking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert({
        title: newBooking.title,
        description: newBooking.description,
        user_id: newBooking.user_id,
        room_id: newBooking.room_id,
        start_time: newBooking.start_time,
        end_time: newBooking.end_time,
        status: newBooking.status,
        recurring_id: newBooking.recurring_id
      })
      .select('*, room:room_id(id, name, building, floor, number)')
      .single();
    
    if (error) throw error;
    return data as BookingWithRoom;
  };
  
  return createMutationHook<BookingWithRoom, Omit<Booking, 'id' | 'created_at' | 'updated_at'>>(
    'bookings',
    mutationFn,
    {
      onSuccessMessage: 'Booking created successfully',
      invalidateQueries: ['bookings', 'userBookings']
    }
  )();
}

/**
 * Hook for updating an existing booking
 */
export function useUpdateBooking() {
  const mutationFn = async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .update({
        title: updates.title,
        description: updates.description,
        user_id: updates.user_id,
        room_id: updates.room_id,
        start_time: updates.start_time,
        end_time: updates.end_time,
        status: updates.status,
        recurring_id: updates.recurring_id
      })
      .eq('id', id)
      .select('*, room:room_id(id, name, building, floor, number)')
      .single();
    
    if (error) throw error;
    return data as BookingWithRoom;
  };
  
  return createMutationHook<BookingWithRoom, Partial<Booking> & { id: string }>(
    'bookings',
    mutationFn,
    {
      onSuccessMessage: 'Booking updated successfully',
      invalidateQueries: [['bookings'], ['userBookings'], ['booking', (updates: any) => updates.id]],
      optimisticUpdate: (variables, oldData: BookingWithRoom[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(booking => 
          booking.id === variables.id ? { ...booking, ...variables } : booking
        );
      }
    }
  )();
}

/**
 * Hook for cancelling a booking
 */
export function useCancelBooking() {
  const mutationFn = async (id: string) => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*, room:room_id(id, name, building, floor, number)')
      .single();
    
    if (error) throw error;
    return data as BookingWithRoom;
  };
  
  return createMutationHook<BookingWithRoom, string>(
    'bookings',
    mutationFn,
    {
      onSuccessMessage: 'Booking cancelled successfully',
      invalidateQueries: [['bookings'], ['userBookings'], ['booking']],
      optimisticUpdate: (id, oldData: BookingWithRoom[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(booking => 
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        );
      }
    }
  )();
}

/**
 * Hook for checking booking conflicts
 */
export function useCheckBookingConflicts() {
  const queryFn = async ({ 
    roomId, 
    startTime, 
    endTime, 
    bookingId 
  }: { 
    roomId: string; 
    startTime: string; 
    endTime: string; 
    bookingId?: string;
  }) => {
    const { data, error } = await supabaseClient
      .rpc('check_booking_conflicts', {
        p_room_id: roomId,
        p_start_time: startTime,
        p_end_time: endTime,
        p_booking_id: bookingId
      });
    
    if (error) throw error;
    return data as {
      conflicting_booking_id: string;
      title: string;
      start_time: string;
      end_time: string;
      user_id: string;
    }[];
  };
  
  return createQueryHook<{
    conflicting_booking_id: string;
    title: string;
    start_time: string;
    end_time: string;
    user_id: string;
  }[]>(
    ['bookingConflicts'],
    () => Promise.resolve([]) // This is a placeholder, will be replaced with actual params
  )({ 
    enabled: false, // Disable automatic fetching since we'll call it manually
    staleTime: 0 // Always refetch on demand
  });
}
