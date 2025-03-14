
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase-client";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";

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
