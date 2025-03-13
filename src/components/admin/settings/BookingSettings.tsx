
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Clock, 
  Calendar, 
  TimerOff, 
  AlertCircle, 
  Save 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const workingDays = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const bookingFormSchema = z.object({
  workingHoursStart: z.string().min(1, "Required"),
  workingHoursEnd: z.string().min(1, "Required"),
  workingDays: z.record(z.string(), z.boolean()).refine(days => {
    return Object.values(days).some(value => value === true);
  }, {
    message: "At least one working day must be selected",
  }),
  minBookingDuration: z.number().min(15, "Minimum 15 minutes"),
  maxBookingDuration: z.number().min(30, "Minimum 30 minutes"),
  advanceBookingMin: z.number().min(0, "Cannot be negative"),
  advanceBookingMax: z.number().min(1, "Minimum 1 day"),
  cancellationNotice: z.number().min(0, "Cannot be negative"),
  restrictedCancellation: z.boolean(),
  autoApproval: z.boolean(),
  requireReason: z.boolean(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingSettings() {
  const defaultValues: BookingFormValues = {
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    minBookingDuration: 30,
    maxBookingDuration: 240,
    advanceBookingMin: 0,
    advanceBookingMax: 90,
    cancellationNotice: 24,
    restrictedCancellation: true,
    autoApproval: true,
    requireReason: true,
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  });

  function onSubmit(data: BookingFormValues) {
    console.log("Booking settings saved:", data);
    toast({
      title: "Settings saved",
      description: "Your booking settings have been updated successfully.",
    });
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Working Hours & Days</CardTitle>
              </div>
              <CardDescription>
                Configure when rooms can be booked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workingHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Working Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {workingDays.map((day) => (
                    <FormField
                      key={day.id}
                      control={form.control}
                      name={`workingDays.${day.id}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Booking Duration Rules</CardTitle>
              </div>
              <CardDescription>
                Set minimum and maximum booking duration limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minBookingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={15}
                          step={15}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Shortest allowed booking time (e.g., 30 minutes)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxBookingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={30}
                          step={30}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Longest allowed booking time (e.g., 240 minutes)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Advance Booking Rules</CardTitle>
              </div>
              <CardDescription>
                Control how far in advance bookings can be made
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="advanceBookingMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Advance Time (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum time before a booking (0 for immediate bookings)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="advanceBookingMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Advance Time (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        How far in advance bookings can be made
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <TimerOff className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Cancellation Policy</CardTitle>
              </div>
              <CardDescription>
                Define rules for booking cancellations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="cancellationNotice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Notice (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      How many hours in advance users must cancel (0 for anytime)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="restrictedCancellation"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">
                        Restrict late cancellations
                      </FormLabel>
                      <FormDescription>
                        Only admins can cancel bookings after the notice period
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Additional Options</CardTitle>
              </div>
              <CardDescription>
                Configure other booking behavior settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="autoApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">
                        Auto-approve bookings
                      </FormLabel>
                      <FormDescription>
                        Automatically approve bookings without admin review
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requireReason"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">
                        Require booking reason
                      </FormLabel>
                      <FormDescription>
                        Users must provide a reason for all bookings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="min-w-[150px]">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
