
import { useState, useCallback } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, X } from "lucide-react";

// Room type definition
interface Room {
  id: number;
  name: string;
  number: string;
  location: string;
  capacity: number;
  available: boolean;
  amenities: string[];
  maintenanceSchedule: string;
  photos?: string[];
  description?: string;
}

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  room?: Room;
  onSave?: (room: Room) => void;
}

// Available equipment/amenities options
const EQUIPMENT_OPTIONS = [
  { id: "projector", label: "Projector" },
  { id: "video-conf", label: "Video Conferencing" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "sound-system", label: "Sound System" },
  { id: "tv", label: "TV Screen" },
  { id: "phone", label: "Conference Phone" },
  { id: "wifi", label: "High-speed Wi-Fi" },
  { id: "computer", label: "Computer Workstation" },
  { id: "refreshments", label: "Refreshment Station" },
];

export function RoomFormDialog({ 
  open, 
  onOpenChange, 
  mode, 
  room: initialRoom,
  onSave
}: RoomFormDialogProps) {
  // Define initial state based on mode and provided room
  const defaultRoom: Room = {
    id: mode === "edit" && initialRoom ? initialRoom.id : Date.now(),
    name: "",
    number: "",
    location: "",
    capacity: 0,
    available: true,
    amenities: [],
    maintenanceSchedule: "",
    photos: [],
    description: ""
  };

  const [room, setRoom] = useState<Room>(initialRoom || defaultRoom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploads, setPhotoUploads] = useState<File[]>([]);

  // Handle form field changes
  const handleChange = (field: keyof Room, value: any) => {
    setRoom(prev => ({ ...prev, [field]: value }));
  };

  // Handle equipment/amenities toggle
  const handleEquipmentToggle = (equipment: string) => {
    setRoom(prev => {
      const amenities = prev.amenities.includes(equipment) 
        ? prev.amenities.filter(item => item !== equipment)
        : [...prev.amenities, equipment];
      return { ...prev, amenities };
    });
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPhotoUploads(prev => [...prev, ...newFiles]);
      
      // Process files to get preview URLs
      const newPhotoUrls = newFiles.map(file => URL.createObjectURL(file));
      setRoom(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...newPhotoUrls]
      }));
    }
  };

  // Handle photo removal
  const handleRemovePhoto = (index: number) => {
    setRoom(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
    
    // Also remove from file uploads if it's a new upload
    if (index < photoUploads.length) {
      setPhotoUploads(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!room.name.trim()) throw new Error("Room name is required");
      if (!room.number.trim()) throw new Error("Room number is required");
      if (!room.location.trim()) throw new Error("Location is required");
      if (room.capacity <= 0) throw new Error("Capacity must be greater than 0");
      
      // Simulate API call delay
      setTimeout(() => {
        // Call the onSave callback with the updated room data
        if (onSave) {
          onSave(room);
        } else {
          // If no callback provided, just close the dialog
          onOpenChange(false);
          
          // Show success message
          toast({
            title: mode === "add" ? "Room added" : "Room updated",
            description: `The room has been successfully ${mode === "add" ? "added" : "updated"}`,
          });
        }
        
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Room" : "Edit Room"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name *</Label>
                <Input
                  id="room-name"
                  value={room.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Executive Boardroom"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room-number">Room Number *</Label>
                <Input
                  id="room-number"
                  value={room.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="101"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-location">Location *</Label>
              <Input
                id="room-location"
                value={room.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="1st Floor, Building A"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Maximum Capacity *</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  min="1"
                  value={room.capacity.toString()}
                  onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 0)}
                  placeholder="10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room-availability">Availability Status</Label>
                <Select 
                  value={room.available ? "available" : "unavailable"} 
                  onValueChange={(value) => handleChange("available", value === "available")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={room.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter room description and notes..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          {/* Equipment & Amenities Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-medium">Equipment & Amenities</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <div key={equipment.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`equipment-${equipment.id}`}
                    checked={room.amenities.includes(equipment.label)}
                    onCheckedChange={() => handleEquipmentToggle(equipment.label)}
                  />
                  <Label
                    htmlFor={`equipment-${equipment.id}`}
                    className="leading-tight"
                  >
                    {equipment.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Maintenance Schedule Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-medium">Maintenance Schedule</h3>
            
            <div className="space-y-2">
              <Label htmlFor="maintenance-schedule">Scheduled Maintenance</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="maintenance-schedule"
                    value={room.maintenanceSchedule}
                    onChange={(e) => handleChange("maintenanceSchedule", e.target.value)}
                    placeholder="e.g., First Monday of every month"
                    className="pr-8"
                  />
                  <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Room Photos Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-medium">Room Photos</h3>
            
            <div className="space-y-3">
              <Label htmlFor="photo-upload">Upload Photos</Label>
              <div className="flex items-center gap-2">
                <Label 
                  htmlFor="photo-upload" 
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-dashed rounded-md border-input hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose files</span>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </Label>
                <div className="text-sm text-muted-foreground">
                  Recommended size: 1200 x 800 pixels
                </div>
              </div>
              
              {room.photos && room.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {room.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-md overflow-hidden border">
                        <img
                          src={photo}
                          alt={`Room photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-90"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : mode === "add" 
                ? 'Add Room' 
                : 'Update Room'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
