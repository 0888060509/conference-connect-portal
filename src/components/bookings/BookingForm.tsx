import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  ChevronRight, 
  Check, 
  Search,
  Utensils,
  Eye,
  RefreshCw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { RecurringMeetingSetup, RecurrencePattern } from "@/components/calendar/RecurringMeetingSetup";

// Sample data (would come from API in a real app)
const rooms = [
  { 
    id: "1", 
    name: "Executive Boardroom", 
    capacity: 14,
    image: "/placeholder.svg",
    equipment: ["Projector", "Whiteboard", "Video Conferencing"]
  },
  { 
    id: "2", 
    name: "Innovation Lab", 
    capacity: 8,
    image: "/placeholder.svg",
    equipment: ["Whiteboard", "Video Conferencing"]
  },
  { 
    id: "3", 
    name: "Meeting Room 101", 
    capacity: 6,
    image: "/placeholder.svg",
    equipment: ["Projector"]
  },
  { 
    id: "4", 
    name: "Conference Room A", 
    capacity: 20,
    image: "/placeholder.svg",
    equipment: ["Projector", "Whiteboard", "Video Conferencing"]
  },
];

const equipmentOptions = [
  { id: "projector", label: "Projector" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "videoConferencing", label: "Video Conferencing" },
  { id: "audioSystem", label: "Audio System" },
  { id: "laptops", label: "Laptops" },
];

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

const durations = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
  { value: "480", label: "Full day (8 hours)" },
];

