
import React, { useCallback } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useBookings, Booking } from "@/hooks/use-bookings";
import { useCancelBooking, useUpdateBooking, useRealtimeCalendarUpdates, useGenerateICalendar } from "@/hooks/use-calendar-backend";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function BookingCalendar() {
  const { user } = useAuth();
  const { data: bookings, isLoading, refetch } = useBookings({
    userId: user?.id
  });
  
  // Set up mutations
  const cancelMutation = useCancelBooking();
  const updateMutation = useUpdateBooking();
  
  // Set up realtime updates
  useRealtimeCalendarUpdates(() => {
    refetch();
  });
  
  // Calendar event handlers
  const handleSelectEvent = (event: any) => {
    const booking = event.resource as Booking;
    // Open booking details dialog
    console.log('Selected booking:', booking);
  };
  
  const handleEventDrop = ({ event, start, end }: any) => {
    const booking = event.resource as Booking;
    
    updateMutation.mutate({
      bookingId: booking.id,
      updates: {
        startTime: start,
        endTime: end
      }
    });
  };
  
  // Handle booking operations
  const handleCancel = (bookingId: string, reason?: string) => {
    cancelMutation.mutate({ bookingId, reason });
  };
  
  const handleExportToCalendar = async (bookingId: string) => {
    const { data: icalData } = useGenerateICalendar(bookingId);
    
    if (icalData) {
      // Create a blob from the iCalendar data
      const blob = new Blob([icalData], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-${bookingId}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Failed to generate calendar data');
    }
  };
  
  // Prepare events for react-big-calendar
  const events = bookings ? bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    start: new Date(booking.start_time),
    end: new Date(booking.end_time),
    resource: booking,
  })) : [];
  
  // Event styling based on booking status
  const eventStyleGetter = (event: any) => {
    const booking = event.resource as Booking;
    let style: React.CSSProperties = {
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0',
      display: 'block',
    };

    switch (booking.status) {
      case 'confirmed':
        style.backgroundColor = '#3182ce'; // blue
        break;
      case 'cancelled':
        style.backgroundColor = '#e53e3e'; // red
        style.textDecoration = 'line-through';
        break;
      case 'completed':
        style.backgroundColor = '#718096'; // gray
        break;
      default:
        style.backgroundColor = '#3182ce'; // default blue
    }

    return {
      style,
    };
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        resizable
      />
    </div>
  );
}
