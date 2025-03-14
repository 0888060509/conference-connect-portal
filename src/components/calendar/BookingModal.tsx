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
import { useCreateBooking, useUserSearch } from "@/hooks/use-calendar-backend";
import { useAuth } from "@/contexts/auth";

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

  // Integration with backend hooks
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();
  const userSearchQuery = useUserSearch(attendees.split(',').pop()?.trim() || '');
  
  // Format attendee IDs for backend
  const getAttendeeIds = (): string[] => {
    return attendees.split(',')
      .map(email => email.trim())
      .filter(Boolean)
      .map(email => {
        // In a real app, you would look up user IDs by email
        // For now, just return placeholder IDs
        return `user-${email}`;
      });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to create a booking');
      return;
    }
    
    // Convert start and end times to Date objects
    const [startHour, startMinute] = selectedStartTime.split(":").map(Number);
    const [endHour, endMinute] = selectedEndTime.split(":").map(Number);
    
    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    // Create booking with backend
    const result = await createBookingMutation.mutateAsync({
      title: bookingTitle,
      description: bookingDescription,
      roomId: room.id.toString(),
      startTime: startDate,
      endTime: endDate,
      recurring: isRecurring ? recurrencePattern! : undefined,
      attendees: getAttendeeIds()
    });
    
    if (result.success) {
      onClose();
    } else if (result.conflicts && result.conflicts.length > 0) {
      // Handle conflicts using the ConflictResolutionDialog
      const conflictedBooking = {
        id: 'new-booking',
        roomId: room.id.toString(),
        title: bookingTitle,
        start: startDate,
        end: endDate,
        userId: user.id,
        priority: priority
      };
      
      setConflictedBooking(conflictedBooking);
      setExistingBooking(result.conflicts[0]);
      
      // Generate suggestions (this would come from the backend in a real app)
      setTimeSuggestions([
        { startTime: '10:00', endTime: '11:00', roomId: room.id.toString(), roomName: room.name },
        { startTime: '11:00', endTime: '12:00', roomId: room.id.toString(), roomName: room.name },
        { startTime: '14:00', endTime: '15:00', roomId: room.id.toString(), roomName: room.name }
      ]);
      
      setRoomSuggestions([
        { startTime: selectedStartTime, endTime: selectedEndTime, roomId: '2', roomName: 'Conference Room Alpha' },
        { startTime: selectedStartTime, endTime: selectedEndTime, roomId: '3', roomName: 'Small Meeting Room' }
      ]);
      
      // Set whether this booking can override based on priority
      setCanOverride(priority === 'high' || priority === 'critical');
      
      // Open conflict dialog
      setIsConflictDialogOpen(true);
    }
  };

  const handleRecurrencePatternChange = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
  };

  const handleConflictResolutionComplete = () => {
    // This would handle the result of conflict resolution
    setIsConflictDialogOpen(false);
    
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
