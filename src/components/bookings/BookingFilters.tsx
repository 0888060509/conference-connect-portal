
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
  activeFilter: "upcoming" | "past" | "all";
  onFilterChange: (filter: "upcoming" | "past" | "all") => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

// Mock rooms data for the filter dropdown
const ROOMS = [
  { id: 1, name: "Conference Room A" },
  { id: 2, name: "Meeting Room 101" },
  { id: 3, name: "Executive Boardroom" },
  { id: 4, name: "Meeting Room 102" },
];

export function BookingFilters({ 
  activeFilter, 
  onFilterChange, 
  dateRange, 
  onDateRangeChange 
}: BookingFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(dateRange);

  // Update parent component when date changes
  useEffect(() => {
    onDateRangeChange(date);
  }, [date, onDateRangeChange]);

  const handleResetFilters = () => {
    setDate(undefined);
    onFilterChange("all");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
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
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex gap-1">
        <Button 
          variant={activeFilter === "upcoming" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("upcoming")}
        >
          Upcoming
        </Button>
        <Button 
          variant={activeFilter === "past" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("past")}
        >
          Past
        </Button>
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange("all")}
        >
          All
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleResetFilters}
        className="text-xs"
      >
        Reset
      </Button>
    </div>
  );
}
