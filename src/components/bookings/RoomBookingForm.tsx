import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Calendar } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingFormData, createBooking } from "@/services/BookingService";
import { useAuth } from "@/contexts/AuthContext";

interface RoomBookingFormProps {
  roomId: string;
  roomName: string;
  onBookingComplete?: (bookingId: string) => void;
  defaultDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export function RoomBookingForm({ 
  roomId, 
  roomName, 
  onBookingComplete,
  defaultDate = new Date(),
  defaultStartTime = "09:00",
  defaultEndTime = "10:00"
}: RoomBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const userId = user?.id || '';

  // Generate time options from 8:00 to 20:00
  const timeOptions = Array.from({ length: 25 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const form = useForm<BookingFormData>({
    defaultValues: {
      roomId,
      title: "",
      description: "",
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      attendees: []
    }
  });

  const handleSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate that end time is after start time
      if (data.startTime >= data.endTime) {
        toast.error("End time must be after start time");
        return;
      }

      const booking = await createBooking(data, userId);
      
      toast.success(`Room ${roomName} booked successfully`);
      
      if (onBookingComplete) {
        onBookingComplete(booking.id);
      }
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="font-medium">{roomName}</div>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting title" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter meeting description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => {
                      const startTime = form.getValues("startTime");
                      return (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={time <= startTime}
                        >
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attendees (emails, comma separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="john@example.com, jane@example.com" 
                  {...field} 
                  onChange={(e) => {
                    const emails = e.target.value.split(",").map(email => email.trim());
                    field.onChange(emails.filter(email => email !== ""));
                  }}
                  value={field.value?.join(", ") || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Room"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
