
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Zap, Sun } from "lucide-react";
import { RoomFilters } from "../RoomFilters";

interface QuickAvailabilityFilterProps {
  filters: RoomFilters;
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
}

export function QuickAvailabilityFilter({ filters, updateFilters }: QuickAvailabilityFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center space-x-2">
        <Switch
          id="available-now"
          checked={filters.availableNow}
          onCheckedChange={(checked) => updateFilters({ 
            availableNow: checked, 
            availableToday: false,
            availableDate: checked ? new Date() : filters.availableDate
          })}
        />
        <Label htmlFor="available-now" className="flex items-center cursor-pointer">
          <Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
          Available Now
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="available-today"
          checked={filters.availableToday}
          onCheckedChange={(checked) => updateFilters({ 
            availableToday: checked, 
            availableNow: false,
            availableDate: checked ? new Date() : filters.availableDate
          })}
        />
        <Label htmlFor="available-today" className="flex items-center cursor-pointer">
          <Sun className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
          Available Today
        </Label>
      </div>
    </div>
  );
}
