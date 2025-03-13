
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsList } from "./BookingsList";
import { BookingsCalendar } from "./BookingsCalendar";
import { BookingFilters } from "./BookingFilters";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CalendarRange, List, Plus } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  generateBookingConfirmationEmail,
  generateBookingCancellationEmail,
  generateBookingModificationEmail,
  generateReminderEmail
} from "@/utils/emailTemplates";
import { 
  sendEmailNotification, 
  sendCalendarInvite,
  sendPushNotification,
  scheduleReminder
} from "@/services/NotificationService";

// Booking status types
export type BookingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

// Booking type
export interface Booking {
  id: string;
  title: string;
  description?: string;
  roomId: number;
  roomName: string;
  location: string;
  start: Date;
  end: Date;
  attendees: { id: string; name: string; email: string }[];
  status: BookingStatus;
  isRecurring: boolean;
  recurrencePattern?: string;
  equipment: string[];
  cateringRequested: boolean;
  createdBy: string;
  createdAt: Date;
  checkedIn?: boolean;
  checkedInAt?: Date;
  checkedOut?: boolean;
  checkedOutAt?: Date;
}

// Mock bookings data
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-001",
    title: "Weekly Team Meeting",
    description: "Regular team sync to discuss progress and blockers",
    roomId: 1,
    roomName: "Conference Room A",
    location: "Floor 3",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    attendees: [
      { id: "1", name: "You", email: "you@example.com" },
      { id: "2", name: "John Doe", email: "john@example.com" },
      { id: "3", name: "Jane Smith", email: "jane@example.com" },
    ],
    status: "upcoming",
    isRecurring: true,
    recurrencePattern: "weekly",
    equipment: ["projector", "whiteboard"],
    cateringRequested: false,
    createdBy: "You",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    id: "bk-002",
    title: "Project Kickoff",
    description: "Initial meeting to discuss project scope and timeline",
    roomId: 2,
    roomName: "Meeting Room 101",
    location: "Floor 2",
    start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 30, 0, 0)),
    attendees: [
      { id: "1", name: "You", email: "you@example.com" },
      { id: "4", name: "Michael Johnson", email: "michael@example.com" },
      { id: "5", name: "Sarah Williams", email: "sarah@example.com" },
    ],
    status: "upcoming",
    isRecurring: false,
    equipment: ["projector", "whiteboard", "videoConferencing"],
    cateringRequested: true,
    createdBy: "You",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: "bk-003",
    title: "Client Meeting",
    description: "Meeting with client to present project progress",
    roomId: 3,
    roomName: "Executive Boardroom",
    location: "Floor 5",
    start: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(9, 0, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(10, 0, 0, 0)),
    attendees: [
      { id: "1", name: "You", email: "you@example.com" },
      { id: "6", name: "David Brown", email: "david@example.com" },
    ],
    status: "completed",
    isRecurring: false,
    equipment: ["videoConferencing"],
    cateringRequested: false,
    createdBy: "You",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 9)),
    checkedIn: true,
    checkedInAt: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(8, 55, 0, 0)),
    checkedOut: true,
    checkedOutAt: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(10, 5, 0, 0)),
  },
  {
    id: "bk-004",
    title: "Interview Session",
    description: "Interview with potential candidate",
    roomId: 4,
    roomName: "Meeting Room 102",
    location: "Floor 2",
    start: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(13, 0, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(14, 0, 0, 0)),
    attendees: [
      { id: "1", name: "You", email: "you@example.com" },
      { id: "7", name: "Emma Wilson", email: "emma@example.com" },
    ],
    status: "cancelled",
    isRecurring: false,
    equipment: [],
    cateringRequested: false,
    createdBy: "You",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
];

