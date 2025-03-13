
import { useState } from "react";
import { format } from "date-fns";
import { Booking } from "./PersonalBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveBookingsListProps {
  bookings: Booking[];
  onCancel: (bookingId: string, reason?: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onDuplicate: (bookingId: string) => void;
  onShare: (bookingId: string, method: 'email' | 'calendar') => void;
  onSetReminder: (bookingId: string, minutes?: number) => void;
  onViewDetails: (bookingId: string) => void;
}

export function ResponsiveBookingsList({
  bookings,
  onCancel,
  onCheckIn,
  onCheckOut,
  onDuplicate,
  onShare,
  onSetReminder,
  onViewDetails,
}: ResponsiveBookingsListProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const toggleCard = (bookingId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(bookingId)) {
      newExpandedCards.delete(bookingId);
    } else {
      newExpandedCards.add(bookingId);
    }
    setExpandedCards(newExpandedCards);
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

  if (!isMobile) {
    return null; // This component is only for mobile view
  }

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            No bookings found
          </div>
        </div>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{booking.title}</CardTitle>
                  <div className="mt-1">{getStatusBadge(booking.status)}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(booking.id)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onCheckIn(booking.id)}>
                      Check In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(booking.id, 'email')}>
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-1 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{format(new Date(booking.start), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(booking.start), "h:mm a")} - {format(new Date(booking.end), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.attendees.length} Attendees</span>
                </div>
              </div>
              
              <Collapsible
                open={expandedCards.has(booking.id)}
                onOpenChange={() => toggleCard(booking.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2 h-8"
                  >
                    {expandedCards.has(booking.id) ? (
                      <>Less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>More <ChevronDown className="h-4 w-4" /></>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-2 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Room:</span> {booking.roomName}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {booking.location}
                    </div>
                    {booking.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground">{booking.description}</p>
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full" 
                        onClick={() => onViewDetails(booking.id)}
                      >
                        Details
                      </Button>
                      {booking.status === 'upcoming' && (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => onCancel(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
