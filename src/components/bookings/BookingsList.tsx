
import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Share,
  Trash2,
  Bell,
  CheckSquare,
  LogOut,
  Users,
  Calendar as CalendarIcon,
  Mail,
} from "lucide-react";
import { Booking } from "./PersonalBookings";
import { BookingDetails } from "./BookingDetails";

interface BookingsListProps {
  bookings: Booking[];
  onCancel: (bookingId: string, reason: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onDuplicate: (bookingId: string) => void;
  onShare: (bookingId: string, method: 'email' | 'calendar') => void;
  onSetReminder: (bookingId: string, minutes: number) => void;
}

export function BookingsList({
  bookings,
  onCancel,
  onCheckIn,
  onCheckOut,
  onDuplicate,
  onShare,
  onSetReminder,
}: BookingsListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [bookingForReminder, setBookingForReminder] = useState<string | null>(null);

  // Handle opening the cancel dialog
  const handleOpenCancelDialog = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  // Handle confirming cancellation
  const handleConfirmCancel = () => {
    if (bookingToCancel && cancelReason.trim()) {
      onCancel(bookingToCancel, cancelReason);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancelReason("");
    }
  };

  // Handle opening the reminder dialog
  const handleOpenReminderDialog = (bookingId: string) => {
    setBookingForReminder(bookingId);
    setReminderMinutes(15);
    setReminderDialogOpen(true);
  };

  // Handle confirming reminder
  const handleConfirmReminder = () => {
    if (bookingForReminder && reminderMinutes > 0) {
      onSetReminder(bookingForReminder, reminderMinutes);
      setReminderDialogOpen(false);
      setBookingForReminder(null);
    }
  };

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
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meeting</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No bookings found for the selected filters
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {booking.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{booking.roomName}</div>
                    <div className="text-xs text-muted-foreground">{booking.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{format(new Date(booking.start), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(booking.start), "h:mm a")} - {format(new Date(booking.end), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{booking.attendees.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                    {booking.checkedIn && !booking.checkedOut && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Checked in: {format(new Date(booking.checkedInAt!), "h:mm a")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewBookingId(booking.id)}>
                          View Details
                        </DropdownMenuItem>
                        
                        {booking.status === 'upcoming' && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenCancelDialog(booking.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuItem onClick={() => onDuplicate(booking.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Booking
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {booking.status === 'upcoming' && (
                          <DropdownMenuItem onClick={() => handleOpenReminderDialog(booking.id)}>
                            <Bell className="h-4 w-4 mr-2" />
                            Set Reminder
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onShare(booking.id, 'email')}>
                          <Mail className="h-4 w-4 mr-2" />
                          Share via Email
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => onShare(booking.id, 'calendar')}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Add to Calendar
                        </DropdownMenuItem>
                        
                        {booking.status === 'upcoming' && (
                          <DropdownMenuItem onClick={() => onCheckIn(booking.id)}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Check In
                          </DropdownMenuItem>
                        )}
                        
                        {booking.status === 'ongoing' && booking.checkedIn && !booking.checkedOut && (
                          <DropdownMenuItem onClick={() => onCheckOut(booking.id)}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Check Out
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this booking. This information will be logged for record-keeping purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
            <DialogDescription>
              Choose how many minutes before the meeting you'd like to be reminded.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-minutes">Minutes Before</Label>
              <Input
                id="reminder-minutes"
                type="number"
                min="5"
                max="60"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 15)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReminder}>
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Booking Details */}
      {viewBookingId && (
        <BookingDetails
          bookingId={viewBookingId}
          bookings={bookings}
          onClose={() => setViewBookingId(null)}
          onCancel={handleOpenCancelDialog}
          onCheckIn={onCheckIn}
          onCheckOut={onCheckOut}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onSetReminder={handleOpenReminderDialog}
        />
      )}
    </>
  );
}
