import { useState, useRef } from "react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameDay } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  List,
  Clock,
  CalendarDays,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RoomSidebar } from "@/components/calendar/RoomSidebar";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { TimelineView } from "@/components/calendar/TimelineView";
import { RoomStatusIndicator } from "@/components/calendar/RoomStatusIndicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DateSelector } from "@/components/calendar/DateSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookingModal } from "@/components/calendar/BookingModal";
import { SwipeableCalendarView } from "@/components/calendar/SwipeableCalendarView";
import { useAuth } from "@/contexts/auth";
import { useRoomAvailability } from "@/hooks/use-calendar-backend";
import { useRealtimeCalendarUpdates } from "@/hooks/use-calendar-backend";
import { useBookingDragDrop } from "@/hooks/use-calendar-backend";
import { toast } from "sonner";

const rooms = [
  {
    id: 1,
    name: "Executive Boardroom",
    location: "3rd Floor, Building A",
    capacity: 14,
    equipment: ["Video Conferencing", "Whiteboard", "Projector"],
    availability: "available" as const,
  },
  {
    id: 2,
    name: "Innovation Lab",
    location: "2nd Floor, Building B",
    capacity: 8,
    equipment: ["Whiteboards", "LCD Screens", "Video Conferencing"],
    availability: "partial" as const,
  },
  {
    id: 3,
    name: "Conference Room 101",
    location: "1st Floor, Building A",
    capacity: 20,
    equipment: ["Projector", "Video Conferencing"],
    availability: "booked" as const,
  },
  {
    id: 4,
    name: "Meeting Room A",
    location: "4th Floor, Building C",
    capacity: 6,
    equipment: ["TV", "Whiteboard"],
    availability: "available" as const,
  },
  {
    id: 5,
    name: "Meeting Room B",
    location: "4th Floor, Building C",
    capacity: 6,
    equipment: ["TV", "Whiteboard"],
    availability: "partial" as const,
  },
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"month" | "week" | "day" | "timeline">("month");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    startTime?: string;
    endTime?: string;
  } | null>(null);

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayRooms = selectedRooms.length > 0 
    ? rooms.filter(room => selectedRooms.includes(room.id))
    : rooms;

  const today = () => setCurrentDate(new Date());

  const navigate = (direction: "prev" | "next") => {
    if (selectedView === "month") {
      direction === "prev" ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(addMonths(currentDate, 1));
    } else if (selectedView === "week") {
      direction === "prev" ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1));
    } else {
      direction === "prev" ? setCurrentDate(subDays(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1));
    }
  };

  const { user } = useAuth();
  const availabilityQuery = useRoomAvailability(
    rooms.map(room => room.id.toString()),
    currentDate
  );
  
  useRealtimeCalendarUpdates(() => {
    availabilityQuery.refetch();
  });
  
  const { 
    updateBookingTime, 
    isUpdating, 
    isDragging 
  } = useBookingDragDrop();

  const handleRoomSelect = (room: any, date: Date, startTime?: string, endTime?: string) => {
    if (!user) {
      toast.error('You must be logged in to book a room');
      return;
    }
    
    setSelectedRoom(room);
    setSelectedSlot({ date, startTime, endTime });
    setBookingModalOpen(true);
  };
  
  const handleBookingMove = (bookingId: string, newStart: Date, newEnd: Date, newRoomId?: string) => {
    if (!user) {
      toast.error('You must be logged in to update a booking');
      return;
    }
    
    updateBookingTime({
      bookingId,
      startTime: newStart,
      endTime: newEnd,
      roomId: newRoomId
    });
  };

  const getViewTitle = () => {
    if (selectedView === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (selectedView === "week") {
      return `Week of ${format(currentDate, "MMM d, yyyy")}`;
    } else if (selectedView === "day") {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    } else {
      return `Timeline View - ${format(currentDate, "MMMM d, yyyy")}`;
    }
  };

  const toggleRoomSelection = (roomId: number) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:relative fixed inset-0 z-30 bg-background transition-all`}>
        <RoomSidebar 
          rooms={filteredRooms}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          selectedRooms={selectedRooms}
          onRoomToggle={toggleRoomSelection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today} className="hidden md:flex">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={today} className="md:hidden px-2">
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
              Rooms
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Tabs 
              value={selectedView} 
              onValueChange={(value) => setSelectedView(value as any)}
              className="hidden md:block"
            >
              <TabsList>
                <TabsTrigger value="month">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="day">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Day
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <List className="h-4 w-4 mr-1" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs 
              value={selectedView} 
              onValueChange={(value) => setSelectedView(value as any)}
              className="md:hidden"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="month" className="px-2">
                  <CalendarDays className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="week" className="px-2">
                  <CalendarDays className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="day" className="px-2">
                  <CalendarDays className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="timeline" className="px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="bg-card rounded-md border shadow">
          <SwipeableCalendarView 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={selectedView}
            title={getViewTitle()}
          >
            {selectedView === "month" && (
              <MonthView 
                currentDate={currentDate} 
                rooms={displayRooms} 
                onSelectRoom={handleRoomSelect}
                availabilityData={availabilityQuery.data || {}}
                onMoveBooking={handleBookingMove}
                isUpdating={isUpdating || isDragging}
              />
            )}
            {selectedView === "week" && (
              <WeekView 
                currentDate={currentDate} 
                rooms={displayRooms} 
                onSelectRoom={handleRoomSelect}
                availabilityData={availabilityQuery.data || {}}
                onMoveBooking={handleBookingMove}
                isUpdating={isUpdating || isDragging}
              />
            )}
            {selectedView === "day" && (
              <DayView 
                currentDate={currentDate} 
                rooms={displayRooms} 
                onSelectRoom={handleRoomSelect}
                availabilityData={availabilityQuery.data || {}}
                onMoveBooking={handleBookingMove}
                isUpdating={isUpdating || isDragging}
              />
            )}
            {selectedView === "timeline" && (
              <TimelineView 
                currentDate={currentDate} 
                rooms={displayRooms} 
                onSelectRoom={handleRoomSelect}
                availabilityData={availabilityQuery.data || {}}
                onMoveBooking={handleBookingMove}
                isUpdating={isUpdating || isDragging}
              />
            )}
          </SwipeableCalendarView>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="text-sm font-medium">Room Status:</div>
          <div className="flex flex-wrap items-center gap-2">
            <RoomStatusIndicator status="available" label="Available" />
            <RoomStatusIndicator status="partial" label="Partially Booked" />
            <RoomStatusIndicator status="booked" label="Fully Booked" />
          </div>
        </div>
      </div>

      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>
          <DateSelector 
            date={currentDate}
            onSelect={(date) => {
              setCurrentDate(date);
              setDatePickerOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {selectedRoom && selectedSlot && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          room={selectedRoom}
          date={selectedSlot.date}
          startTime={selectedSlot.startTime}
          endTime={selectedSlot.endTime}
        />
      )}
    </div>
  );
}
