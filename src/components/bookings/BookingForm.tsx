
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample rooms data
const rooms = [
  { id: "1", name: "Executive Boardroom", capacity: 14 },
  { id: "2", name: "Innovation Lab", capacity: 8 },
  { id: "3", name: "Meeting Room 101", capacity: 6 },
  { id: "4", name: "Conference Room A", capacity: 20 },
];

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

export function BookingForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Meeting Title</Label>
              <Input id="title" placeholder="Enter meeting title" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="room">Room</Label>
                <Select>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{room.name}</span>
                          <span className="text-muted-foreground text-xs flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {room.capacity}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Select>
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Select>
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="attendees">Attendees</Label>
              <Input id="attendees" placeholder="Enter email addresses separated by commas" />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter meeting details" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring" />
              <Label htmlFor="recurring" className="font-normal">Make this a recurring meeting</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="notify" defaultChecked />
              <Label htmlFor="notify" className="font-normal">Send notifications to all attendees</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-secondary hover:bg-secondary-light">Create Booking</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
