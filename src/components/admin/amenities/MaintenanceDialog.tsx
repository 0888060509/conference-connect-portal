
import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Amenity } from "@/types/amenities";
import { addMaintenanceRecord, updateAmenityStatus } from "@/services/AmenityService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Settings, Calendar } from "lucide-react";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity;
  onSuccess: () => void;
}

interface FormValues {
  date: string;
  performedBy: string;
  notes: string;
  scheduleNext: boolean;
  nextDate?: string;
  changeStatus: boolean;
  status?: "available" | "unavailable" | "maintenance" | "scheduled";
}

export function MaintenanceDialog({ 
  open, 
  onOpenChange, 
  amenity, 
  onSuccess 
}: MaintenanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      performedBy: user ? user.name : "",
      notes: "",
      scheduleNext: false,
      changeStatus: true,
      status: "available"
    }
  });
  
  const scheduleNext = watch("scheduleNext");
  const changeStatus = watch("changeStatus");
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Add maintenance record
      await addMaintenanceRecord(amenity.id, {
        date: data.date,
        performedBy: data.performedBy,
        notes: data.notes,
        nextScheduledDate: data.scheduleNext ? data.nextDate : undefined
      });

      // Update status if requested
      if (data.changeStatus && data.status) {
        await updateAmenityStatus(amenity.id, data.status);
      }
      
      toast({
        title: "Maintenance recorded",
        description: "The maintenance record has been added successfully."
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add maintenance record.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Log Maintenance for {amenity.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Maintenance Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="performedBy">Performed By</Label>
            <Input
              id="performedBy"
              {...register("performedBy", { required: "This field is required" })}
              placeholder="Technician name"
            />
            {errors.performedBy && (
              <p className="text-sm text-destructive">{errors.performedBy.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Maintenance Notes</Label>
            <Textarea
              id="notes"
              {...register("notes", { required: "Notes are required" })}
              placeholder="Describe the maintenance performed..."
              className="min-h-[100px]"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="scheduleNext"
              checked={scheduleNext}
              onCheckedChange={(checked) => setValue("scheduleNext", checked as boolean)}
            />
            <Label htmlFor="scheduleNext" className="cursor-pointer">
              Schedule next maintenance
            </Label>
          </div>
          
          {scheduleNext && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="nextDate">Next Maintenance Date</Label>
              <Input
                id="nextDate"
                type="date"
                {...register("nextDate", { 
                  required: scheduleNext ? "Next date is required" : false 
                })}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.nextDate && (
                <p className="text-sm text-destructive">{errors.nextDate.message}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="changeStatus"
              checked={changeStatus}
              onCheckedChange={(checked) => setValue("changeStatus", checked as boolean)}
            />
            <Label htmlFor="changeStatus" className="cursor-pointer">
              Update amenity status
            </Label>
          </div>
          
          {changeStatus && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="status">New Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value as any)}
                defaultValue="available"
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="scheduled">Scheduled Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
              {isSubmitting ? "Saving..." : "Log Maintenance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
