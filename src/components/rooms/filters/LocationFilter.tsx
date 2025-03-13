
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoomFilters } from "../RoomFilters";

interface LocationFilterProps {
  location: string;
  locations: string[];
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
}

export function LocationFilter({ location, locations, updateFilters }: LocationFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Select
        value={location}
        onValueChange={(value) => updateFilters({ location: value })}
      >
        <SelectTrigger id="location" className="w-full">
          <SelectValue placeholder="Any location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any location</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
