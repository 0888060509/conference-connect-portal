import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingFilters } from "./BookingFilters";
import { BookingsCalendar } from "./BookingsCalendar";
import { BookingDetails } from "./BookingDetails";
import { BookingsList } from "./BookingsList";
import { ResponsiveBookingsList } from "./ResponsiveBookingsList";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Booking {
  id: string;
  title: string;
  description: string;
  roomName: string;
  location: string;
  start: string;
  end: string;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedOut?: boolean;
  checkedOutAt?: string;
  equipment?: string[];
  cateringRequested?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "1",
    title: "Marketing Meeting",
    description: "Discuss Q3 marketing strategy and plan upcoming campaigns.",
    roomName: "Conference Room A",
    location: "2nd Floor",
    start: addDays(new Date(), 1).toISOString(),
    end: new Date(addDays(new Date(), 1).setHours(11, 0, 0, 0)).toISOString(),
    attendees: ["john.doe@example.com", "jane.smith@example.com"],
    status: "upcoming",
    equipment: ["projector", "whiteboard"],
    cateringRequested: false,
    isRecurring: false
  },
  {
    id: "2",
    title: "Sales Training",
    description: "Training session for new sales team members.",
    roomName: "Training Room 1",
    location: "3rd Floor",
    start: new Date().toISOString(),
    end: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    attendees: ["mark.johnson@example.com", "lisa.brown@example.com"],
    status: "ongoing",
    checkedIn: true,
    checkedInAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    equipment: ["projector", "microphone"],
    cateringRequested: true,
    isRecurring: true,
    recurrencePattern: "weekly"
  },
  {
    id: "3",
    title: "Project Kickoff",
    description: "Initial meeting to kick off the new project.",
    roomName: "Meeting Room B",
    location: "2nd Floor",
    start: subDays(new Date(), 2).toISOString(),
    end: subDays(new Date(), 2).setHours(12, 0, 0, 0).toISOString(),
    attendees: ["sarah.jones@example.com", "david.williams@example.com"],
    status: "completed",
  },
  {
    id: "4",
    title: "Client Presentation",
    description: "Presenting the new product to potential clients.",
    roomName: "Presentation Hall",
    location: "1st Floor",
    start: addDays(new Date(), 3).toISOString(),
    end: addDays(new Date(), 3).setHours(16, 0, 0, 0).toISOString(),
    attendees: ["emily.clark@example.com", "kevin.davis@example.com"],
    status: "upcoming",
  },
  {
    id: "5",
    title: "Team Building Activity",
    description: "Off-site team building event.",
    roomName: "Recreation Center",
    location: "Off-site",
    start: addDays(new Date(), 7).toISOString(),
    end: addDays(new Date(), 7).setHours(17, 0, 0, 0).toISOString(),
    attendees: ["all.employees@example.com"],
    status: "upcoming",
  },
  {
    id: "6",
    title: "Board Meeting",
    description: "Monthly board meeting to discuss company performance.",
    roomName: "Board Room",
    location: "4th Floor",
    start: subDays(new Date(), 7).toISOString(),
    end: subDays(new Date(), 7).setHours(12, 0, 0, 0).toISOString(),
    attendees: ["board.members@example.com"],
    status: "completed",
  },
  {
    id: "7",
    title: "Product Demo",
    description: "Demonstration of the latest product features.",
    roomName: "Demo Room",
    location: "1st Floor",
    start: addDays(new Date(), 2).toISOString(),
    end: addDays(new Date(), 2).setHours(15, 0, 0, 0).toISOString(),
    attendees: ["product.team@example.com"],
    status: "upcoming",
  },
  {
    id: "8",
    title: "HR Training",
    description: "Training session on new HR policies.",
    roomName: "Training Room 2",
    location: "3rd Floor",
    start: subDays(new Date(), 1).toISOString(),
    end: subDays(new Date(), 1).setHours(17, 0, 0, 0).toISOString(),
    attendees: ["hr.team@example.com"],
    status: "completed",
  },
  {
    id: "9",
    title: "Customer Feedback Session",
    description: "Gathering feedback from key customers.",
    roomName: "Feedback Room",
    location: "2nd Floor",
    start: addDays(new Date(), 4).toISOString(),
    end: addDays(new Date(), 4).setHours(14, 0, 0, 0).toISOString(),
    attendees: ["customer1@example.com", "customer2@example.com"],
    status: "upcoming",
  },
  {
    id: "10",
    title: "End of Day",
    description: "End of day",
    roomName: "Room 1",
    location: "3rd Floor",
    start: subDays(new Date(), 1).toISOString(),
    end: subDays(new Date(), 1).setHours(17, 0, 0, 0).toISOString(),
    attendees: ["hr.team@example.com"],
    status: "cancelled",
  },
];

export function PersonalBookings() {
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const isMobile = useIsMobile();
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);

  const handleFilterChange = (filter: "upcoming" | "past" | "all") => {
    setActiveFilter(filter);
  };

  const filterBookings = (bookings: Booking[]) => {
    let filtered = [...bookings];

    if (activeFilter === "upcoming") {
      filtered = filtered.filter((booking) => new Date(booking.start) >= new Date() && booking.status !== 'cancelled');
    } else if (activeFilter === "past") {
      filtered = filtered.filter((booking) => new Date(booking.start) < new Date());
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.start);
        return bookingDate >= dateRange.from! && bookingDate <= dateRange.to!;
      });
    }

    return filtered;
  };

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    console.log(`Booking ${bookingId} cancelled with reason: ${reason}`);
  };

  const handleCheckIn = (bookingId: string) => {
    console.log(`Checking in for booking ${bookingId}`);
  };

  const handleCheckOut = (bookingId: string) => {
    console.log(`Checking out for booking ${bookingId}`);
  };

  const handleDuplicateBooking = (bookingId: string) => {
    console.log(`Duplicating booking ${bookingId}`);
  };

  const handleShareBooking = (bookingId: string, method: 'email' | 'calendar') => {
    console.log(`Sharing booking ${bookingId} via ${method}`);
  };

  const handleSetReminder = (bookingId: string, minutes?: number) => {
    console.log(`Setting reminder for booking ${bookingId} ${minutes ? `before ${minutes} minutes` : ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <BookingFilters 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {isMobile ? (
            <ResponsiveBookingsList
              bookings={filterBookings(SAMPLE_BOOKINGS)}
              onCancel={handleCancelBooking}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onDuplicate={handleDuplicateBooking}
              onShare={handleShareBooking}
              onSetReminder={handleSetReminder}
              onViewDetails={(id) => setViewBookingId(id)}
            />
          ) : (
            <BookingsList
              bookings={filterBookings(SAMPLE_BOOKINGS)}
              onCancel={handleCancelBooking}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onDuplicate={handleDuplicateBooking}
              onShare={handleShareBooking}
              onSetReminder={handleSetReminder}
            />
          )}
        </TabsContent>
        <TabsContent value="calendar">
          <BookingsCalendar
            bookings={filterBookings(SAMPLE_BOOKINGS)}
            onCancel={handleCancelBooking}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onDuplicate={handleDuplicateBooking}
            onShare={handleShareBooking}
            onSetReminder={handleSetReminder}
          />
        </TabsContent>
      </Tabs>

      {viewBookingId && (
        <BookingDetails
          bookingId={viewBookingId}
          bookings={SAMPLE_BOOKINGS}
          onClose={() => setViewBookingId(null)}
          onCancel={handleCancelBooking}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onDuplicate={handleDuplicateBooking}
          onShare={handleShareBooking}
          onSetReminder={handleSetReminder}
        />
      )}
    </div>
  );
}
