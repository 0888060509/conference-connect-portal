
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Booking, cancelBooking, getUserBookings } from "@/services/BookingService";
import { Link } from "react-router-dom";

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const allBookings = await getUserBookings();
      
      const now = new Date();
      const upcoming = allBookings.filter(booking => booking.endTime > now);
      const past = allBookings.filter(booking => booking.endTime <= now);
      
      setBookings(upcoming);
      setPastBookings(past);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await cancelBooking(selectedBooking.id);
      loadBookings();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  // Render a booking card
  const renderBookingCard = (booking: Booking) => {
    const isUpcoming = booking.endTime > new Date();
    
    return (
      <Card key={booking.id} className="overflow-hidden">
        <CardHeader>
          <CardTitle>{booking.title}</CardTitle>
          {booking.roomName && (
            <CardDescription>
              {booking.roomName}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              {format(booking.startTime, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
            </div>
            {booking.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {booking.location}
              </div>
            )}
            {booking.description && (
              <div className="text-sm mt-3">
                {booking.description}
              </div>
            )}
          </div>
        </CardContent>
        {isUpcoming && (
          <CardFooter className="flex justify-end gap-2 border-t pt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="text-destructive"
              onClick={() => openCancelDialog(booking)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
          <TabsTrigger value="past">Past Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="pt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">No upcoming bookings</div>
              <p className="text-muted-foreground">
                You don't have any upcoming bookings. Book a room to get started.
              </p>
              {/* Fixed this line - replaced href with as={Link} to */}
              <Button className="mt-4" asChild>
                <Link to="/bookings" className="mt-4">Book a Room</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="pt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : pastBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">No past bookings</div>
              <p className="text-muted-foreground">
                You don't have any past bookings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-2">
              <div className="font-medium">{selectedBooking.title}</div>
              <div className="text-sm text-muted-foreground">
                {format(selectedBooking.startTime, "EEEE, MMMM d, yyyy")} at {format(selectedBooking.startTime, "h:mm a")}
              </div>
              {selectedBooking.roomName && (
                <div className="text-sm text-muted-foreground">
                  {selectedBooking.roomName}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
