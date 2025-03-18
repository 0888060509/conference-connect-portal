
import { useState } from "react";
import { format } from "date-fns";
import { Users, MapPin, Clock, Calendar, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomBookingForm } from "./RoomBookingForm";

interface Room {
  id: string;
  name: string;
  number?: string;
  building?: string;
  floor?: string;
  capacity?: number;
  image_url?: string;
  description?: string;
}

interface AvailableRoomsListProps {
  rooms: Room[];
  isLoading: boolean;
  date: Date;
  startTime: string;
  endTime: string;
  onBookingComplete?: () => void;
}

export function AvailableRoomsList({ 
  rooms, 
  isLoading, 
  date, 
  startTime, 
  endTime,
  onBookingComplete 
}: AvailableRoomsListProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setBookingDialogOpen(true);
  };

  const handleBookingComplete = (bookingId: string) => {
    setBookingDialogOpen(false);
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-40 bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg font-medium mb-2">No available rooms found</div>
        <p className="text-muted-foreground">
          Try changing your search criteria or selecting a different time slot.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{startTime} - {endTime}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Found {rooms.length} available {rooms.length === 1 ? "room" : "rooms"}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden flex flex-col">
            {room.image_url ? (
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${room.image_url})` }} />
            ) : (
              <div className="h-40 bg-muted flex items-center justify-center">
                <span className="text-2xl font-medium text-muted-foreground">{room.name}</span>
              </div>
            )}
            <CardHeader>
              <div className="font-medium text-lg">{room.name}</div>
              {room.number && <div className="text-sm text-muted-foreground">Room {room.number}</div>}
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                {(room.building || room.floor) && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {room.building && room.floor ? `${room.building}, ${room.floor}` : room.building || room.floor}
                  </div>
                )}
                {room.capacity && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    Capacity: {room.capacity} people
                  </div>
                )}
                {room.description && (
                  <div className="text-sm mt-2">
                    {room.description.length > 100 
                      ? `${room.description.substring(0, 100)}...` 
                      : room.description}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleBookNow(room)}
              >
                Book Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog 
        open={bookingDialogOpen} 
        onOpenChange={setBookingDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {selectedRoom?.name}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <RoomBookingForm
              roomId={selectedRoom.id}
              roomName={selectedRoom.name}
              onBookingComplete={handleBookingComplete}
              defaultDate={date}
              defaultStartTime={startTime}
              defaultEndTime={endTime}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
