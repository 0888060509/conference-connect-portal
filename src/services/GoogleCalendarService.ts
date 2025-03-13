import { RRule, RRuleSet, rrulestr } from 'rrule'
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';

// Scopes for Google Calendar API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Function to generate the URL for Google OAuth2 authentication
export function getGoogleAuthURL(clientId: string, redirectUri: string, state: string) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    '',
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: state
  });

  return authUrl;
}

// Function to get Google OAuth2 tokens from the authorization code
export async function getGoogleOAuth2Tokens(clientId: string, clientSecret: string, redirectUri: string, code: string) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error: any) {
    console.error("Failed to retrieve access token", error);
    throw new Error(error.message);
  }
}

// Function to create a Google Calendar event
export async function createGoogleCalendarEvent(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  booking: any
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: booking.title,
    location: booking.location,
    description: booking.description,
    start: {
      dateTime: booking.startTime,
      timeZone: booking.timeZone,
    },
    end: {
      dateTime: booking.endTime,
      timeZone: booking.timeZone,
    },
    recurrence: [
      createRecurrenceRule(booking)
    ],
    attendees: booking.attendees ? booking.attendees.map((email: string) => ({ email })) : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('Event created: %s', response.data.htmlLink);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create event", error);
    throw new Error(error.message);
  }
}

// Function to update a Google Calendar event
export async function updateGoogleCalendarEvent(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  eventId: string,
  booking: any
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: booking.title,
    location: booking.location,
    description: booking.description,
    start: {
      dateTime: booking.startTime,
      timeZone: booking.timeZone,
    },
    end: {
      dateTime: booking.endTime,
      timeZone: booking.timeZone,
    },
    recurrence: [
      createRecurrenceRule(booking)
    ],
    attendees: booking.attendees ? booking.attendees.map((email: string) => ({ email })) : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });

    console.log('Event updated: %s', response.data.htmlLink);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update event", error);
    throw new Error(error.message);
  }
}

// Function to delete a Google Calendar event
export async function deleteGoogleCalendarEvent(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  eventId: string
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log('Event deleted');
    return true;
  } catch (error: any) {
    console.error("Failed to delete event", error);
    throw new Error(error.message);
  }
}

// Function to list events from a Google Calendar
export async function listGoogleCalendarEvents(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  timeMin: string,
  timeMax: string,
  q?: string
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      q: q,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    if (!events || events.length === 0) {
      console.log('No events found.');
      return [];
    }
    console.log('Upcoming events:');
    events.map((event: any, i: number) => {
      const start = event.start.dateTime || event.start.date;
      console.log(`${start} - ${event.summary}`);
    });
    return events;
  } catch (error: any) {
    console.error("Failed to list events", error);
    throw new Error(error.message);
  }
}

// Function to watch for changes on a calendar
export async function watchGoogleCalendar(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  channelId: string,
  webhookUrl: string
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const watchParams = {
    calendarId: 'primary',
    requestBody: {
      id: channelId, // Your channel ID
      type: 'web_hook',
      address: webhookUrl, // Your webhook URL
    },
  };

  try {
    const response = await calendar.events.watch(watchParams);
    console.log('Watching calendar with channel ID: %s', channelId);
    return response.data;
  } catch (error: any) {
    console.error("Failed to watch calendar", error);
    throw new Error(error.message);
  }
}

// Function to stop watching a calendar
export async function stopGoogleCalendarWatch(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  channelId: string,
  resourceId: string
) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.channels.stop({
      requestBody: {
        id: channelId, // The channel ID you want to stop
        resourceId: resourceId, // The resource ID of the channel
      },
    });
    console.log('Stopped watching calendar channel ID: %s', channelId);
    return true;
  } catch (error: any) {
    console.error("Failed to stop watching calendar", error);
    throw new Error(error.message);
  }
}

// Helper function to parse days of week from array to RRule format
const parseDaysOfWeek = (daysOfWeek: string[]) => {
  return daysOfWeek.map(day => {
    switch (day) {
      case "SU": return RRule.SU;
      case "MO": return RRule.MO;
      case "TU": return RRule.TU;
      case "WE": return RRule.WE;
      case "TH": return RRule.TH;
      case "FR": return RRule.FR;
      case "SA": return RRule.SA;
      default: return null;
    }
  }).filter(day => day !== null);
};

// Helper function to create a recurrence rule string based on the booking details
const createRecurrenceRule = (booking: any): string => {
  if (!booking.recurrencePattern) {
    return ""; // Return empty string if no recurrence pattern
  }
  
  // Fix for lines ~175, ~183: Add null checks
  if (booking.recurrencePattern && booking.recurrencePattern.type === "weekly") {
    const weeklyRule = new RRule({
      freq: RRule.WEEKLY,
      interval: booking.recurrencePattern ? booking.recurrencePattern.interval : 1,
      byweekday: parseDaysOfWeek(booking.recurrencePattern.daysOfWeek),
      until: new Date(booking.recurrenceEndDate)
    });
    
    return weeklyRule.toString();
  }
  
  if (booking.recurrencePattern && booking.recurrencePattern.type === "monthly") {
    // Monthly recurrence logic here
    let monthlyRule;
    if (booking.recurrencePattern.monthlyType === 'byDayOfMonth') {
      // Monthly by day of the month
      monthlyRule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: new Date(booking.startTime),
        interval: booking.recurrencePattern ? booking.recurrencePattern.interval : 1,
        bymonthday: [new Date(booking.startTime).getDate()],
        until: new Date(booking.recurrenceEndDate)
      });
    } else {
      // Monthly by day of the week
      const dayOfWeek = new Date(booking.startTime).getDay();
      const weekNumber = Math.floor((new Date(booking.startTime).getDate() - 1) / 7) + 1;
      
      const byweekday: any = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU][dayOfWeek];
      
      monthlyRule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: new Date(booking.startTime),
        interval: booking.recurrencePattern ? booking.recurrencePattern.interval : 1,
        byweekday: byweekday.nth(weekNumber),
        until: new Date(booking.recurrenceEndDate)
      });
    }
    
    return monthlyRule.toString();
  }
  
  // Fix for line ~263: Convert RecurrenceRule to string
  const rule = new RRule({
    freq: RRule.DAILY,
    interval: booking.recurrencePattern ? booking.recurrencePattern.interval : 1,
    until: new Date(booking.recurrenceEndDate)
  });
  
  return rule.toString(); // Ensure we always return a string
};

// Function to fetch all events from a Google Calendar within a specified range
export async function getAllGoogleCalendarEvents(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  tokens: any,
  timeMin: string,
  timeMax: string
): Promise<any[]> {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  let allEvents: any[] = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        pageToken: pageToken,
      });

      const events = response.data.items;
      if (events) {
        allEvents = allEvents.concat(events);
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return allEvents;
  } catch (error: any) {
    console.error("Failed to fetch all events", error);
    throw new Error(error.message);
  }
}
