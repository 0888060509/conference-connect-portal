
import { useEffect, useState, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RoomStatusIndicator } from "./RoomStatusIndicator";

interface Room {
  id: number;
  name: string;
  availability: "available" | "partial" | "booked";
  location: string;
  capacity: number;
}

interface TimelineViewProps {
  currentDate: Date;
  rooms: Room[];
  onSelectRoom: (room: Room, date: Date, startTime: string, endTime: string) => void;
}

// Sample bookings data
const SAMPLE_BOOKINGS = [
  {
    id: 1,
    roomId: 1,
    title: "Executive Meeting",
    organizer: "John Doe",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
  },
  {
    id: 2,
    roomId: 2,
    title: "Project Planning",
    organizer: "Jane Smith",
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 0, 0, 0)),
  },
  {
    id: 3,
    roomId: 3,
    title: "Client Call",
    organizer: "Mike Johnson",
    start: new Date(new Date().setHours(15, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
  },
];

// Hours to display (8 AM to 7 PM)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function TimelineView({ currentDate, rooms, onSelectRoom }: TimelineViewProps) {
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isToday = isSameDay(currentDate, new Date());

  useEffect(() => {
    // Set current time indicator position
    if (isToday) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timePosition = ((hours - 8) * 60 + minutes) * 2; // Each minute is 2px wide
      setCurrentTimePosition(timePosition);

      // Scroll to current time with offset
      if (timelineRef.current) {
        const scrollPosition = timePosition - 300; // Adjust as needed
        timelineRef.current.scrollLeft = Math.max(0, scrollPosition);
      }

      // Update time indicator every minute
      const interval = setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timePosition = ((hours - 8) * 60 + minutes) * 2;
        setCurrentTimePosition(timePosition);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentDate, isToday]);

  // Get the booking data for a specific room and time
  const getBookingData = (roomId: number) => {
    return SAMPLE_BOOKINGS.filter(booking => 
      booking.roomId === roomId && 
      isSameDay(booking.start, currentDate)
    );
  };

  // Get the width and position of a booking based on its time
  const getBookingStyle = (start: Date, end: Date) => {
    const startTime = start.getHours() * 60 + start.getMinutes();
    const endTime = end.getHours() * 60 + end.getMinutes();
    const startPosition = (startTime - 8 * 60) * 2; // 8 AM is the start, each minute is 2px
    const width = (endTime - startTime) * 2;
    
    return {
      left: `${startPosition}px`,
      width: `${width}px`,
    };
  };

  // Format the time for display
  const formatTime = (hour: number) => {
    return hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <div className="w-full h-full pb-4">
      {/* Time header */}
      <div className="flex border-b sticky top-0 z-10 bg-card h-12">
        <div className="w-48 shrink-0 p-2 font-medium border-r">Rooms</div>
        <div className="flex-1 overflow-hidden">
          <div className="flex" style={{ width: `${12 * 60 * 2}px` }}> {/* 12 hours * 60 min * 2px */}
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="border-r text-xs text-center flex-shrink-0"
                style={{ width: "120px" }} // 1 hour = 60 min * 2px = 120px
              >
                {formatTime(hour)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Rooms and timeline */}
      <div className="flex h-full">
        {/* Room names column */}
        <div className="w-48 shrink-0 border-r">
          {rooms.map((room) => (
            <div 
              key={room.id}
              className="h-16 border-b p-2 flex flex-col justify-center"
            >
              <div className="font-medium text-sm truncate">{room.name}</div>
              <div className="text-xs text-muted-foreground truncate">{room.location}</div>
              <div className="flex items-center mt-1">
                <RoomStatusIndicator status={room.availability} size="sm" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-x-auto relative"
        >
          {/* Current time indicator */}
          {isToday && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-20"
              style={{ 
                left: `${currentTimePosition}px`
              }}
            />
          )}
          
          {/* Timeline grid */}
          <div style={{ width: `${12 * 60 * 2}px` }}> {/* 12 hours * 60 min * 2px */}
            {rooms.map((room) => {
              const bookings = getBookingData(room.id);
              
              return (
                <div 
                  key={room.id}
                  className="h-16 border-b relative"
                >
                  {/* Horizontal hour markers */}
                  {HOURS.map((hour) => (
                    <div 
                      key={hour}
                      className="absolute h-full border-r border-muted/40"
                      style={{ left: `${(hour - 8) * 120}px` }}
                    />
                  ))}
                  
                  {/* Half-hour markers */}
                  {HOURS.map((hour) => (
                    <div 
                      key={`${hour}-30`}
                      className="absolute h-full border-r border-muted/20"
                      style={{ left: `${(hour - 8) * 120 + 60}px` }}
                    />
                  ))}
                  
                  {/* Bookings */}
                  {bookings.map((booking) => (
                    <HoverCard key={booking.id} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div 
                          className="absolute h-12 top-2 bg-secondary text-white rounded-sm px-2 z-10 cursor-pointer"
                          style={getBookingStyle(booking.start, booking.end)}
                        >
                          <div className="text-xs font-medium truncate">{booking.title}</div>
                          <div className="text-xs truncate">{booking.organizer}</div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64">
                        <div className="space-y-1">
                          <div className="font-medium">{booking.title}</div>
                          <div className="text-sm">Organized by: {booking.organizer}</div>
                          <div className="text-sm">
                            {format(booking.start, "h:mm a")} - {format(booking.end, "h:mm a")}
                          </div>
                          <div className="text-sm mt-1">{room.name}</div>
                          <div className="text-xs text-muted-foreground">{room.location}</div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  
                  {/* Make entire row clickable for booking */}
                  <div 
                    className="absolute top-0 left-0 right-0 bottom-0 z-0"
                    onClick={() => {
                      // When clicking on the timeline, you might want to determine the time
                      // For simplicity, let's use a default time of 10 AM
                      onSelectRoom(
                        room,
                        currentDate,
                        "10:00",
                        "11:00"
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
