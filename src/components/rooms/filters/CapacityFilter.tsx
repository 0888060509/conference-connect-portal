
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RoomFilters } from "../RoomFilters";

interface CapacityFilterProps {
  capacity: [number, number];
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
}

export function CapacityFilter({ capacity, updateFilters }: CapacityFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="capacity">Capacity</Label>
        <span className="text-sm text-muted-foreground">
          {capacity[0]} - {capacity[1]} people
        </span>
      </div>
      <Slider
        id="capacity"
        min={1}
        max={50}
        step={1}
        value={capacity}
        onValueChange={(value) => updateFilters({ capacity: value as [number, number] })}
        className="py-2"
      />
    </div>
  );
}
