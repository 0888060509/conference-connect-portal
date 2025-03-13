
import { useState, useRef } from "react";
import { format, addMonths, subMonths, addDays, subDays, addWeeks, subWeeks, isSameDay } from "date-fns";
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

// Sample room data
const rooms = [
  {
    id: 1,
    name: "Executive Boardroom",
    location: "3rd Floor, Building A",
    capacity: 14,
    equipment: ["Video Conferencing", "Whiteboard", "Projector"],
    availability: "available" as const, // Using 'as const' to ensure type is "available"
  },
  {
    id: 2,
    name: "Innovation Lab",
    location: "2nd Floor, Building B",
    capacity: 8,
    equipment: ["Whiteboards", "LCD Screens", "Video Conferencing"],
    availability: "partial" as const, // Using 'as const' to ensure type is "partial"
  },
  {
    id: 3,
    name: "Conference Room 101",
    location: "1st Floor, Building A",
    capacity: 20,
    equipment: ["Projector", "Video Conferencing"],
    availability: "booked" as const, // Using 'as const' to ensure type is "booked"
  },
  {
    id: 4,
    name: "Meeting Room A",
    location: "4th Floor, Building C",
    capacity: 6,
    equipment: ["TV", "Whiteboard"],
    availability: "available" as const, // Using 'as const' to ensure type is "available"
  },
  {
    id: 5,
    name: "Meeting Room B",
    location: "4th Floor, Building C",
    capacity: 6,
    equipment: ["TV", "Whiteboard"],
    availability: "partial" as const, // Using 'as const' to ensure type is "partial"
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

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Rooms to display based on selection
  const displayRooms = selectedRooms.length > 0 
    ? rooms.filter(room => selectedRooms.includes(room.id))
    : rooms;

  // Handling navigation
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

  // Handle room selection for booking
  const handleRoomSelect = (room: any, date: Date, startTime?: string, endTime?: string) => {
    setSelectedRoom(room);
    setSelectedSlot({ date, startTime, endTime });
    setBookingModalOpen(true);
  };

  // Get view title based on current view and date
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

  // Toggle room selection
  const toggleRoomSelection = (roomId: number) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  return (
    <div className="flex h-full">
      {/* Room Sidebar */}
      <RoomSidebar 
        rooms={filteredRooms}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedRooms={selectedRooms}
        onRoomToggle={toggleRoomSelection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Calendar Area */}
      <div className="flex-1 ml-0 transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div 
              className="font-medium text-lg cursor-pointer"
              onClick={() => setDatePickerOpen(true)}
            >
              {getViewTitle()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
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
          </div>
        </div>

        <div className="bg-card rounded-md border shadow">
          {selectedView === "month" && (
            <MonthView 
              currentDate={currentDate} 
              rooms={displayRooms} 
              onSelectRoom={handleRoomSelect}
            />
          )}
          {selectedView === "week" && (
            <WeekView 
              currentDate={currentDate} 
              rooms={displayRooms} 
              onSelectRoom={handleRoomSelect}
            />
          )}
          {selectedView === "day" && (
            <DayView 
              currentDate={currentDate} 
              rooms={displayRooms} 
              onSelectRoom={handleRoomSelect}
            />
          )}
          {selectedView === "timeline" && (
            <TimelineView 
              currentDate={currentDate} 
              rooms={displayRooms} 
              onSelectRoom={handleRoomSelect}
            />
          )}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="text-sm font-medium">Room Status:</div>
          <div className="flex items-center gap-2">
            <RoomStatusIndicator status="available" label="Available" />
            <RoomStatusIndicator status="partial" label="Partially Booked" />
            <RoomStatusIndicator status="booked" label="Fully Booked" />
          </div>
        </div>
      </div>

      {/* Date Picker Dialog */}
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

      {/* Booking Modal */}
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
