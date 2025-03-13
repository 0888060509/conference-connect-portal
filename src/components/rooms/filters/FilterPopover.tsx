
import { useState } from "react";
import { Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CapacityFilter } from "./CapacityFilter";
import { LocationFilter } from "./LocationFilter";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { QuickAvailabilityFilter } from "./QuickAvailabilityFilter";
import { AmenitiesFilter } from "./AmenitiesFilter";
import { SaveSearchDialog } from "./SaveSearchDialog";
import { RoomFilters } from "../RoomFilters";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";

interface FilterPopoverProps {
  filters: RoomFilters;
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
  clearAllFilters: () => void;
  filtersActive: boolean;
  locations: string[];
  allAmenities: string[];
}

export function FilterPopover({
  filters,
  updateFilters,
  clearAllFilters,
  filtersActive,
  locations,
  allAmenities
}: FilterPopoverProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  // Group amenities by category
  const amenityCategories = {
    "Technology": ["Video Conference", "TV Screen", "Projector", "Whiteboard", "Computers", "Wi-Fi"],
    "Facilities": ["Coffee Machine", "Water Dispenser", "Catering Available", "Air Conditioning"],
    "Setup": ["U-Shape", "Boardroom", "Theater", "Classroom", "Standing"]
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={filtersActive ? "default" : "outline"} 
          size="sm"
          className="w-full sm:w-auto"
        >
          <Sliders className="mr-2 h-4 w-4" />
          Filters
          {filtersActive && (
            <Badge className="ml-2 bg-primary/20 text-primary" variant="outline">
              Active
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-base flex justify-between items-center">
              <span>Filter Rooms</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Capacity slider */}
            <CapacityFilter 
              capacity={filters.capacity} 
              updateFilters={updateFilters} 
            />

            {/* Location dropdown */}
            <LocationFilter 
              location={filters.location} 
              updateFilters={updateFilters} 
              locations={locations} 
            />

            {/* Availability date picker */}
            <AvailabilityFilter 
              filters={filters} 
              updateFilters={updateFilters} 
            />

            {/* Quick availability filters */}
            <QuickAvailabilityFilter 
              filters={filters} 
              updateFilters={updateFilters} 
            />

            {/* Amenities */}
            <AmenitiesFilter 
              amenities={filters.amenities}
              updateFilters={updateFilters}
              amenityCategories={amenityCategories}
              allAmenities={allAmenities}
            />
          </CardContent>
          <CardFooter className="pt-1 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllFilters}
            >
              Reset
            </Button>
            <Button 
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="h-3.5 w-3.5 mr-2" />
              Save Search
            </Button>
          </CardFooter>

          {/* Save search dialog */}
          {saveDialogOpen && (
            <SaveSearchDialog 
              newSearchName={newSearchName}
              setNewSearchName={setNewSearchName}
              onCancel={() => setSaveDialogOpen(false)}
              onSave={() => {
                if (newSearchName.trim()) {
                  // This would be handled in the parent component
                  setSaveDialogOpen(false);
                  setNewSearchName("");
                }
              }}
            />
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
