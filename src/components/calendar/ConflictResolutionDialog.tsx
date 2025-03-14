
import { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Clock, 
  MoveRight, 
  Building, 
  UserCheck,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { 
  ConflictSuggestion, 
  Booking, 
  addToWaitlist, 
  logConflictResolution,
  notifyAffectedUsers 
} from "@/services/conflictResolutionService";
import { useNotifications } from "@/contexts/NotificationContext";

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflictedBooking: Booking;
  existingBooking: Booking;
  timeSuggestions: ConflictSuggestion[];
  roomSuggestions: ConflictSuggestion[];
  canOverride: boolean;
  onResolutionComplete: () => void;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  conflictedBooking,
  existingBooking,
  timeSuggestions,
  roomSuggestions,
  canOverride,
  onResolutionComplete
}: ConflictResolutionDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [notifyUsers, setNotifyUsers] = useState<boolean>(true);
  const { sendNotification } = useNotifications();
  
  const handleResolve = async () => {
    // Create conflict resolution record
    const resolution = {
      id: `resolution-${Date.now()}`,
      conflictId: `conflict-${conflictedBooking.id}-${existingBooking.id}`,
      resolution: selectedOption as "override" | "waitlist" | "suggestion-accepted" | "cancelled" | "rescheduled",
      resolvedBy: "current-user-id", // In a real app, get from auth context
      resolvedAt: new Date(),
      notes: notes
    };
    
    // Log for audit trail
    logConflictResolution(resolution);
    
    // Handle different resolution types
    if (selectedOption === "waitlist") {
      await addToWaitlist(conflictedBooking);
      
      if (notifyUsers) {
        sendNotification(
          "booking_conflict",
          "Booking Added to Waitlist",
          `Your booking "${conflictedBooking.title}" has been added to the waitlist for this room.`,
          ["in_app", "email"]
        );
      }
    } else if (selectedOption === "override") {
      if (notifyUsers) {
        // Notify the affected user
        sendNotification(
          "booking_conflict",
          "Booking Has Been Overridden",
          `Your booking "${existingBooking.title}" has been overridden by a higher priority booking.`,
          ["in_app", "email"]
        );
      }
    } else if (selectedOption.startsWith("time-") || selectedOption.startsWith("room-")) {
      if (notifyUsers) {
        sendNotification(
          "booking_conflict",
          "Booking Rescheduled",
          `Your booking "${conflictedBooking.title}" has been rescheduled due to a conflict.`,
          ["in_app", "email"]
        );
      }
    } else if (selectedOption === "cancel") {
      if (notifyUsers) {
        sendNotification(
          "booking_cancellation",
          "Booking Cancelled",
          `Your booking "${conflictedBooking.title}" has been cancelled due to a conflict.`,
          ["in_app", "email"]
        );
      }
    }
    
    // Notify affected users if needed
    if (notifyUsers) {
      await notifyAffectedUsers(
        existingBooking,
        selectedOption,
        [existingBooking.userId]
      );
    }
    
    onResolutionComplete();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Booking Conflict Detected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
            <h3 className="font-medium text-destructive mb-2">Conflict Information</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your booking conflicts with an existing reservation for this room.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Your Booking</h4>
                <div className="text-xs flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(conflictedBooking.start, "MMM d, yyyy")}
                </div>
                <div className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(conflictedBooking.start, "h:mm a")} - {format(conflictedBooking.end, "h:mm a")}
                </div>
                <div className="text-xs flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  Priority: {conflictedBooking.priority}
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Existing Booking</h4>
                <div className="text-xs flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(existingBooking.start, "MMM d, yyyy")}
                </div>
                <div className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(existingBooking.start, "h:mm a")} - {format(existingBooking.end, "h:mm a")}
                </div>
                <div className="text-xs flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  Priority: {existingBooking.priority}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Resolution Options</h3>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
              {/* Waitlist option */}
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="waitlist" id="waitlist" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="waitlist" className="font-medium">
                    Add to Waitlist
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You'll be notified if this room becomes available at your requested time.
                  </p>
                </div>
              </div>
              
              {/* Override option - only if user has permission */}
              {canOverride && (
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="override" id="override" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="override" className="font-medium">
                      Override Existing Booking
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Your booking will take precedence due to higher priority.
                      <AlertTriangle className="h-3.5 w-3.5 inline ml-1 text-amber-500" />
                    </p>
                  </div>
                </div>
              )}
              
              {/* Alternative time suggestions */}
              {timeSuggestions.map((suggestion, index) => (
                <div key={`time-${index}`} className="flex items-start space-x-2">
                  <RadioGroupItem value={`time-${index}`} id={`time-${index}`} className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor={`time-${index}`} className="font-medium">
                      Reschedule to {suggestion.startTime} - {suggestion.endTime}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Same room, different time slot
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Alternative room suggestions */}
              {roomSuggestions.map((suggestion, index) => (
                <div key={`room-${index}`} className="flex items-start space-x-2">
                  <RadioGroupItem value={`room-${index}`} id={`room-${index}`} className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor={`room-${index}`} className="font-medium">
                      Move to {suggestion.roomName}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Same time, different room
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Cancel option */}
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="cancel" id="cancel" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="cancel" className="font-medium">
                    Cancel Your Booking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cancel this booking request entirely.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resolution-notes">Resolution Notes</Label>
            <Textarea 
              id="resolution-notes" 
              placeholder="Add any notes about this conflict resolution..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="notify-users" 
              checked={notifyUsers} 
              onCheckedChange={setNotifyUsers} 
            />
            <Label htmlFor="notify-users">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-1.5" />
                Notify affected users
              </div>
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            disabled={!selectedOption} 
            onClick={handleResolve}
          >
            Resolve Conflict
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
