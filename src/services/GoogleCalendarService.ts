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
  recurrence?: string[];
  extendedProperties?: {
    private?: {
      equipment?: string;
      cateringRequested?: string;
      exceptionDates?: string; // JSON stringified array of exception dates
    };
  };
}

// Enhanced recurrence interface for Google Calendar
export interface RecurrenceRule {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval: number;
  weekdays?: string[];
  monthlyOption?: "dayOfMonth" | "dayOfWeek";
  endType: "afterDate" | "afterOccurrences" | "never";
  endDate?: Date;
  occurrences?: number;
  exceptionDates: Date[];
}

// Helper to generate RRule string for Google Calendar
const generateRRuleString = (rule: RecurrenceRule, startDate: Date): string => {
  let rrule = `RRULE:FREQ=`;
  
  // Set frequency
  switch (rule.type) {
    case "daily":
      rrule += "DAILY";
      break;
    case "weekly":
      rrule += "WEEKLY";
      break;
    case "monthly":
      rrule += "MONTHLY";
      break;
    case "custom":
      // Custom would need more complex logic
      rrule += "WEEKLY"; // Default to weekly for custom
      break;
  }
  
  // Set interval
  if (rule.interval > 1) {
    rrule += `;INTERVAL=${rule.interval}`;
  }
  
  // Set weekdays for weekly recurrence
  if (rule.type === "weekly" && rule.weekdays && rule.weekdays.length > 0) {
    rrule += `;BYDAY=${rule.weekdays.join(',')}`;
  }
  
  // Set monthly options
  if (rule.type === "monthly" && rule.monthlyOption) {
    if (rule.monthlyOption === "dayOfMonth") {
      rrule += `;BYMONTHDAY=${startDate.getDate()}`;
    } else if (rule.monthlyOption === "dayOfWeek") {
      const weekNum = Math.ceil(startDate.getDate() / 7);
      const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][startDate.getDay()];
      rrule += `;BYDAY=${weekNum}${dayOfWeek}`;
    }
  }
  
  // Set end condition
  if (rule.endType === "afterDate" && rule.endDate) {
    rrule += `;UNTIL=${rule.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  } else if (rule.endType === "afterOccurrences" && rule.occurrences) {
    rrule += `;COUNT=${rule.occurrences}`;
  }
  
  return rrule;
};

// Helper to parse RRule string from Google Calendar
const parseRRuleString = (rruleString: string): RecurrenceRule => {
  const rule: RecurrenceRule = {
    type: "weekly",
    interval: 1,
    exceptionDates: [],
    endType: "never" // Default value
  };
  
  // Remove the RRULE: prefix
  const rrule = rruleString.replace("RRULE:", "");
  
  // Split the components
  const parts = rrule.split(';');
  
  // Process each part
  parts.forEach((part) => {
    const [key, value] = part.split('=');
    
    switch (key) {
      case "FREQ":
        if (value === "DAILY") rule.type = "daily";
        else if (value === "WEEKLY") rule.type = "weekly";
        else if (value === "MONTHLY") rule.type = "monthly";
        else rule.type = "custom";
        break;
      case "INTERVAL":
        rule.interval = parseInt(value);
        break;
      case "BYDAY":
        rule.weekdays = value.split(',');
        break;
      case "BYMONTHDAY":
        rule.monthlyOption = "dayOfMonth";
        break;
      case "UNTIL":
        // Parse the date format YYYYMMDDTHHMMSSZ
        const year = parseInt(value.substring(0, 4));
        const month = parseInt(value.substring(4, 6)) - 1; // 0-based month
        const day = parseInt(value.substring(6, 8));
        rule.endType = "afterDate";
        rule.endDate = new Date(year, month, day);
        break;
      case "COUNT":
        rule.endType = "afterOccurrences";
        rule.occurrences = parseInt(value);
        break;
    }
  });
  
  return rule;
};

// Convert a booking to a Google Calendar event
export const convertBookingToGoogleEvent = (booking: Booking): GoogleCalendarEvent => {
  const event: GoogleCalendarEvent = {
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
  
  // Add recurrence if booking is recurring
  if (booking.isRecurring) {
    if (booking.recurrencePattern && typeof booking.recurrencePattern === 'object') {
      // If it's an advanced recurrence pattern object
      const startDate = new Date(booking.start);
      const rrule = generateRRuleString(booking.recurrencePattern as RecurrenceRule, startDate);
      event.recurrence = [rrule];
      
      // Store exception dates in extended properties
      if (booking.recurrencePattern.exceptionDates?.length > 0) {
        if (!event.extendedProperties) {
          event.extendedProperties = { private: {} };
        }
        if (!event.extendedProperties.private) {
          event.extendedProperties.private = {};
        }
        event.extendedProperties.private.exceptionDates = JSON.stringify(
          booking.recurrencePattern.exceptionDates
        );
      }
    } else if (booking.recurrencePattern && typeof booking.recurrencePattern === 'string') {
      // Simple recurrence pattern as string
      event.recurrence = [`RRULE:FREQ=${booking.recurrencePattern.toUpperCase()}`];
    }
  }
  
  // Add extended properties for equipment and catering
  if (booking.equipment || booking.cateringRequested !== undefined) {
    if (!event.extendedProperties) {
      event.extendedProperties = { private: {} };
    }
    
    if (booking.equipment) {
      event.extendedProperties.private!.equipment = booking.equipment.join(',');
    }
    
    if (booking.cateringRequested !== undefined) {
      event.extendedProperties.private!.cateringRequested = booking.cateringRequested.toString();
    }
  }
  
  return event;
};

// Convert a Google Calendar event to a booking
export const convertGoogleEventToBooking = (event: GoogleCalendarEvent): Booking => {
  // Parse equipment and catering from extended properties
  const equipment = event.extendedProperties?.private?.equipment
    ? event.extendedProperties.private.equipment.split(',')
    : undefined;
    
  const cateringRequested = event.extendedProperties?.private?.cateringRequested
    ? event.extendedProperties.private.cateringRequested === 'true'
    : false;
    
  // Check if event has recurrence
  const isRecurring = !!event.recurrence && event.recurrence.length > 0;
  let recurrencePattern: string | RecurrenceRule | undefined = undefined;
  
  if (isRecurring && event.recurrence[0].startsWith('RRULE:')) {
    // Parse advanced recurrence rule
    recurrencePattern = parseRRuleString(event.recurrence[0]);
    
    // Parse exception dates if they exist
    if (event.extendedProperties?.private?.exceptionDates) {
      try {
        const exceptionDates = JSON.parse(event.extendedProperties.private.exceptionDates);
        recurrencePattern.exceptionDates = exceptionDates.map((date: string) => new Date(date));
      } catch (e) {
        console.error("Error parsing exception dates", e);
        recurrencePattern.exceptionDates = [];
      }
    }
  } else if (isRecurring && event.recurrence[0].startsWith('RRULE:FREQ=')) {
    // Parse simple recurrence pattern
    const frequencyPattern = event.recurrence[0].split('=')[1].toLowerCase();
    recurrencePattern = frequencyPattern;
  }
  
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
    equipment,
    cateringRequested,
    isRecurring,
    recurrencePattern
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
