
import { useEffect, useState } from "react";
import { 
  format, 
  addDays, 
  startOfWeek, 
  isToday,
  isSameDay,
  isWeekend
} from "date-fns";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RoomStatusIndicator } from "./RoomStatusIndicator";

interface Room {
  id: number;
  name: string;
  availability: "available" | "partial" | "booked";
  location: string;
  capacity: number;
}

interface WeekViewProps {
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
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
  },
  {
    id: 2,
    roomId: 2,
    title: "Project Planning",
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 0, 0, 0)),
  },
  {
    id: 3,
    roomId: 3,
    title: "Client Call",
    start: new Date(new Date().setHours(15, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
  },
  {
    id: 4,
    roomId: 1,
    title: "Team Standup",
    start: new Date(addDays(new Date(), 1).setHours(9, 0, 0, 0)),
    end: new Date(addDays(new Date(), 1).setHours(9, 30, 0, 0)),
  },
];

// Hours to display (8 AM to 7 PM)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function WeekView({ currentDate, rooms, onSelectRoom }: WeekViewProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  useEffect(() => {
    // Get the start of the week (Monday) for the current date
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    // Create an array of 7 days starting from weekStart
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    setWeekDays(days);

    // Set current time indicator position
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timePosition = (hours - 8) * 60 + minutes; // 8 AM is our start time
    setCurrentTimePosition(timePosition);

    // Update time indicator every minute
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timePosition = (hours - 8) * 60 + minutes;
      setCurrentTimePosition(timePosition);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

  // Check if a room has a booking at a specific time
  const getBookingForTimeSlot = (roomId: number, day: Date, hour: number) => {
    const dayStart = new Date(day);
    dayStart.setHours(hour, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(hour + 1, 0, 0, 0);

    return SAMPLE_BOOKINGS.find(booking => 
      booking.roomId === roomId &&
      isSameDay(booking.start, day) &&
      booking.start < dayEnd &&
      booking.end > dayStart
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header - Days of Week */}
        <div className="grid grid-cols-[6rem_repeat(7,1fr)] border-b">
          <div className="p-2 font-medium text-muted-foreground border-r">
            Time / Day
          </div>
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`
                p-2 text-center font-medium 
                ${isToday(day) ? "bg-accent/10" : ""}
                ${isWeekend(day) ? "bg-muted/5" : ""}
                ${i < 6 ? "border-r" : ""}
              `}
            >
              <div>{format(day, "EEE")}</div>
              <div className={`text-sm ${isToday(day) ? "font-bold" : ""}`}>
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time Grid */}
        <div>
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[6rem_repeat(7,1fr)] border-b last:border-b-0">
              {/* Time Column */}
              <div className="p-2 text-muted-foreground text-sm border-r">
                {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
              
              {/* Days Columns */}
              {weekDays.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className={`
                    relative h-20 border-r last:border-r-0 
                    ${isToday(day) ? "bg-accent/5" : ""}
                    ${isWeekend(day) ? "bg-muted/5" : ""}
                  `}
                >
                  {/* Current time indicator */}
                  {isToday(day) && hour === new Date().getHours() && (
                    <div 
                      className="absolute w-full h-0.5 bg-accent z-10"
                      style={{ 
                        top: `${(currentTimePosition % 60) / 60 * 100}%`
                      }}
                    />
                  )}
                  
                  {/* Room status cells */}
                  <div className="grid grid-rows-1 gap-1 p-1 h-full">
                    {rooms.map((room) => {
                      const booking = getBookingForTimeSlot(room.id, day, hour);
                      const status = booking ? "booked" : room.availability;
                      
                      return (
                        <HoverCard key={room.id} openDelay={300} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div 
                              className={`
                                h-full rounded-sm cursor-pointer flex items-center justify-center
                                relative overflow-hidden text-xs
                                ${status === 'available' ? 'bg-success/10 hover:bg-success/20' : 
                                  status === 'partial' ? 'bg-warning/10 hover:bg-warning/20' : 
                                  'bg-destructive/10 hover:bg-destructive/20'}
                                ${booking ? 'border border-muted-foreground/20' : ''}
                              `}
                              onClick={() => onSelectRoom(
                                room, 
                                day, 
                                `${hour < 10 ? '0' : ''}${hour}:00`, 
                                `${(hour + 1) < 10 ? '0' : ''}${hour + 1}:00`
                              )}
                            >
                              {booking ? (
                                <div className="font-medium truncate p-1 w-full text-center">
                                  {booking.title}
                                </div>
                              ) : (
                                <RoomStatusIndicator status={status} size="sm" />
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-60">
                            <div className="space-y-1">
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground">{room.location}</div>
                              {booking ? (
                                <>
                                  <div className="font-medium mt-2">Booked</div>
                                  <div className="text-sm">{booking.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(booking.start, "h:mm a")} - {format(booking.end, "h:mm a")}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs mt-2">
                                  Click to book this room for {format(day, "MMM d")} at {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                                </div>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
