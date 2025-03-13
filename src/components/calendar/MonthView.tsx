import { useState, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
  isToday
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RoomStatusIndicator } from "./RoomStatusIndicator";

interface Room {
  id: number;
  name: string;
  availability: "available" | "partial" | "booked";
  location: string;
  capacity: number;
}

interface MonthViewProps {
  currentDate: Date;
  rooms: Room[];
  onSelectRoom: (room: Room, date: Date) => void;
}

export function MonthView({ currentDate, rooms, onSelectRoom }: MonthViewProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const allCalendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    setCalendarDays(allCalendarDays);
  }, [currentDate]);

  const getColorForRooms = (day: Date) => {
    const availableCount = rooms.filter(room => room.availability === "available").length;
    const partialCount = rooms.filter(room => room.availability === "partial").length;
    const bookedCount = rooms.filter(room => room.availability === "booked").length;
    
    if (bookedCount === rooms.length) return "booked";
    if (partialCount > 0 || (availableCount > 0 && bookedCount > 0)) return "partial";
    return "available";
  };

  const getRoomStatusForDate = (date: Date) => {
    return getColorForRooms(date);
  };

  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-center py-2 border-b bg-muted/20">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const status = getRoomStatusForDate(day);
              
              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[100px] p-2 relative 
                    ${isCurrentMonth ? "" : "bg-muted/10 text-muted-foreground"}
                    ${isDayToday ? "ring-1 ring-inset ring-accent" : ""}
                    ${dayIndex === 6 ? "" : "border-r"}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm ${isDayToday ? "font-bold" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {isCurrentMonth && (
                      <RoomStatusIndicator status={status} size="sm" />
                    )}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="mt-2 space-y-1">
                      {rooms.slice(0, 2).map((room) => (
                        <HoverCard key={room.id} openDelay={300} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <div 
                              className={`
                                text-xs truncate p-1 rounded-sm flex items-center
                                cursor-pointer hover:bg-muted/50
                                ${room.availability === 'available' ? 'bg-success/10 text-success' : 
                                  room.availability === 'partial' ? 'bg-warning/10 text-warning' : 
                                  'bg-destructive/10 text-destructive'}
                              `}
                              onClick={() => onSelectRoom(room, day)}
                            >
                              <RoomStatusIndicator 
                                status={room.availability} 
                                size="sm" 
                              />
                              <span className="ml-1 truncate">{room.name}</span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-60">
                            <div className="space-y-1">
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground">{room.location}</div>
                              <div className="text-xs">Capacity: {room.capacity} people</div>
                              <div className="flex items-center text-xs">
                                Status: <RoomStatusIndicator status={room.availability} />
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Click to book this room for {format(day, "MMM d, yyyy")}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                      
                      {rooms.length > 2 && (
                        <div 
                          className="text-xs text-center mt-1 text-muted-foreground cursor-pointer hover:underline"
                          onClick={() => {}}
                        >
                          +{rooms.length - 2} more rooms
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
