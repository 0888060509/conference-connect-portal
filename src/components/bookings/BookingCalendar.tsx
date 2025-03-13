
import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
const ROOMS = ["Executive Boardroom", "Innovation Lab", "Meeting Room 101", "Conference Room A"];

// Sample bookings data
const BOOKINGS = [
  {
    id: 1,
    title: "Team Standup",
    room: "Executive Boardroom",
    startTime: new Date(new Date().setHours(9, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0)),
    organizer: "John Doe",
  },
  {
    id: 2,
    title: "Project Kickoff",
    room: "Innovation Lab",
    startTime: new Date(new Date().setHours(13, 0, 0)),
    endTime: new Date(new Date().setHours(14, 30, 0)),
    organizer: "Jane Smith",
  },
  {
    id: 3,
    title: "Client Meeting",
    room: "Meeting Room 101",
    startTime: new Date(addDays(new Date().setHours(10, 0, 0), 1)),
    endTime: new Date(addDays(new Date().setHours(11, 0, 0), 1)),
    organizer: "Mike Johnson",
  },
];

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");
  
  // Get days of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const previousDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, -1));
  };

  const nextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };

  const isBookingAt = (room: string, hour: number, date: Date) => {
    return BOOKINGS.find(booking => (
      booking.room === room &&
      isSameDay(booking.startTime, date) &&
      booking.startTime.getHours() <= hour &&
      booking.endTime.getHours() > hour
    ));
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            {view === "day" ? format(currentDate, "EEEE, MMMM d, yyyy") : "Week View"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center mr-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-r-none",
                  view === "day" && "bg-muted"
                )}
                onClick={() => setView("day")}
              >
                Day
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-l-none",
                  view === "week" && "bg-muted"
                )}
                onClick={() => setView("week")}
              >
                Week
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={previousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Calendar Header */}
            <div className="grid grid-cols-[120px_repeat(1,1fr)] border-b">
              <div className="py-2 px-3 font-medium text-muted-foreground">
                Room / Time
              </div>
              {view === "day" ? (
                <div className="py-2 px-3 text-center font-medium">
                  {format(currentDate, "EEEE")}
                </div>
              ) : (
                weekDays.map((day, i) => (
                  <div key={i} className="py-2 px-3 text-center font-medium">
                    {format(day, "EEE d")}
                  </div>
                ))
              )}
            </div>
            
            {/* Calendar Body */}
            {ROOMS.map((room) => (
              <div key={room} className="grid grid-cols-[120px_repeat(1,1fr)] border-b last:border-b-0">
                <div className="py-2 px-3 font-medium border-r">
                  {room}
                </div>
                <div className="grid grid-rows-12 border-r">
                  {HOURS.map((hour) => {
                    const booking = isBookingAt(room, hour, currentDate);
                    return (
                      <div 
                        key={hour} 
                        className={cn(
                          "h-12 border-b last:border-b-0 p-1",
                          booking ? "bg-secondary/10" : "hover:bg-muted/50 cursor-pointer"
                        )}
                      >
                        {booking && (
                          <div className="bg-secondary text-white px-2 py-1 rounded text-xs h-full flex flex-col justify-between">
                            <div className="font-medium">{booking.title}</div>
                            <div className="text-xs opacity-90">{booking.organizer}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
