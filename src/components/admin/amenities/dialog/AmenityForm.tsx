
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Amenity, AmenityType } from "@/services/amenities";
import { FormValues, STATUS_OPTIONS } from "./types";
import { AmenityIcon } from "../AmenityIcon";
import { MaintenanceScheduleFields } from "./MaintenanceScheduleFields";

interface AmenityFormProps {
  amenity: Amenity | null;
  amenityTypes: AmenityType[];
  isSubmitting: boolean;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

export function AmenityForm({ 
  amenity, 
  amenityTypes, 
  isSubmitting, 
  onSubmit, 
  onCancel 
}: AmenityFormProps) {
  const form = useForm<FormValues>({
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
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  
  const selectedType = watch("type");
  const selectedStatus = watch("status");
  
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

  return (
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
      
      <MaintenanceScheduleFields form={form} />
      
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
          onClick={onCancel}
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
  );
}
