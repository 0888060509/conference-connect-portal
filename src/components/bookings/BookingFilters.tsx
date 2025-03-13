
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatus } from "./PersonalBookings";
import { DateRange } from "react-day-picker";

interface BookingFiltersProps {
  filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    roomId: number | null;
    status: BookingStatus | null;
  };
  onFilterChange: (filters: BookingFiltersProps["filters"]) => void;
}

// Mock rooms data for the filter dropdown
const ROOMS = [
  { id: 1, name: "Conference Room A" },
  { id: 2, name: "Meeting Room 101" },
  { id: 3, name: "Executive Boardroom" },
  { id: 4, name: "Meeting Room 102" },
];

export function BookingFilters({ filters, onFilterChange }: BookingFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: filters.dateRange.from,
    to: filters.dateRange.to,
  });

  // Update parent component when date changes
  useEffect(() => {
    if (date) {
      onFilterChange({
        ...filters,
        dateRange: {
          from: date.from,
          to: date.to
        },
      });
    }
  }, [date]);

  const handleRoomChange = (value: string) => {
    onFilterChange({
      ...filters,
      roomId: value === "all" ? null : Number(value),
    });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === "all" ? null : value as BookingStatus,
    });
  };

  const handleResetFilters = () => {
    setDate({ from: undefined, to: undefined });
    onFilterChange({
      dateRange: { from: undefined, to: undefined },
      roomId: null,
      status: null,
    });
  };

  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Filters</h3>
          <p className="text-xs text-muted-foreground">
            Filter your bookings by date, room, and status
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleResetFilters}
          className="text-xs"
        >
          Reset Filters
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {/* Date Range Filter */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date?.from && !date?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Room Filter */}
        <div>
          <Select 
            value={filters.roomId ? String(filters.roomId) : "all"}
            onValueChange={handleRoomChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {ROOMS.map((room) => (
                <SelectItem key={room.id} value={String(room.id)}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status Filter */}
        <div>
          <Select 
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
