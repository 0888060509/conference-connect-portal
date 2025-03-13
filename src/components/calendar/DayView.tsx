
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

interface DayViewProps {
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

// Hours and half-hours to display (8 AM to 7:30 PM)
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

export function DayView({ currentDate, rooms, onSelectRoom }: DayViewProps) {
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isToday = isSameDay(currentDate, new Date());

  useEffect(() => {
    // Set current time indicator position
    if (isToday) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = 8 * 60; // 8 AM in minutes
      const timePosition = minutes - startMinutes;
      setCurrentTimePosition(timePosition);

      // Scroll to current time with offset
      if (timelineRef.current) {
        const scrollPosition = (timePosition / 5) - 100; // Adjust as needed
        timelineRef.current.scrollTop = Math.max(0, scrollPosition);
      }

      // Update time indicator every minute
      const interval = setInterval(() => {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = 8 * 60;
        const timePosition = minutes - startMinutes;
        setCurrentTimePosition(timePosition);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentDate, isToday]);

  // Check if a room has a booking at a specific time
  const getBookingForTimeSlot = (roomId: number, timeSlot: string) => {
    const [hour, minute] = timeSlot.split(":").map(Number);
    const slotDate = new Date(currentDate);
    slotDate.setHours(hour, minute, 0, 0);
    
    const slotEndDate = new Date(slotDate);
    slotEndDate.setMinutes(slotEndDate.getMinutes() + 30);

    return SAMPLE_BOOKINGS.find(booking => 
      booking.roomId === roomId &&
      isSameDay(booking.start, currentDate) &&
      booking.start < slotEndDate &&
      booking.end > slotDate
    );
  };

  // Format time for display (e.g., "8:00" -> "8:00 AM")
  const formatTimeDisplay = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute === 0 ? "00" : minute} ${period}`;
  };

  // Calculate the height of a booking based on its duration
  const getBookingHeight = (start: Date, end: Date) => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const durationMinutes = endMinutes - startMinutes;
    return (durationMinutes / 30) * 40; // Each 30-min slot is 40px high
  };

  // Calculate the top position of a booking
  const getBookingTopPosition = (start: Date) => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(8, 0, 0, 0); // 8 AM
    
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const dayStartMinutes = 8 * 60; // 8 AM in minutes
    
    return ((startMinutes - dayStartMinutes) / 30) * 40; // Each 30-min slot is 40px high
  };

  return (
    <div className="w-full" style={{ height: "calc(100vh - 200px)" }}>
      <div className="flex h-full">
        {/* Room names column */}
        <div className="w-48 border-r shrink-0">
          <div className="h-10 border-b"></div> {/* Empty header cell */}
          <div className="overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
            {rooms.map((room) => (
              <div 
                key={room.id}
                className="h-20 border-b p-2 flex flex-col justify-center"
              >
                <div className="font-medium text-sm truncate">{room.name}</div>
                <div className="text-xs text-muted-foreground truncate">{room.location}</div>
                <div className="flex items-center mt-1">
                  <RoomStatusIndicator status={room.availability} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-hidden">
          {/* Time header */}
          <div className="flex h-10 border-b">
            {TIME_SLOTS.map((timeSlot, index) => (
              index % 2 === 0 && (
                <div 
                  key={timeSlot}
                  className="w-20 shrink-0 text-xs text-center text-muted-foreground border-r"
                >
                  {formatTimeDisplay(timeSlot)}
                </div>
              )
            ))}
          </div>
          
          {/* Scrollable timeline */}
          <div 
            ref={timelineRef}
            className="overflow-y-auto relative"
            style={{ height: "calc(100% - 40px)" }}
          >
            {/* Current time indicator */}
            {isToday && (
              <div 
                className="absolute h-0.5 bg-accent z-20 left-0 right-0"
                style={{ 
                  top: `${currentTimePosition / 5}px`
                }}
              />
            )}
            
            {/* Room timelines */}
            {rooms.map((room) => (
              <div 
                key={room.id}
                className="flex border-b h-20 relative"
              >
                {/* Time slots */}
                {TIME_SLOTS.map((timeSlot, index) => {
                  const booking = getBookingForTimeSlot(room.id, timeSlot);
                  const isHalfHour = index % 2 !== 0;
                  
                  return (
                    <div 
                      key={`${room.id}-${timeSlot}`}
                      className={`
                        w-10 shrink-0 h-full cursor-pointer relative
                        ${isHalfHour ? "" : "border-r"}
                        hover:bg-muted/30
                      `}
                      onClick={() => {
                        const [hour, minute] = timeSlot.split(":").map(Number);
                        const endHour = minute === 30 ? hour + 1 : hour;
                        const endMinute = minute === 30 ? "00" : "30";
                        
                        onSelectRoom(
                          room,
                          currentDate,
                          timeSlot,
                          `${endHour}:${endMinute}`
                        );
                      }}
                    >
                      {/* Render the booking only once at its start time */}
                      {booking && timeSlot === format(booking.start, "H:mm") && (
                        <div 
                          className="absolute z-10 bg-secondary text-white rounded-sm px-2 overflow-hidden"
                          style={{ 
                            top: 0,
                            height: `${getBookingHeight(booking.start, booking.end)}px`,
                            width: `${40 * (getBookingHeight(booking.start, booking.end) / 40)}px`,
                            zIndex: 15
                          }}
                        >
                          <div className="text-xs font-medium truncate">{booking.title}</div>
                          <div className="text-xs truncate">{booking.organizer}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
