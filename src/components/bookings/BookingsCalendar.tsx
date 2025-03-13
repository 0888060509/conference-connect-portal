
import React, { useState } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Booking } from "./PersonalBookings";
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

interface BookingsCalendarProps {
  bookings: Booking[];
  onCancel: (bookingId: string, reason?: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onDuplicate: (bookingId: string) => void;
  onShare: (bookingId: string, method: 'email' | 'calendar') => void;
  onSetReminder: (bookingId: string, minutes?: number) => void;
}

export function BookingsCalendar({
  bookings,
  onCancel,
  onCheckIn,
  onCheckOut,
  onDuplicate,
  onShare,
  onSetReminder,
}: BookingsCalendarProps) {
  const [view, setView] = useState<string>('month');
  const [date, setDate] = useState<Date>(new Date());

  // Prepare events for react-big-calendar
  const events = bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    start: new Date(booking.start),
    end: new Date(booking.end),
    resource: booking,
  }));

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
      case 'upcoming':
        style.backgroundColor = '#3182ce'; // blue
        break;
      case 'ongoing':
        style.backgroundColor = '#38a169'; // green
        break;
      case 'completed':
        style.backgroundColor = '#718096'; // gray
        break;
      case 'cancelled':
        style.backgroundColor = '#e53e3e'; // red
        style.textDecoration = 'line-through';
        break;
      default:
        style.backgroundColor = '#3182ce'; // default blue
    }

    return {
      style,
    };
  };

  // Handle booking click
  const handleSelectEvent = (event: any) => {
    const booking = event.resource as Booking;
    console.log('Selected booking:', booking);
    // Here you could open a detail modal, etc.
  };

  // Custom toolbar component
  const CustomToolbar = ({ label, onView, onNavigate, views }: any) => {
    return (
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <span className="text-lg font-semibold">{label}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate('TODAY')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onNavigate('PREV')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => onNavigate('NEXT')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Next
          </button>
        </div>
        <div className="flex gap-2">
          {views.map((name: string) => (
            <button
              key={name}
              type="button"
              onClick={() => onView(name)}
              className={`px-3 py-1 rounded text-sm ${
                view === name ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Handle event prop propagation for each callback function with correct signatures
  const handleCancel = (bookingId: string, reason?: string) => {
    onCancel(bookingId, reason);
  };

  const handleCheckIn = (bookingId: string) => {
    onCheckIn(bookingId);
  };

  const handleCheckOut = (bookingId: string) => {
    onCheckOut(bookingId);
  };

  const handleDuplicate = (bookingId: string) => {
    onDuplicate(bookingId);
  };

  const handleShare = (bookingId: string, method: 'email' | 'calendar') => {
    onShare(bookingId, method);
  };

  const handleSetReminder = (bookingId: string, minutes?: number) => {
    onSetReminder(bookingId, minutes);
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        view={view as Views}
        date={date}
        onView={(newView) => setView(newView)}
        onNavigate={(newDate) => setDate(newDate)}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
