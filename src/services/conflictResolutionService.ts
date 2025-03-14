
import { useNotifications } from "@/contexts/NotificationContext";

export type BookingPriority = "low" | "normal" | "high" | "critical";

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  priority: BookingPriority;
  department?: string;
  isRecurring?: boolean;
}

export interface ConflictSuggestion {
  type: "time" | "room";
  roomId?: string;
  roomName?: string;
  startTime?: string;
  endTime?: string;
  date?: Date;
}

export interface ConflictResolution {
  id: string;
  conflictId: string;
  resolution: "override" | "waitlist" | "suggestion-accepted" | "cancelled" | "rescheduled";
  resolvedBy: string;
  resolvedAt: Date;
  notes?: string;
}

// Check if two bookings conflict (time overlap)
export const doBookingsConflict = (booking1: Booking, booking2: Booking): boolean => {
  return booking1.roomId === booking2.roomId && 
    booking1.start < booking2.end && 
    booking1.end > booking2.start;
};

// Check if a booking conflicts with any in a list
export const checkBookingConflicts = (
  newBooking: Booking, 
  existingBookings: Booking[]
): Booking[] => {
  return existingBookings.filter(booking => doBookingsConflict(newBooking, booking));
};

// Generate alternative time suggestions
export const generateTimeSuggestions = (
  conflictedBooking: Booking,
  existingBookings: Booking[],
  roomId: string
): ConflictSuggestion[] => {
  const suggestions: ConflictSuggestion[] = [];
  const duration = conflictedBooking.end.getTime() - conflictedBooking.start.getTime();
  
  // Try earlier time slots
  const earlierStart = new Date(conflictedBooking.start.getTime() - duration);
  const earlierEnd = new Date(conflictedBooking.start);
  
  const earlierBooking: Booking = {
    ...conflictedBooking,
    start: earlierStart,
    end: earlierEnd
  };
  
  if (earlierStart.getHours() >= 8 && checkBookingConflicts(earlierBooking, existingBookings).length === 0) {
    suggestions.push({
      type: "time",
      roomId: roomId,
      startTime: formatTime(earlierStart),
      endTime: formatTime(earlierEnd),
      date: new Date(earlierStart)
    });
  }
  
  // Try later time slots
  const laterStart = new Date(conflictedBooking.end);
  const laterEnd = new Date(conflictedBooking.end.getTime() + duration);
  
  const laterBooking: Booking = {
    ...conflictedBooking,
    start: laterStart,
    end: laterEnd
  };
  
  if (laterEnd.getHours() <= 19 && checkBookingConflicts(laterBooking, existingBookings).length === 0) {
    suggestions.push({
      type: "time",
      roomId: roomId,
      startTime: formatTime(laterStart),
      endTime: formatTime(laterEnd),
      date: new Date(laterStart)
    });
  }
  
  return suggestions;
};

// Generate alternative room suggestions
export const generateRoomSuggestions = (
  conflictedBooking: Booking,
  availableRooms: { id: string; name: string }[],
  allBookings: Booking[]
): ConflictSuggestion[] => {
  const suggestions: ConflictSuggestion[] = [];
  
  for (const room of availableRooms) {
    if (room.id === conflictedBooking.roomId) continue;
    
    const roomBookings = allBookings.filter(booking => booking.roomId === room.id);
    const testBooking = { ...conflictedBooking, roomId: room.id };
    
    if (checkBookingConflicts(testBooking, roomBookings).length === 0) {
      suggestions.push({
        type: "room",
        roomId: room.id,
        roomName: room.name,
        startTime: formatTime(conflictedBooking.start),
        endTime: formatTime(conflictedBooking.end),
        date: new Date(conflictedBooking.start)
      });
    }
  }
  
  return suggestions;
};

// Add a booking to waitlist
export const addToWaitlist = async (booking: Booking): Promise<string> => {
  // In a real application, this would call an API
  console.log("Adding to waitlist:", booking);
  
  // Mock implementation returns a waitlist ID
  return `waitlist-${Date.now()}`;
};

// Process priority rules to determine if a booking can override another
export const canOverrideBooking = (newBooking: Booking, existingBooking: Booking): boolean => {
  // Priority-based override
  const priorityValues: Record<BookingPriority, number> = {
    low: 1,
    normal: 2,
    high: 3, 
    critical: 4
  };
  
  return priorityValues[newBooking.priority] > priorityValues[existingBooking.priority];
};

// Log conflict resolution for audit trail
export const logConflictResolution = (resolution: ConflictResolution): void => {
  // In a real app, this would store to a database
  console.log("Conflict resolution logged:", resolution);
};

// Notify affected users about conflict
export const notifyAffectedUsers = async (
  conflictedBooking: Booking, 
  resolution: string,
  affectedUserIds: string[]
): Promise<void> => {
  // In a real app, this would send actual notifications
  console.log(`Notifying affected users (${affectedUserIds.join(", ")}) about conflict resolution: ${resolution}`);
};

// Helper function to format time for display
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${hour12}:${minutesStr} ${ampm}`;
};

// Get a list of automated conflict prevention rules
export const getConflictPreventionRules = (): string[] => {
  return [
    "High-priority bookings take precedence over low-priority bookings",
    "Recurring meetings take precedence over one-time meetings",
    "Executive team bookings take precedence over other departments",
    "Bookings with external participants take precedence over internal-only meetings",
    "Meetings with more participants take precedence over those with fewer participants"
  ];
};
