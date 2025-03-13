
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AmenityIcon } from "./AmenityIcon";
import { Amenity, AmenityType } from "@/types/amenities";
import { createAmenity, updateAmenity } from "@/services/AmenityService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AmenityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity | null;
  amenityTypes: AmenityType[];
  onSuccess: () => void;
}

// Available status options
const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "scheduled", label: "Scheduled Maintenance" },
];

// Maintenance frequency options
const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface FormValues {
  name: string;
  description: string;
  type: string;
  status: "available" | "unavailable" | "maintenance" | "scheduled";
  maintenanceFrequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  nextMaintenanceDate?: string;
  manualUrl?: string;
}

export function AmenityDialog({ 
  open, 
  onOpenChange, 
  amenity, 
  amenityTypes,
  onSuccess 
}: AmenityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      type: "",
      status: "available",
      maintenanceFrequency: undefined,
      nextMaintenanceDate: undefined,
      manualUrl: ""
    }
  });
  
  const selectedType = watch("type");
  const selectedStatus = watch("status");
  const selectedFrequency = watch("maintenanceFrequency");
  
  // Set form values when editing
  useEffect(() => {
    if (amenity) {
      setValue("name", amenity.name);
      setValue("description", amenity.description);
      setValue("type", amenity.type);
      setValue("status", amenity.status);
      setValue("maintenanceFrequency", amenity.maintenanceSchedule?.frequency);
      setValue("nextMaintenanceDate", amenity.maintenanceSchedule?.nextDate);
      setValue("manualUrl", amenity.manualUrl || "");
    } else {
      reset({
        name: "",
        description: "",
        type: amenityTypes.length > 0 ? amenityTypes[0].id : "",
        status: "available"
      });
    }
  }, [amenity, amenityTypes, setValue, reset]);
  
  const onSubmit = async (data: FormValues) => {
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g., Projector XD-3000"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Amenity Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {amenityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <AmenityIcon icon={type.icon} className="mr-2 h-4 w-4" />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Describe this amenity..."
              className="min-h-[80px]"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maintenanceFrequency">Maintenance Schedule (Optional)</Label>
            <Select
              value={selectedFrequency || ""}
              onValueChange={(value) => setValue("maintenanceFrequency", value as any || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No scheduled maintenance</SelectItem>
                {FREQUENCY_OPTIONS.map((frequency) => (
                  <SelectItem key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedFrequency && (
            <div className="space-y-2">
              <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
              <Input
                id="nextMaintenanceDate"
                type="date"
                {...register("nextMaintenanceDate")}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="manualUrl">User Manual URL (Optional)</Label>
            <Input
              id="manualUrl"
              type="url"
              {...register("manualUrl")}
              placeholder="https://example.com/manuals/item.pdf"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : amenity ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
