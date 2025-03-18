
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Monitor,
  Utensils,
  Repeat,
  CheckSquare,
  Copy,
  Trash2,
  LogOut,
  Bell,
  Mail,
  Share,
} from "lucide-react";
import { Booking } from "./PersonalBookings";

interface BookingDetailsProps {
  bookingId: string;
  bookings: Booking[];
  onClose: () => void;
  onCancel: (bookingId: string, reason?: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onDuplicate: (bookingId: string) => void;
  onShare: (bookingId: string, method: 'email' | 'calendar') => void;
  onSetReminder: (bookingId: string, minutes?: number) => void;
}

export function BookingDetails({
  bookingId,
  bookings,
  onClose,
  onCancel,
  onCheckIn,
  onCheckOut,
  onDuplicate,
  onShare,
  onSetReminder,
}: BookingDetailsProps) {
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) return null;
  
  // Status badge styling
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="secondary">Ongoing</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{booking.title}</span>
            {getStatusBadge(booking.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Time and Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(booking.start), "h:mm a")} - {format(new Date(booking.end), "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{booking.roomName}, {booking.location}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Description */}
          {booking.description && (
            <div className="space-y-2">
              <div className="font-medium">Description</div>
              <p className="text-sm text-muted-foreground">{booking.description}</p>
            </div>
          )}
          
          {/* Attendees */}
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Attendees ({booking.attendees.length})</span>
            </div>
            <div className="space-y-1">
              {booking.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{attendee.name}</span>
                  {attendee.id === "1" && <Badge variant="outline" className="text-xs">You</Badge>}
                </div>
              ))}
            </div>
          </div>
          
          {/* Equipment & Catering */}
          <div className="grid grid-cols-2 gap-4">
            {booking.equipment.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span>Equipment</span>
                </div>
                <div className="space-y-1">
                  {booking.equipment.map((item) => (
                    <div key={item} className="text-sm capitalize flex items-center">
                      <CheckSquare className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span>Catering</span>
              </div>
              <div className="text-sm">
                {booking.cateringRequested ? "Requested" : "Not requested"}
              </div>
            </div>
          </div>
          
          {/* Recurrence */}
          {booking.isRecurring && (
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span>Recurrence</span>
              </div>
              <div className="text-sm capitalize">
                Repeats {booking.recurrencePattern}
              </div>
            </div>
          )}
          
          {/* Check-in/out Details */}
          {(booking.checkedIn || booking.checkedOut) && (
            <div className="space-y-2">
              <div className="font-medium">Check-in Details</div>
              {booking.checkedIn && (
                <div className="text-sm flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Checked in at {format(new Date(booking.checkedInAt!), "h:mm a")}</span>
                </div>
              )}
              {booking.checkedOut && (
                <div className="text-sm flex items-center gap-1">
                  <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Checked out at {format(new Date(booking.checkedOutAt!), "h:mm a")}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <div className="flex flex-1 flex-wrap gap-2 justify-start">
            {booking.status === 'upcoming' && (
              <>
                <Button size="sm" variant="outline" onClick={() => onCheckIn(booking.id)}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Check In
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onCancel(booking.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}
            {booking.status === 'ongoing' && booking.checkedIn && !booking.checkedOut && (
              <Button size="sm" variant="outline" onClick={() => onCheckOut(booking.id)}>
                <LogOut className="h-4 w-4 mr-1" />
                Check Out
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onSetReminder(booking.id)}>
              <Bell className="h-4 w-4 mr-1" />
              Reminder
            </Button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => onShare(booking.id, 'email')}>
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button size="sm" variant="outline" onClick={() => onShare(booking.id, 'calendar')}>
              <Share className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDuplicate(booking.id)}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
