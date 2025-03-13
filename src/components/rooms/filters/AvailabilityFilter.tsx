
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { RoomFilters } from "../RoomFilters";

interface AvailabilityFilterProps {
  filters: RoomFilters;
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
}

export function AvailabilityFilter({ filters, updateFilters }: AvailabilityFilterProps) {
  return (
    <div className="space-y-2">
      <Label>Availability</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filters.availableDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.availableDate ? (
                format(filters.availableDate, "PPP")
              ) : (
                "Pick a date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.availableDate}
              onSelect={(date) => updateFilters({ 
                availableDate: date,
                availableNow: false,
                availableToday: false
              })}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="border-t p-3 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ availableDate: undefined })}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => updateFilters({ 
                  availableDate: new Date(),
                  availableToday: true,
                  availableNow: false
                })}
              >
                Today
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Time range if date is selected */}
      {filters.availableDate && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label htmlFor="start-time" className="text-xs">Start Time</Label>
            <Select
              value={filters.availableTimeStart || ""}
              onValueChange={(value) => updateFilters({ availableTimeStart: value })}
            >
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                  <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="end-time" className="text-xs">End Time</Label>
            <Select
              value={filters.availableTimeEnd || ""}
              onValueChange={(value) => updateFilters({ availableTimeEnd: value })}
            >
              <SelectTrigger id="end-time">
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                  <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
