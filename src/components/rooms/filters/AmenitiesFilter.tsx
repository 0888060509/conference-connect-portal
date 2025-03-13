
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomFilters } from "../RoomFilters";

interface AmenitiesFilterProps {
  amenities: string[];
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
  amenityCategories: Record<string, string[]>;
  allAmenities: string[];
}

export function AmenitiesFilter({ 
  amenities, 
  updateFilters, 
  amenityCategories,
  allAmenities 
}: AmenitiesFilterProps) {
  // Toggle an amenity selection
  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      updateFilters({ 
        amenities: amenities.filter(a => a !== amenity) 
      });
    } else {
      updateFilters({ 
        amenities: [...amenities, amenity] 
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-base">Amenities</Label>
      
      {Object.entries(amenityCategories).map(([category, categoryAmenities]) => (
        <div key={category} className="mt-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {categoryAmenities
              .filter(amenity => allAmenities.includes(amenity))
              .map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`amenity-${amenity}`}
                    checked={amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label 
                    htmlFor={`amenity-${amenity}`} 
                    className="text-sm cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
