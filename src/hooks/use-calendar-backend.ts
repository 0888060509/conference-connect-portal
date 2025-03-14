
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase-client";
import { toast } from "sonner";
import { useEffect, useCallback, useState } from "react";
import { 
  fetchRoomAvailability, 
  createBooking, 
  updateBooking, 
  cancelBooking, 
  generateICalendar,
  checkBookingConflicts
} from "@/services/calendarService";

// Types
interface UpdateBookingParams {
  bookingId: string;
  updates: {
    startTime?: Date;
    endTime?: Date;
    title?: string;
    description?: string;
    roomId?: string;
    status?: string;
  };
}

interface CancelBookingParams {
  bookingId: string;
  reason?: string;
}

interface CreateBookingParams {
  title: string;
  description?: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  recurring?: any;
  attendees?: string[];
}

interface BookingDragDropParams {
  bookingId: string;
  startTime: Date;
  endTime: Date;
  roomId?: string;
}

// Hook to check room availability
export function useRoomAvailability(roomIds: string[], date: Date) {
  return useQuery({
    queryKey: ['roomAvailability', roomIds, date.toISOString().split('T')[0]],
    queryFn: () => fetchRoomAvailability(roomIds, date)
  });
}

// Hook to create a booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      if (!supabaseClient.auth.getUser()) {
        throw new Error('User must be logged in to create a booking');
      }
      
      const { data } = await supabaseClient.auth.getUser();
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      return createBooking({
        ...params,
        userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['roomAvailability'] });
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking');
    },
  });
}

// Hook to search for users
export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['userSearch', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabaseClient
        .from('users')
        .select('id, email, first_name, last_name')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
        
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2
  });
}

// Hook to cancel a booking
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingParams) => {
      const { data, error } = await supabaseClient
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason || null 
        })
        .eq('id', bookingId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    },
  });
}

// Hook to update booking details
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookingId, updates }: UpdateBookingParams) => {
      const updateData: Record<string, any> = {};
      
      if (updates.startTime) updateData.start_time = updates.startTime.toISOString();
      if (updates.endTime) updateData.end_time = updates.endTime.toISOString();
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.roomId) updateData.room_id = updates.roomId;
      if (updates.status) updateData.status = updates.status;
      
      const { data, error } = await supabaseClient
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Booking updated successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    },
  });
}

// Hook for drag and drop bookings
export function useBookingDragDrop() {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  
  const updateBookingTime = useMutation({
    mutationFn: async (params: BookingDragDropParams) => {
      const { bookingId, startTime, endTime, roomId } = params;
      
      setIsDragging(true);
      
      // Check for conflicts first
      const conflicts = await checkBookingConflicts(
        roomId || '', // Use current room if no new room specified
        startTime,
        endTime,
        bookingId
      );
      
      if (conflicts.length > 0) {
        throw new Error('This time slot conflicts with another booking');
      }
      
      // Update the booking
      const updateData: Record<string, any> = {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      };
      
      if (roomId) {
        updateData.room_id = roomId;
      }
      
      const { data, error } = await supabaseClient
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Booking moved successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsDragging(false);
    },
    onError: (error) => {
      console.error('Failed to move booking:', error);
      toast.error('Failed to move booking: ' + (error as Error).message);
      setIsDragging(false);
    },
  });
  
  return {
    updateBookingTime: updateBookingTime.mutate,
    isUpdating: updateBookingTime.isPending,
    isDragging
  };
}

// Hook for generating iCalendar data
export function useGenerateICalendar(bookingId: string) {
  return useQuery({
    queryKey: ['icalendar', bookingId],
    queryFn: () => generateICalendar(bookingId),
    enabled: !!bookingId
  });
}

// Hook for realtime calendar updates
export function useRealtimeCalendarUpdates(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabaseClient
      .channel('bookings-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        () => {
          onUpdate();
        }
      )
      .subscribe();
      
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [onUpdate]);
}
