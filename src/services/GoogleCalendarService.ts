
import { Booking } from "@/components/bookings/PersonalBookings";

// This is a mock service - in a real application, this would connect to the Google Calendar API
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    email: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
}

// Convert a booking to a Google Calendar event
export const convertBookingToGoogleEvent = (booking: Booking): GoogleCalendarEvent => {
  return {
    id: booking.id,
    summary: booking.title,
    description: booking.description,
    location: `${booking.roomName}, ${booking.location}`,
    start: {
      dateTime: booking.start,
      timeZone: 'UTC',
    },
    end: {
      dateTime: booking.end,
      timeZone: 'UTC',
    },
    attendees: booking.attendees.map(email => ({ email })),
  };
};

// Convert a Google Calendar event to a booking
export const convertGoogleEventToBooking = (event: GoogleCalendarEvent): Booking => {
  return {
    id: event.id,
    title: event.summary,
    description: event.description,
    roomName: event.location.split(',')[0].trim(),
    location: event.location.split(',').slice(1).join(',').trim(),
    start: event.start.dateTime,
    end: event.end.dateTime,
    attendees: event.attendees.map(attendee => attendee.email),
    status: 'upcoming',
    createdBy: event.attendees[0]?.email,
  };
};

// Create a calendar event
export const createCalendarEvent = async (booking: Booking): Promise<string> => {
  // In a real app, this would call the Google Calendar API
  console.log(`[GOOGLE CALENDAR] Creating event: ${booking.title}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock event ID
  return `gcal_${booking.id}`;
};

// Update a calendar event
export const updateCalendarEvent = async (booking: Booking): Promise<boolean> => {
  // In a real app, this would call the Google Calendar API
  console.log(`[GOOGLE CALENDAR] Updating event: ${booking.title}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return true;
};

// Delete a calendar event
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  // In a real app, this would call the Google Calendar API
  console.log(`[GOOGLE CALENDAR] Deleting event: ${eventId}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

// List events from Google Calendar within a date range
export const listCalendarEvents = async (
  start: Date,
  end: Date,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent[]> => {
  // In a real app, this would call the Google Calendar API
  console.log(`[GOOGLE CALENDAR] Listing events from ${start.toISOString()} to ${end.toISOString()}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock events
  return [
    {
      id: 'gcal_ext_1',
      summary: 'External Team Meeting',
      description: 'Discuss project timeline with external partners',
      location: 'Conference Room A, 2nd Floor',
      start: {
        dateTime: new Date(start.getTime() + 3600000).toISOString(), // 1 hour after start
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(start.getTime() + 7200000).toISOString(), // 2 hours after start
        timeZone: 'UTC',
      },
      attendees: [
        { email: 'external1@client.com', responseStatus: 'accepted' },
        { email: 'external2@client.com', responseStatus: 'tentative' },
        { email: 'user@company.com', responseStatus: 'accepted' },
      ],
    },
    {
      id: 'gcal_ext_2',
      summary: 'Product Planning',
      description: 'Quarterly product roadmap planning',
      location: 'Meeting Room B, 2nd Floor',
      start: {
        dateTime: new Date(start.getTime() + 86400000).toISOString(), // 1 day after start
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(start.getTime() + 86400000 + 5400000).toISOString(), // 1 day + 1.5 hours after start
        timeZone: 'UTC',
      },
      attendees: [
        { email: 'product@company.com', responseStatus: 'accepted' },
        { email: 'engineering@company.com', responseStatus: 'accepted' },
        { email: 'user@company.com', responseStatus: 'accepted' },
      ],
    },
  ];
};

// Sync two-way with Google Calendar
export const syncWithGoogleCalendar = async (
  bookings: Booking[],
  start: Date,
  end: Date,
): Promise<{
  added: Booking[],
  updated: Booking[],
  removed: string[],
}> => {
  // In a real app, this would perform a two-way sync with Google Calendar
  console.log(`[GOOGLE CALENDAR] Syncing between ${start.toISOString()} and ${end.toISOString()}`);
  
  // 1. Get events from Google Calendar
  const googleEvents = await listCalendarEvents(start, end);
  
  // 2. Convert to bookings
  const googleBookings = googleEvents.map(convertGoogleEventToBooking);
  
  // Simulate new, updated and removed events
  // In a real implementation, this would compare the Google events with local bookings
  const added = googleBookings.filter(b => !bookings.some(existing => existing.id === b.id));
  const updated: Booking[] = [];
  const removed: string[] = ['gcal_deleted_1'];
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    added,
    updated,
    removed,
  };
};

// Get OAuth URL for Google Calendar
export const getGoogleCalendarAuthUrl = (): string => {
  // In a real app, this would generate an OAuth URL for Google Calendar
  return 'https://accounts.google.com/o/oauth2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=https://meetingmaster.app/oauth/callback&scope=https://www.googleapis.com/auth/calendar&response_type=code';
};

// Complete OAuth flow for Google Calendar
export const completeGoogleCalendarAuth = async (code: string): Promise<boolean> => {
  // In a real app, this would exchange the code for tokens
  console.log(`[GOOGLE CALENDAR] Completing OAuth flow with code: ${code}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};
