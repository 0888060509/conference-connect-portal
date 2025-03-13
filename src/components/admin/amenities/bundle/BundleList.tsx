
import { Amenity, AmenityBundle } from "@/services/amenities";
import { BundleCard } from "./BundleCard";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

interface BundleListProps {
  bundles: AmenityBundle[];
  amenities: Amenity[];
  isLoading: boolean;
  onAddBundle: () => void;
  onEditBundle: (bundle: AmenityBundle) => void;
  onDeleteBundle: (bundle: AmenityBundle) => void;
}

export function BundleList({ 
  bundles, 
  amenities, 
  isLoading, 
  onAddBundle, 
  onEditBundle, 
  onDeleteBundle 
}: BundleListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Loading bundles...</p>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-muted/20">
        <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
        <p className="mt-2 text-muted-foreground">No equipment bundles found</p>
        <Button onClick={onAddBundle} className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create Bundle
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bundles.map((bundle) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          amenities={amenities}
          onEdit={onEditBundle}
          onDelete={onDeleteBundle}
        />
      ))}
    </div>
  );
}
