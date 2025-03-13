
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/admin/amenities/MultiSelect";
import { Amenity, AmenityBundle } from "@/types/amenities";
import { createAmenityBundle, updateAmenityBundle } from "@/services/AmenityService";
import { toast } from "@/hooks/use-toast";

interface BundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: AmenityBundle | null;
  amenities: Amenity[];
  onSuccess: () => void;
}

export function BundleDialog({ open, onOpenChange, bundle, amenities, onSuccess }: BundleDialogProps) {
  const [name, setName] = useState(bundle?.name || "");
  const [description, setDescription] = useState(bundle?.description || "");
  const [icon, setIcon] = useState(bundle?.icon || "package");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(bundle?.amenityIds || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Bundle name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedAmenities.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one amenity",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (bundle) {
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
      
      // Reset form
      if (!bundle) {
        setName("");
        setDescription("");
        setIcon("package");
        setSelectedAmenities([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: bundle ? "Failed to update the bundle." : "Failed to create the bundle.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const iconOptions = [
    { value: "package", label: "Package" },
    { value: "presentation", label: "Presentation" },
    { value: "video", label: "Video" },
    { value: "speaker", label: "Audio" },
    { value: "coffee", label: "Coffee" },
    { value: "wifi", label: "Network" },
    { value: "server", label: "Server" }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{bundle ? "Edit Bundle" : "Create Bundle"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bundle Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bundle name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this bundle"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="icon">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Amenities</Label>
            <MultiSelect
              options={amenities.map(a => ({ value: a.id, label: a.name }))}
              selected={selectedAmenities}
              onChange={setSelectedAmenities}
              placeholder="Select amenities"
            />
            <p className="text-sm text-muted-foreground">
              Selected: {selectedAmenities.length} item{selectedAmenities.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : bundle ? "Update Bundle" : "Create Bundle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