// Form schema using Zod
const bookingFormSchema = z.object({
  title: z.string().min(3, { message: "Meeting title must be at least 3 characters" }),
  description: z.string().optional(),
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string({ required_error: "Please select a start time" }),
  duration: z.string({ required_error: "Please select a duration" }),
  roomId: z.string({ required_error: "Please select a room" }),
  attendees: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurringEndDate: z.date().optional(),
  recurrencePattern: z.any().optional(), // This will store our RecurrencePattern object
  equipment: z.array(z.string()).optional(),
  cateringRequired: z.boolean().default(false),
  cateringNotes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingForm({ onClose }: { onClose?: () => void }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [bookingReference, setBookingReference] = useState<string>("");
  
  // Initialize form with React Hook Form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      startTime: "",
      duration: "",
      roomId: "",
      attendees: "",
      isRecurring: false,
      equipment: [],
      cateringRequired: false,
      cateringNotes: "",
    },
  });

  // Add state for recurrence pattern
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  
  const watchIsRecurring = form.watch("isRecurring");
  const watchCateringRequired = form.watch("cateringRequired");
  const watchRoomId = form.watch("roomId");
  const selectedRoom = rooms.find(room => room.id === watchRoomId);

  
  // Handle form submission
  const onSubmit = (data: BookingFormValues) => {
    // Simulate check for double booking
    const isDoubleBooked = Math.random() > 0.9; // 10% chance of double booking for demo
    
    if (isDoubleBooked) {
      toast({
        title: "Double Booking Detected",
        description: "This room is already booked for the selected time slot.",
        variant: "destructive"
      });
      return;
    }
    
    if (showPreview) {
      // Generate a random booking reference
      const reference = `BK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setBookingReference(reference);
      
      toast({
        title: "Booking Confirmed!",
        description: `Your booking reference is ${reference}`,
        variant: "default"
      });
      
      // Reset form and close dialog after successful submission
      setTimeout(() => {
        form.reset();
        if (onClose) onClose();
      }, 2000);
    } else {
      setShowPreview(true);
    }

    // If recurring, add the recurrence pattern
    if (data.isRecurring && recurrencePattern) {
      console.log("Recurrence Pattern:", recurrencePattern);
      
      // Add the recurrence pattern to the form data
      data.recurrencePattern = recurrencePattern;
    }
  };
  
  // Navigate between form steps
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
    if (showPreview) {
      setShowPreview(false);
    }
  };

  // Handle recurrence pattern changes
  const handleRecurrencePatternChange = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    form.setValue("recurrencePattern", pattern);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!showPreview ? (
          <Tabs value={`step-${currentStep}`} className="w-full">
            {/* Step indicators */}
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger 
                value="step-1" 
                className={cn(currentStep >= 1 ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : "")}
                onClick={() => setCurrentStep(1)}
              >
                Room & Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="step-2" 
                className={cn(currentStep >= 2 ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : "")}
                onClick={() => setCurrentStep(2)}
              >
                Meeting Details
              </TabsTrigger>
              <TabsTrigger 
                value="step-3" 
                className={cn(currentStep >= 3 ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : "")}
                onClick={() => setCurrentStep(3)}
              >
                Requirements
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Room & Schedule */}
            <TabsContent value="step-1" className="mt-0 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Select Room</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rooms.map((room) => (
                          <div 
                            key={room.id} 
                            className={cn(
                              "flex border rounded-lg p-2 cursor-pointer transition-colors",
                              field.value === room.id 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => {
                              form.setValue("roomId", room.id);
                              form.trigger("roomId");
                            }}
                          >
                            <div className="h-24 w-24 bg-muted mr-3 rounded-md overflow-hidden">
                              <img 
                                src={room.image} 
                                alt={room.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col flex-1 justify-between">
                              <div>
                                <h3 className="font-medium">{room.name}</h3>
                                <div className="flex items-center text-muted-foreground text-sm mt-1">
                                  <Users className="h-3.5 w-3.5 mr-1" />
                                  <span>Capacity: {room.capacity}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {room.equipment.map((item) => (
                                  <span 
                                    key={item} 
                                    className="bg-secondary/50 text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {field.value === room.id && (
                              <div className="self-center">
                                <Check className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                            <Calendar
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
                        <FormLabel>Start Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time">
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {field.value || "Select start time"}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={nextStep} className="bg-primary">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Meeting Details */}
            <TabsContent value="step-2" className="mt-0 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter meeting title" {...field} />
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
                          placeholder="Enter meeting details" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attendees</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Enter email addresses separated by commas" 
                            {...field} 
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <FormDescription>
                        Add attendees by email or search from company directory
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          <div className="flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Make this a recurring meeting
                          </div>
                        </FormLabel>
                        <FormDescription>
                          Set up a recurring schedule for this meeting
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Add our RecurringMeetingSetup component */}
                <RecurringMeetingSetup
                  startDate={form.getValues("date")}
                  startTime={form.getValues("startTime") || ""}
                  endTime={"18:00"} // This should be calculated based on start time + duration
                  roomId={form.getValues("roomId") || ""}
                  onPatternChange={handleRecurrencePatternChange}
                  isEnabled={watchIsRecurring}
                  existingBookings={[]} // In a real app, you'd fetch existing bookings
                />

                {/* Remove the old simple recurring options */}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="button" onClick={nextStep} className="bg-primary">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Step A3: Requirements */}
            <TabsContent value="step-3" className="mt-0 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="equipment"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Equipment Requirements</FormLabel>
                        <FormDescription>
                          Select the equipment needed for this meeting
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {equipmentOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="equipment"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValues, item.id])
                                          : field.onChange(
                                              currentValues.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cateringRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          <div className="flex items-center">
                            <Utensils className="h-4 w-4 mr-2" />
                            Catering Required
                          </div>
                        </FormLabel>
                        <FormDescription>
                          Request food and beverages for your meeting
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {watchCateringRequired && (
                  <FormField
                    control={form.control}
                    name="cateringNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catering Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter catering requirements, allergies, and preferences"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="bg-secondary"
                  onClick={() => form.handleSubmit(onSubmit)()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Booking
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : bookingReference ? (
          <div className="space-y-6 text-center">
            <div className="inline-block mx-auto p-2 bg-green-100 rounded-full">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Booking Confirmed!</h3>
              <p className="text-muted-foreground mt-2">Your booking has been successfully created.</p>
            </div>
            <div className="p-4 border rounded-md bg-muted/20">
              <div className="text-sm text-muted-foreground mb-2">Booking Reference:</div>
              <div className="text-xl font-bold">{bookingReference}</div>
            </div>
            <Button className="mt-4 w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          // Booking preview
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Button 
                type="button" 
                variant="ghost" 
                className="p-0 mr-2" 
                onClick={prevStep}
              >
                <X className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">Booking Preview</h3>
            </div>
          
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold">{form.getValues("title")}</h4>
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{format(form.getValues("date"), "EEEE, MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {form.getValues("startTime")} | {durations.find(d => d.value === form.getValues("duration"))?.label}
                      </span>
                    </div>
                  </div>
                  
                  {selectedRoom && (
                    <div className="flex items-start space-x-3 pt-2 border-t">
                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden">
                        <img 
                          src={selectedRoom.image} 
                          alt={selectedRoom.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{selectedRoom.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          Capacity: {selectedRoom.capacity}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {form.getValues("description") && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-1">Description</div>
                      <p className="text-sm text-muted-foreground">
                        {form.getValues("description")}
                      </p>
                    </div>
                  )}
                  
                  {form.getValues("attendees") && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-1">Attendees</div>
                      <p className="text-sm text-muted-foreground">
                        {form.getValues("attendees")}
                      </p>
                    </div>
                  )}
                  
                  {watchIsRecurring && recurrencePattern && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-1">Recurrence</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        {recurrencePattern.type.charAt(0).toUpperCase() + recurrencePattern.type.slice(1)}
                        {recurrencePattern.endType === "afterDate" && recurrencePattern.endDate && (
                          <span> until {format(recurrencePattern.endDate, "MMMM d, yyyy")}</span>
                        )}
                        {recurrencePattern.endType === "afterOccurrences" && recurrencePattern.occurrences && (
                          <span> for {recurrencePattern.occurrences} occurrences</span>
                        )}
                        {recurrencePattern.exceptionDates.length > 0 && (
                          <span> with {recurrencePattern.exceptionDates.length} exception(s)</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {form.getValues("equipment")?.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-1">Equipment</div>
                      <div className="flex flex-wrap gap-1">
                        {form.getValues("equipment")?.map((eq) => (
                          <span key={eq} className="bg-secondary/50 text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                            {equipmentOptions.find(e => e.id === eq)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {watchCateringRequired && (
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium mb-1">Catering</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Utensils className="h-3.5 w-3.5 mr-1" />
                        <span>Catering requested</span>
                      </div>
                      {form.getValues("cateringNotes") && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {form.getValues("cateringNotes")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Edit Details
              </Button>
              <Button type="submit" className="bg-primary">
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
