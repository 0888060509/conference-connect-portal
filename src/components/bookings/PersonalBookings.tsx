
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsList } from "./BookingsList";
import { BookingsCalendar } from "./BookingsCalendar";
import { BookingFilters } from "./BookingFilters";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CalendarRange, List, Plus } from "lucide-react";

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
    start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0),
    end: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 30, 0, 0),
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
    start: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(9, 0, 0, 0),
    end: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(10, 0, 0, 0),
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
    checkedInAt: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(8, 55, 0, 0),
    checkedOut: true,
    checkedOutAt: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(10, 5, 0, 0),
  },
  {
    id: "bk-004",
    title: "Interview Session",
    description: "Interview with potential candidate",
    roomId: 4,
    roomName: "Meeting Room 102",
    location: "Floor 2",
    start: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(13, 0, 0, 0),
    end: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(14, 0, 0, 0),
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

  const handleCreateBooking = () => {
    // This would typically open a modal or navigate to the booking creation page
    toast({
      title: "Create Booking",
      description: "This would open the booking creation form",
    });
  };

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    // Update booking status to cancelled
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as BookingStatus } 
        : booking
    );
    
    setBookings(updatedBookings);
    setFilteredBookings(applyFilters(updatedBookings, filters));
    
    toast({
      title: "Booking Cancelled",
      description: reason ? `Booking has been cancelled. Reason: ${reason}` : "Booking has been cancelled.",
    });
  };

  const handleCheckIn = (bookingId: string) => {
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
    
    toast({
      title: "Checked In",
      description: "You have successfully checked in to your booking",
    });
  };

  const handleCheckOut = (bookingId: string) => {
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
    
    toast({
      title: "Checked Out",
      description: "You have successfully checked out from your booking",
    });
  };

  const handleDuplicateBooking = (bookingId: string) => {
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
    
    const newBooking: Booking = {
      ...bookingToDuplicate,
      id: `bk-${Date.now()}`, // Generate a new ID
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
    
    toast({
      title: "Booking Duplicated",
      description: "A new booking has been created based on the selected booking",
    });
  };

  const handleShareBooking = (bookingId: string, method: 'email' | 'calendar') => {
    // This would typically integrate with email or calendar services
    toast({
      title: `Booking Shared via ${method === 'email' ? 'Email' : 'Calendar Invitation'}`,
      description: "Booking details have been shared",
    });
  };

  const handleSetReminder = (bookingId: string, minutes?: number) => {
    const reminderMin = minutes || 15; // Default to 15 minutes if not specified
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
