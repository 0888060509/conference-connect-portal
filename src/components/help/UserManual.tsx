
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download, Book } from "lucide-react";

export function UserManual() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" /> User Manual
        </CardTitle>
        <CardDescription>
          Comprehensive documentation for all system features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Last updated: May 10, 2023
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Version 2.4.1
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="section-1">
              <AccordionTrigger>1. Introduction</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <h4 className="font-medium">1.1 About the System</h4>
                <p>
                  The Room Booking System is designed to help organizations efficiently manage meeting rooms and resources. 
                  This comprehensive guide explains all features and how to use them effectively.
                </p>
                
                <h4 className="font-medium">1.2 System Requirements</h4>
                <p>
                  The system is web-based and works on all modern browsers. For optimal performance, 
                  we recommend using Chrome, Firefox, Safari, or Edge.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="section-2">
              <AccordionTrigger>2. Getting Started</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <h4 className="font-medium">2.1 Accessing the System</h4>
                <p>
                  Access the system by navigating to your organization's URL and logging in with your credentials.
                </p>
                
                <h4 className="font-medium">2.2 User Interface Overview</h4>
                <p>
                  The interface consists of a sidebar for navigation, a header with notifications and profile options,
                  and the main content area where you'll interact with the system.
                </p>
                
                <h4 className="font-medium">2.3 First-time Setup</h4>
                <p>
                  After logging in for the first time, you'll be prompted to set notification preferences and 
                  verify your profile information.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="section-3">
              <AccordionTrigger>3. Booking Rooms</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <h4 className="font-medium">3.1 Finding Available Rooms</h4>
                <p>
                  Use the search filters to find rooms based on capacity, location, amenities, 
                  and availability for your desired time slot.
                </p>
                
                <h4 className="font-medium">3.2 Making a Reservation</h4>
                <p>
                  Select your preferred room and time, add meeting details, and confirm the booking.
                  You'll receive a confirmation notification and email.
                </p>
                
                <h4 className="font-medium">3.3 Recurring Bookings</h4>
                <p>
                  Set up meetings that repeat daily, weekly, monthly, or on custom schedules. 
                  You can also configure exceptions for holidays or special dates.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="section-4">
              <AccordionTrigger>4. Managing Bookings</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <h4 className="font-medium">4.1 Viewing Your Bookings</h4>
                <p>
                  Access the "My Bookings" section to see all your upcoming and past reservations. 
                  Use the calendar view for a visual representation of your schedule.
                </p>
                
                <h4 className="font-medium">4.2 Modifying Bookings</h4>
                <p>
                  Edit booking details, change time slots, or update attendee lists by selecting the booking and using the edit function.
                </p>
                
                <h4 className="font-medium">4.3 Cancelling Bookings</h4>
                <p>
                  Cancel reservations when needed. Notifications will be sent to all attendees, 
                  and the room will become available for others.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="section-5">
              <AccordionTrigger>5. Conflict Resolution</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <h4 className="font-medium">5.1 Understanding Conflicts</h4>
                <p>
                  Booking conflicts occur when multiple users request the same room for overlapping time slots. 
                  The system will automatically detect and help resolve these conflicts.
                </p>
                
                <h4 className="font-medium">5.2 Using the Waitlist</h4>
                <p>
                  If your preferred room is unavailable, you can join the waitlist. You'll be notified 
                  if the room becomes available due to cancellations.
                </p>
                
                <h4 className="font-medium">5.3 Resolving Disputed Bookings</h4>
                <p>
                  Administrators can help resolve disputes by adjusting priorities or finding alternative arrangements. 
                  The system maintains an audit trail of all conflict resolutions.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Full User Manual</h4>
                <p className="text-sm text-muted-foreground">
                  Download the complete user manual for offline reference
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Download className="h-4 w-4 mr-1" /> Download (PDF)
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
