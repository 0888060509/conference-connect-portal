
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MapPin, Repeat, AlertCircle } from "lucide-react";
import { RecurringMeetingSetup, RecurrencePattern } from "@/components/calendar/RecurringMeetingSetup";
import { ConflictResolutionDialog } from "@/components/calendar/ConflictResolutionDialog";
import { 
  Booking, 
  BookingPriority,
  ConflictSuggestion,
  checkBookingConflicts,
  generateRoomSuggestions,
  generateTimeSuggestions,
  canOverrideBooking
} from "@/services/conflictResolutionService";
import { useNotifications } from "@/contexts/NotificationContext";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
  date: Date;
  startTime?: string;
  endTime?: string;
}

// Mock bookings data for conflict checking
const mockBookings: Booking[] = [
  {
    id: "booking-1",
    roomId: "1",
    title: "Team Meeting",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    userId: "user-1",
    priority: "normal"
  },
  {
    id: "booking-2",
    roomId: "2",
    title: "Project Review",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    userId: "user-2",
    priority: "high"
  }
];

// Mock rooms data for suggestions
const mockRooms = [
  { id: "1", name: "Executive Boardroom" },
  { id: "2", name: "Conference Room Alpha" },
  { id: "3", name: "Small Meeting Room" },
  { id: "4", name: "Innovation Lab" }
];

export function BookingModal({ 
  isOpen, 
  onClose, 
  room, 
  date, 
  startTime = "09:00", 
  endTime = "10:00" 
}: BookingModalProps) {
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState(startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(endTime);
  const [attendees, setAttendees] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [priority, setPriority] = useState<BookingPriority>("normal");
  
  // New state for conflict resolution
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictedBooking, setConflictedBooking] = useState<Booking | null>(null);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [timeSuggestions, setTimeSuggestions] = useState<ConflictSuggestion[]>([]);
  const [roomSuggestions, setRoomSuggestions] = useState<ConflictSuggestion[]>([]);
  const [canOverride, setCanOverride] = useState(false);
  
  const { sendNotification } = useNotifications();

  const timeOptions = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert start and end times to Date objects
    const [startHour, startMinute] = selectedStartTime.split(":").map(Number);
    const [endHour, endMinute] = selectedEndTime.split(":").map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    // Create booking object
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      roomId: room.id.toString(),
      title: bookingTitle,
      start: startDate,
      end: endDate,
      userId: "current-user", // In a real app, get from auth context
      priority: priority,
      isRecurring: isRecurring
    };
    
    // Check for conflicts with existing bookings
    const conflicts = checkBookingConflicts(newBooking, mockBookings);
    
    if (conflicts.length > 0) {
      // Get the first conflicting booking
      const conflict = conflicts[0];
      
      // Generate alternative suggestions
      const timeAlternatives = generateTimeSuggestions(newBooking, mockBookings, room.id.toString());
      const roomAlternatives = generateRoomSuggestions(newBooking, mockRooms, mockBookings);
      
      // Check if this booking can override the existing one
      const canOverrideExisting = canOverrideBooking(newBooking, conflict);
      
      // Set conflict resolution state
      setConflictedBooking(newBooking);
      setExistingBooking(conflict);
      setTimeSuggestions(timeAlternatives);
      setRoomSuggestions(roomAlternatives);
      setCanOverride(canOverrideExisting);
      
      // Open conflict resolution dialog
      setIsConflictDialogOpen(true);
      
      return;
    }
    
    // If no conflicts, proceed with booking
    completeBooking(newBooking);
  };

  const completeBooking = (booking: Booking) => {
    // Handle booking submission logic here
    console.log({
      roomId: booking.roomId,
      date: format(booking.start, "yyyy-MM-dd"),
      startTime: format(booking.start, "HH:mm"),
      endTime: format(booking.end, "HH:mm"),
      title: booking.title,
      description: bookingDescription,
      attendees: attendees.split(",").map(a => a.trim()),
      isRecurring,
      recurrencePattern,
      priority: booking.priority
    });
    
    // Show success notification
    sendNotification(
      "booking_confirmation",
      "Booking Confirmed",
      `Your booking for ${room.name} has been confirmed.`,
      ["in_app", "email"]
    );
    
    // Close the modal
    onClose();
  };

  const handleRecurrencePatternChange = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
  };

  const handleConflictResolutionComplete = () => {
    // This would handle the result of conflict resolution
    // For demo purposes, we'll just close the dialog
    setIsConflictDialogOpen(false);
    
    // In a real app, you would take different actions based on the resolution
    sendNotification(
      "booking_modification",
      "Conflict Resolved",
      "Your booking conflict has been resolved.",
      ["in_app"]
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Meeting Room</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted/20 p-3 rounded-md space-y-2">
              <div className="flex items-center">
                <div className="font-medium">{room.name}</div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {room.location}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                Capacity: {room.capacity} people
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(date, "EEEE, MMMM d, yyyy")}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select 
                  value={selectedStartTime} 
                  onValueChange={setSelectedStartTime}
                >
                  <SelectTrigger id="start-time" className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Select 
                  value={selectedEndTime} 
                  onValueChange={setSelectedEndTime}
                >
                  <SelectTrigger id="end-time" className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                        disabled={time <= selectedStartTime}
                      >{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-title">Meeting Title *</Label>
              <Input
                id="booking-title"
                placeholder="Enter meeting title"
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="booking-description">Description</Label>
              <Textarea
                id="booking-description"
                placeholder="Enter meeting description"
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (comma separated)</Label>
              <Input
                id="attendees"
                placeholder="john@example.com, jane@example.com"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>
            
            {/* New priority selector */}
            <div className="space-y-2">
              <Label htmlFor="priority">Booking Priority</Label>
              <Select 
                value={priority} 
                onValueChange={(value: BookingPriority) => setPriority(value)}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher priority bookings may override lower priority bookings in case of conflicts.
              </p>
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                id="recurring"
              />
              <Label htmlFor="recurring" className="flex items-center cursor-pointer">
                <Repeat className="h-4 w-4 mr-2" />
                Set up recurring meeting
              </Label>
            </div>
            
            <RecurringMeetingSetup
              startDate={date}
              startTime={selectedStartTime}
              endTime={selectedEndTime}
              roomId={room.id.toString()}
              onPatternChange={handleRecurrencePatternChange}
              isEnabled={isRecurring}
              existingBookings={[]} // In a real app, you'd fetch existing bookings
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Book Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Conflict Resolution Dialog */}
      {conflictedBooking && existingBooking && (
        <ConflictResolutionDialog
          isOpen={isConflictDialogOpen}
          onClose={() => setIsConflictDialogOpen(false)}
          conflictedBooking={conflictedBooking}
          existingBooking={existingBooking}
          timeSuggestions={timeSuggestions}
          roomSuggestions={roomSuggestions}
          canOverride={canOverride}
          onResolutionComplete={handleConflictResolutionComplete}
        />
      )}
    </>
  );
}
