
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Amenity } from "@/services/amenities";
import { createAmenityIssue, updateAmenityStatus } from "@/services/amenities";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { AlertCircle } from "lucide-react";

interface IssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity;
  onSuccess: () => void;
}

interface FormValues {
  description: string;
  priority: "low" | "medium" | "high";
  changeStatus: boolean;
  status?: "unavailable" | "maintenance";
}

export function IssueDialog({ 
  open, 
  onOpenChange, 
  amenity, 
  onSuccess 
}: IssueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      description: "",
      priority: "medium",
      changeStatus: true,
      status: "unavailable"
    }
  });
  
  const changeStatus = watch("changeStatus");
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Report the issue
      await createAmenityIssue({
        amenityId: amenity.id,
        reportedBy: user?.email || "anonymous",
        description: data.description,
        priority: data.priority
      });

      // Update status if requested
      if (data.changeStatus && data.status) {
        await updateAmenityStatus(amenity.id, data.status);
      }
      
      toast({
        title: "Issue reported",
        description: "Your issue has been reported successfully."
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report the issue.",
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
            <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
            Report Issue with {amenity.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Issue Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Describe the issue in detail..."
              className="min-h-[120px]"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high")}
              defaultValue="medium"
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
                defaultValue="unavailable"
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
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
              {isSubmitting ? "Submitting..." : "Report Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
