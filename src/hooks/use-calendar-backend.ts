
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { 
  fetchRoomAvailability, 
  checkBookingConflicts,
  createBooking,
  updateBooking,
  cancelBooking,
  generateICalendar,
  generateTimeSuggestions,
  type RecurrencePattern,
  type BookingConflict
} from '@/services/calendarService';
import { useAuth } from '@/contexts/auth';

// Hook to get room availability for calendar views
export function useRoomAvailability(roomIds: string[], date: Date) {
  return useQuery({
    queryKey: ['roomAvailability', roomIds, date.toISOString().split('T')[0]],
    queryFn: () => fetchRoomAvailability(roomIds, date),
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

// Hook to check for booking conflicts
export function useBookingConflicts(
  roomId: string | undefined,
  startTime: Date | undefined,
  endTime: Date | undefined,
  bookingId?: string
) {
  const enabled = !!roomId && !!startTime && !!endTime;
  
  return useQuery({
    queryKey: ['bookingConflicts', roomId, startTime?.toISOString(), endTime?.toISOString(), bookingId],
    queryFn: () => checkBookingConflicts(roomId!, startTime!, endTime!, bookingId),
    enabled: enabled,
    gcTime: 0, // Don't cache conflicts
    staleTime: 0 // Always refetch
  });
}

// Hook for creating a new booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (newBooking: {
      title: string;
      description?: string;
      roomId: string;
      startTime: Date;
      endTime: Date;
      recurring?: RecurrencePattern;
      attendees?: string[];
    }) => {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }
      
      return createBooking({
        ...newBooking,
        userId: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    }
  });
}

// Hook for updating an existing booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      updates 
    }: {
      bookingId: string;
      updates: {
        title?: string;
        description?: string;
        roomId?: string;
        startTime?: Date;
        endTime?: Date;
        attendees?: string[];
      };
    }) => updateBooking(bookingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    }
  });
}

// Hook for cancelling a booking
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      reason 
    }: { 
      bookingId: string; 
      reason?: string 
    }) => cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    }
  });
}

// Hook for generating iCalendar data
export function useGenerateICalendar(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['iCalendar', bookingId],
    queryFn: () => generateICalendar(bookingId!),
    enabled: !!bookingId,
    gcTime: 10 * 60 * 1000, // 10 minutes
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

// Hook for finding available time slots
export function useAvailableTimeSlots(
  roomId: string | undefined,
  date: Date | undefined,
  duration: number = 30 // default 30 minutes
) {
  return useQuery({
    queryKey: ['availableTimeSlots', roomId, date?.toISOString().split('T')[0], duration],
    queryFn: () => generateTimeSuggestions(roomId!, date!, duration),
    enabled: !!roomId && !!date,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

// Hook for searching users (for attendees)
export function useUserSearch(searchTerm: string) {
  const { user } = useAuth();
  const enabled = !!searchTerm && searchTerm.length >= 2 && !!user;
  
  return useQuery({
    queryKey: ['userSearch', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('users')
        .select('id, email, first_name, last_name')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: enabled,
    gcTime: 2 * 60 * 1000, // 2 minutes
    staleTime: 1 * 60 * 1000 // 1 minute
  });
}

// Hook for realtime calendar updates
export function useRealtimeCalendarUpdates(callback: () => void) {
  useEffect(() => {
    // Set up realtime subscription to bookings table
    const channel = supabaseClient
      .channel('calendar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          callback();
        }
      )
      .subscribe();
    
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [callback]);
}

// Hook for tracking booking changes with optimistic updates
export function useBookingDragDrop() {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  
  const mutation = useMutation({
    mutationFn: async ({ 
      bookingId, 
      startTime, 
      endTime, 
      roomId 
    }: { 
      bookingId: string; 
      startTime: Date; 
      endTime: Date; 
      roomId?: string;
    }) => {
      // Check for conflicts first
      const conflicts = await checkBookingConflicts(
        roomId || (await getBookingRoomId(bookingId)),
        startTime,
        endTime,
        bookingId
      );
      
      if (conflicts.length > 0) {
        throw new Error('Time slot conflicts with existing bookings');
      }
      
      // Update the booking
      return updateBooking(bookingId, {
        startTime,
        endTime,
        ...(roomId ? { roomId } : {})
      });
    },
    onMutate: async (variables) => {
      setIsDragging(true);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      
      // Get current bookings
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      // Optimistically update bookings
      queryClient.setQueryData(['bookings'], (old: any) => {
        if (!old) return old;
        
        return old.map((booking: any) => {
          if (booking.id === variables.bookingId) {
            return {
              ...booking,
              start_time: variables.startTime.toISOString(),
              end_time: variables.endTime.toISOString(),
              ...(variables.roomId ? { room_id: variables.roomId } : {})
            };
          }
          return booking;
        });
      });
      
      return { previousBookings };
    },
    onSettled: () => {
      setIsDragging(false);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    },
    onError: (error, variables, context) => {
      // Revert to previous state
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
      toast.error('Failed to update booking: ' + (error as Error).message);
    },
    onSuccess: () => {
      toast.success('Booking updated successfully');
    }
  });
  
  // Helper to get room ID for a booking
  const getBookingRoomId = async (bookingId: string): Promise<string> => {
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('room_id')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data.room_id;
  };
  
  return {
    updateBookingTime: mutation.mutate,
    isUpdating: mutation.isPending,
    isDragging,
    error: mutation.error
  };
}
