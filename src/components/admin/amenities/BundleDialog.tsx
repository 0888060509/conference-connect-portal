
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MultiSelect } from "./MultiSelect";
import { 
  createAmenityBundle, 
  updateAmenityBundle,
  AmenityBundle,
  Amenity
} from "@/services/amenities";
import { Package, Loader2 } from "lucide-react";

interface BundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: AmenityBundle | null;
  amenities: Amenity[];
  onSuccess: () => void;
}

export function BundleDialog({ 
  open, 
  onOpenChange, 
  bundle, 
  amenities,
  onSuccess 
}: BundleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("package");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when bundle changes
  useEffect(() => {
    if (bundle) {
      setName(bundle.name);
      setDescription(bundle.description);
      setIcon(bundle.icon);
      setSelectedAmenities(bundle.amenityIds);
    } else {
      setName("");
      setDescription("");
      setIcon("package");
      setSelectedAmenities([]);
    }
  }, [bundle]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the bundle.",
        variant: "destructive"
      });
      return;
    }

    if (selectedAmenities.length === 0) {
      toast({
        title: "No amenities selected",
        description: "Please select at least one amenity for the bundle.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (bundle) {
        // Update existing bundle
        await updateAmenityBundle(bundle.id, {
          name,
          description,
          icon,
          amenityIds: selectedAmenities
        });
        toast({
          title: "Bundle updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        // Create new bundle
        await createAmenityBundle({
          name,
          description,
          icon,
          amenityIds: selectedAmenities
        });
        toast({
          title: "Bundle created",
          description: `${name} has been created successfully.`
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the bundle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{bundle ? 'Edit Bundle' : 'Create Bundle'}</DialogTitle>
          <DialogDescription>
            {bundle 
              ? 'Update the properties of this equipment bundle.'
              : 'Create a new bundle of equipment that can be assigned to rooms.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Bundle Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Conference Room Essentials"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Essential equipment for standard conference rooms"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="package"
            />
            <p className="text-sm text-muted-foreground">
              Use a valid Lucide icon name (e.g., package, presentation, video)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label>Included Amenities</Label>
            <MultiSelect
              options={amenities.map(a => ({ value: a.id, label: a.name }))}
              selected={selectedAmenities}
              onChange={setSelectedAmenities}
              placeholder="Select amenities to include"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {bundle ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