export function PersonalBookings() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
    roomId: null as number | null,
    status: null as BookingStatus | null,
  });
  
  const { toast } = useToast();
  const { sendNotification } = useNotifications();

  const handleCreateBooking = () => {
    // This would typically open a modal or navigate to the booking creation page
    toast({
      title: "Create Booking",
      description: "This would open the booking creation form",
    });
  };

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    // Find the booking to cancel
    const bookingToCancel = bookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;
    
    // Update booking status to cancelled
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as BookingStatus } 
        : booking
    );
    
    setBookings(updatedBookings);
    setFilteredBookings(applyFilters(updatedBookings, filters));
    
    // Send in-app notification
    await sendNotification(
      'booking_cancellation',
      'Booking Cancelled', 
      `Your booking for ${bookingToCancel.title} has been cancelled.`,
      ['in_app', 'email'],
      '/my-bookings',
      bookingId
    );
    
    // Send email notification
    const emailTemplate = generateBookingCancellationEmail(bookingToCancel, "You", reason);
    
    // In a real app, this would use the actual user's email
    await sendEmailNotification(
      "you@example.com",
      emailTemplate.subject,
      emailTemplate.body
    );
    
    toast({
      title: "Booking Cancelled",
      description: reason ? `Booking has been cancelled. Reason: ${reason}` : "Booking has been cancelled.",
    });
  };

  const handleCheckIn = async (bookingId: string) => {
    // Find the booking to check in
    const bookingToCheckIn = bookings.find(b => b.id === bookingId);
    if (!bookingToCheckIn) return;
    
    // Update booking check-in status
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            checkedIn: true, 
            checkedInAt: new Date(),
            status: 'ongoing' as BookingStatus 
          } 
        : booking
    );
    
    setBookings(updatedBookings);
    setFilteredBookings(applyFilters(updatedBookings, filters));
    
    // Send notification
    await sendNotification(
      'booking_modification',
      'Checked In to Meeting', 
      `You have successfully checked in to ${bookingToCheckIn.title} in ${bookingToCheckIn.roomName}.`,
      ['in_app'],
      '/my-bookings',
      bookingId
    );
    
    toast({
      title: "Checked In",
      description: "You have successfully checked in to your booking",
    });
  };

  const handleCheckOut = async (bookingId: string) => {
    // Find the booking to check out
    const bookingToCheckOut = bookings.find(b => b.id === bookingId);
    if (!bookingToCheckOut) return;
    
    // Update booking check-out status
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            checkedOut: true, 
            checkedOutAt: new Date(),
            status: 'completed' as BookingStatus 
          } 
        : booking
    );
    
    setBookings(updatedBookings);
    setFilteredBookings(applyFilters(updatedBookings, filters));
    
    // Send notification
    await sendNotification(
      'booking_modification',
      'Checked Out from Meeting', 
      `You have successfully checked out from ${bookingToCheckOut.title} in ${bookingToCheckOut.roomName}.`,
      ['in_app'],
      '/my-bookings',
      bookingId
    );
    
    toast({
      title: "Checked Out",
      description: "You have successfully checked out from your booking",
    });
  };

  const handleDuplicateBooking = async (bookingId: string) => {
    // Find the booking to duplicate
    const bookingToDuplicate = bookings.find(b => b.id === bookingId);
    
    if (!bookingToDuplicate) return;
    
    // Create a new booking based on the existing one
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    
    const startHours = bookingToDuplicate.start.getHours();
    const startMinutes = bookingToDuplicate.start.getMinutes();
    const endHours = bookingToDuplicate.end.getHours();
    const endMinutes = bookingToDuplicate.end.getMinutes();
    
    const newStartDate = new Date(nextWeekDate);
    newStartDate.setHours(startHours, startMinutes, 0, 0);
    
    const newEndDate = new Date(nextWeekDate);
    newEndDate.setHours(endHours, endMinutes, 0, 0);
    
    const newBookingId = `bk-${Date.now()}`;
    
    const newBooking: Booking = {
      ...bookingToDuplicate,
      id: newBookingId,
      start: newStartDate,
      end: newEndDate,
      status: 'upcoming',
      createdAt: new Date(),
      checkedIn: undefined,
      checkedInAt: undefined,
      checkedOut: undefined,
      checkedOutAt: undefined,
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    setFilteredBookings(applyFilters(updatedBookings, filters));
    
    // Send notification
    await sendNotification(
      'booking_confirmation',
      'Booking Duplicated', 
      `A new booking has been created based on ${bookingToDuplicate.title}.`,
      ['in_app', 'email', 'calendar'],
      '/my-bookings',
      newBookingId
    );
    
    // Send email notification
    const emailTemplate = generateBookingConfirmationEmail(newBooking, "You");
    
    // In a real app, this would use the actual user's email
    await sendEmailNotification(
      "you@example.com",
      emailTemplate.subject,
      emailTemplate.body
    );
    
    // Add to calendar
    await sendCalendarInvite(
      newBooking,
      newBooking.attendees.map(a => a.email),
      "you@example.com"
    );
    
    toast({
      title: "Booking Duplicated",
      description: "A new booking has been created based on the selected booking",
    });
  };

  const handleShareBooking = async (bookingId: string, method: 'email' | 'calendar') => {
    // Find the booking to share
    const bookingToShare = bookings.find(b => b.id === bookingId);
    if (!bookingToShare) return;
    
    if (method === 'email') {
      // In a real app, this would show a dialog to select recipients
      const emailTemplate = generateBookingConfirmationEmail(bookingToShare, "Colleague");
      
      // Mock sending to a colleague
      await sendEmailNotification(
        "colleague@example.com",
        emailTemplate.subject,
        emailTemplate.body
      );
    } else if (method === 'calendar') {
      // In a real app, this would allow selecting calendar type
      await sendCalendarInvite(
        bookingToShare,
        bookingToShare.attendees.map(a => a.email),
        "you@example.com"
      );
    }
    
    toast({
      title: `Booking Shared via ${method === 'email' ? 'Email' : 'Calendar Invitation'}`,
      description: "Booking details have been shared",
    });
  };

  const handleSetReminder = async (bookingId: string, minutes?: number) => {
    // Find the booking to set reminder for
    const bookingToRemind = bookings.find(b => b.id === bookingId);
    if (!bookingToRemind) return;
    
    const reminderMin = minutes || 15; // Default to 15 minutes if not specified
    
    // Calculate when the reminder should be sent
    const reminderTime = new Date(bookingToRemind.start.getTime() - (reminderMin * 60 * 1000));
    
    // Schedule the reminder
    await scheduleReminder(
      bookingId,
      "1", // User ID
      reminderTime,
      `Reminder: ${bookingToRemind.title}`,
      `Your meeting in ${bookingToRemind.roomName} starts in ${reminderMin} minutes.`,
      ['in_app', 'email', 'push']
    );
    
    // For demo purposes, if the reminder would be in the past, send it immediately
    if (reminderTime < new Date()) {
      await sendNotification(
        'booking_reminder',
        `Reminder: ${bookingToRemind.title}`, 
        `Your meeting in ${bookingToRemind.roomName} is coming up.`,
        ['in_app'],
        '/my-bookings',
        bookingId
      );
      
      // Send email notification
      const emailTemplate = generateReminderEmail(bookingToRemind, "You", reminderMin);
      
      await sendEmailNotification(
        "you@example.com",
        emailTemplate.subject,
        emailTemplate.body
      );
    }
    
    toast({
      title: "Reminder Set",
      description: `You will be reminded ${reminderMin} minutes before the booking`,
    });
  };

  const applyFilters = (bookingList: Booking[], currentFilters: typeof filters) => {
    return bookingList.filter(booking => {
      // Filter by date range
      if (currentFilters.dateRange.from && new Date(booking.start) < currentFilters.dateRange.from) {
        return false;
      }
      if (currentFilters.dateRange.to && new Date(booking.start) > currentFilters.dateRange.to) {
        return false;
      }
      
      // Filter by room
      if (currentFilters.roomId !== null && booking.roomId !== currentFilters.roomId) {
        return false;
      }
      
      // Filter by status
      if (currentFilters.status !== null && booking.status !== currentFilters.status) {
        return false;
      }
      
      return true;
    });
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilteredBookings(applyFilters(bookings, newFilters));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          value={activeView} 
          onValueChange={(value) => setActiveView(value as "list" | "calendar")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleCreateBooking} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Booking
        </Button>
      </div>
      
      <BookingFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <div className="border rounded-lg shadow-sm">
        <Tabs value={activeView} className="w-full">
          <TabsContent value="list" className="m-0">
            <BookingsList 
              bookings={filteredBookings}
              onCancel={handleCancelBooking}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onDuplicate={handleDuplicateBooking}
              onShare={handleShareBooking}
              onSetReminder={handleSetReminder}
            />
          </TabsContent>
          <TabsContent value="calendar" className="m-0">
            <BookingsCalendar 
              bookings={filteredBookings}
              onCancel={handleCancelBooking}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onDuplicate={handleDuplicateBooking}
              onShare={handleShareBooking}
              onSetReminder={handleSetReminder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
