
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
import { AmenityType } from "@/types/amenities";
import { createAmenityType, updateAmenityType } from "@/services/AmenityService";
import { toast } from "@/hooks/use-toast";
import { 
  Projector, 
  Tv, 
  Video, 
  PenTool, 
  Coffee, 
  Droplet, 
  Speaker, 
  Wifi, 
  Plug, 
  Thermometer,
  Package,
  Presentation
} from "lucide-react";

interface AmenityTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AmenityType | null;
  onSuccess: () => void;
}

// Available icon options
const ICON_OPTIONS = [
  { value: "projector", label: "Projector", icon: Projector },
  { value: "tv", label: "TV Screen", icon: Tv },
  { value: "video", label: "Video Conferencing", icon: Video },
  { value: "pen-tool", label: "Whiteboard", icon: PenTool },
  { value: "coffee", label: "Coffee Machine", icon: Coffee },
  { value: "droplet", label: "Water Dispenser", icon: Droplet },
  { value: "speaker", label: "Sound System", icon: Speaker },
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "plug", label: "Power Outlets", icon: Plug },
  { value: "thermometer", label: "Temperature Control", icon: Thermometer },
  { value: "package", label: "Package", icon: Package },
  { value: "presentation", label: "Presentation", icon: Presentation },
];

export function AmenityTypeDialog({ 
  open, 
  onOpenChange, 
  type, 
  onSuccess 
}: AmenityTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    name: string;
    description: string;
    icon: string;
  }>({
    defaultValues: {
      name: "",
      description: "",
      icon: "projector"
    }
  });
  
  const selectedIcon = watch("icon");
  
  // Set form values when editing
  useEffect(() => {
    if (type) {
      setValue("name", type.name);
      setValue("description", type.description || "");
      setValue("icon", type.icon);
    } else {
      reset({
        name: "",
        description: "",
        icon: "projector"
      });
    }
  }, [type, setValue, reset]);
  
  const onSubmit = async (data: { name: string; description: string; icon: string }) => {
    setIsSubmitting(true);
    
    try {
      if (type) {
        // Update existing type
        await updateAmenityType(type.id, data);
        toast({
          title: "Amenity type updated",
          description: `${data.name} has been updated successfully.`
        });
      } else {
        // Create new type
        await createAmenityType(data);
        toast({
          title: "Amenity type created",
          description: `${data.name} has been added successfully.`
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${type ? "update" : "create"} the amenity type.`,
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
          <DialogTitle>
            {type ? "Edit Amenity Type" : "Add Amenity Type"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g., Projector"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={selectedIcon}
              onValueChange={(value) => setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center">
                      <icon.icon className="mr-2 h-4 w-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 p-4 border rounded-md text-center">
              <AmenityIcon icon={selectedIcon} className="mx-auto h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Icon Preview</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe this amenity type..."
              className="min-h-[80px]"
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
              {isSubmitting ? "Saving..." : type ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
