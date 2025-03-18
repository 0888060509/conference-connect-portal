
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

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

  const timeOptions = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission logic here
    console.log({
      roomId: room.id,
      date: format(date, "yyyy-MM-dd"),
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      title: bookingTitle,
      description: bookingDescription,
      attendees: attendees.split(",").map(a => a.trim())
    });
    
    // Close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
  );
}
