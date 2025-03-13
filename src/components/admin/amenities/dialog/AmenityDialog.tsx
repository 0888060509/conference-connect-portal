
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { createAmenity, updateAmenity } from "@/services/amenities";
import { toast } from "@/hooks/use-toast";
import { AmenityForm } from "./AmenityForm";
import { AmenityDialogProps, FormValues } from "./types";

export function AmenityDialog({ 
  open, 
  onOpenChange, 
  amenity, 
  amenityTypes,
  onSuccess 
}: AmenityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare maintenanceSchedule if frequency and nextDate are provided
      const maintenanceSchedule = data.maintenanceFrequency && data.nextMaintenanceDate
        ? {
            frequency: data.maintenanceFrequency,
            nextDate: data.nextMaintenanceDate
          }
        : undefined;

      // Get icon from the selected type
      const selectedAmenityType = amenityTypes.find(type => type.id === data.type);
      const icon = selectedAmenityType?.icon || "help-circle";
      
      if (amenity) {
        // Update existing amenity
        await updateAmenity(amenity.id, {
          name: data.name,
          description: data.description,
          type: data.type,
          icon,
          status: data.status,
          maintenanceSchedule,
          manualUrl: data.manualUrl || undefined
        });
        toast({
          title: "Amenity updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Create new amenity
        await createAmenity({
          name: data.name,
          description: data.description,
          type: data.type,
          icon,
          status: data.status,
          roomIds: [],
          maintenanceRecords: [],
          maintenanceSchedule,
          manualUrl: data.manualUrl || undefined
        });
        toast({
          title: "Amenity created",
          description: `${data.name} has been added successfully.`
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${amenity ? "update" : "create"} the amenity.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {amenity ? "Edit Amenity" : "Add Amenity"}
          </DialogTitle>
        </DialogHeader>
        
        <AmenityForm
          amenity={amenity}
          amenityTypes={amenityTypes}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
