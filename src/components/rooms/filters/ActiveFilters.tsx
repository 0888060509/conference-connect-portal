
import { 
  Search, 
  Users, 
  Building, 
  CalendarIcon, 
  Zap, 
  Sun, 
  Video, 
  Monitor, 
  Wifi, 
  Coffee, 
  FileText, 
  Check, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RoomFilters } from "../RoomFilters";

interface ActiveFiltersProps {
  filters: RoomFilters;
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
  clearAllFilters: () => void;
}

export function ActiveFilters({ filters, updateFilters, clearAllFilters }: ActiveFiltersProps) {
  // Handler for toggling an amenity
  const toggleAmenity = (amenity: string) => {
    if (filters.amenities.includes(amenity)) {
      updateFilters({ 
        amenities: filters.amenities.filter(a => a !== amenity) 
      });
    } else {
      updateFilters({ 
        amenities: [...filters.amenities, amenity] 
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.search && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Search className="h-3 w-3" />
          "{filters.search}"
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ search: "" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      
      {(filters.capacity[0] > 1 || filters.capacity[1] < 50) && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {filters.capacity[0]}-{filters.capacity[1]} people
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ capacity: [1, 50] })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      
      {filters.location && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Building className="h-3 w-3" />
          {filters.location}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ location: "" })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      
      {filters.availableDate && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {format(filters.availableDate, "MMM d, yyyy")}
          {(filters.availableTimeStart && filters.availableTimeEnd) && (
            <span className="ml-1">
              {filters.availableTimeStart} - {filters.availableTimeEnd}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ 
              availableDate: undefined, 
              availableTimeStart: undefined, 
              availableTimeEnd: undefined 
            })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.availableNow && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-yellow-500" />
          Available Now
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ availableNow: false })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.availableToday && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sun className="h-3 w-3 text-orange-500" />
          Available Today
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => updateFilters({ availableToday: false })}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      
      {filters.amenities.map(amenity => (
        <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
          {amenity.includes("Video") && <Video className="h-3 w-3" />}
          {amenity.includes("TV") && <Monitor className="h-3 w-3" />}
          {amenity.includes("Wi-Fi") && <Wifi className="h-3 w-3" />}
          {amenity.includes("Coffee") && <Coffee className="h-3 w-3" />}
          {amenity.includes("Whiteboard") && <FileText className="h-3 w-3" />}
          {!amenity.includes("Video") && !amenity.includes("TV") && 
           !amenity.includes("Wi-Fi") && !amenity.includes("Coffee") && 
           !amenity.includes("Whiteboard") && <Check className="h-3 w-3" />}
          {amenity}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => toggleAmenity(amenity)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={clearAllFilters}
      >
        Clear All
      </Button>
    </div>
  );
}
