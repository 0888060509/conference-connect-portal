
import { useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Booking } from "./PersonalBookings";
import { BookingDetails } from "./BookingDetails";

interface BookingsCalendarProps {
  bookings: Booking[];
  onCancel: (bookingId: string, reason: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onDuplicate: (bookingId: string) => void;
  onShare: (bookingId: string, method: 'email' | 'calendar') => void;
  onSetReminder: (bookingId: string, minutes: number) => void;
}

export function BookingsCalendar({
  bookings,
  onCancel,
  onCheckIn,
  onCheckOut,
  onDuplicate,
  onShare,
  onSetReminder,
}: BookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  
  // Generate week days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Hours to display (8 AM to 7 PM)
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  
  const previousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };
  
  const nextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };
  
  const today = () => {
    setCurrentDate(new Date());
  };
  
  const getBookingsForDateAndHour = (date: Date, hour: number) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start);
      return (
        isSameDay(bookingDate, date) &&
        bookingDate.getHours() <= hour &&
        new Date(booking.end).getHours() > hour
      );
    });
  };
  
  // Status color mapping
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'ongoing': return 'bg-green-100 border-green-300 text-green-700';
      case 'completed': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Calendar Header */}
            <div className="grid grid-cols-[6rem_repeat(7,1fr)] border-b">
              <div className="p-2 font-medium text-muted-foreground">
                Time / Day
              </div>
              {weekDays.map((day, i) => (
                <div key={i} className="p-2 text-center font-medium">
                  <div>{format(day, "EEE")}</div>
                  <div className={`text-sm ${isSameDay(day, new Date()) ? "font-bold" : ""}`}>
                    {format(day, "MMM d")}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Calendar Body */}
            <div>
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[6rem_repeat(7,1fr)] border-b last:border-b-0">
                  <div className="p-2 text-muted-foreground text-sm">
                    {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </div>
                  
                  {weekDays.map((day, dayIndex) => {
                    const dayBookings = getBookingsForDateAndHour(day, hour);
                    
                    return (
                      <div key={dayIndex} className="h-20 border-r last:border-r-0 relative">
                        {dayBookings.length > 0 ? (
                          <div className="p-1 h-full">
                            {dayBookings.map(booking => (
                              <div
                                key={booking.id}
                                className={`
                                  h-full overflow-hidden rounded-sm p-1 text-xs cursor-pointer border
                                  ${getStatusColor(booking.status)}
                                `}
                                onClick={() => setSelectedBookingId(booking.id)}
                              >
                                <div className="font-medium truncate">{booking.title}</div>
                                <div className="truncate">{booking.roomName}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full w-full hover:bg-muted/20"></div>
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
      
      {/* Booking Details Dialog */}
      {selectedBookingId && (
        <BookingDetails
          bookingId={selectedBookingId}
          bookings={bookings}
          onClose={() => setSelectedBookingId(null)}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onSetReminder={onSetReminder}
        />
      )}
    </>
  );
}
