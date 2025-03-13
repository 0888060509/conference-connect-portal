
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

// Sample data for rooms
const rooms = [
  {
    id: 1,
    name: "Executive Boardroom",
    capacity: 14,
    nextAvailable: "10:30 AM",
    equipment: ["Video Conference", "Whiteboard", "Projector"],
    status: "available",
  },
  {
    id: 2,
    name: "Innovation Lab",
    capacity: 8,
    nextAvailable: "1:00 PM",
    equipment: ["TV Screen", "Whiteboard", "Video Conference"],
    status: "available",
  },
  {
    id: 3,
    name: "Meeting Room 101",
    capacity: 6,
    nextAvailable: "3:15 PM",
    equipment: ["TV Screen", "Whiteboard"],
    status: "available",
  },
  {
    id: 4,
    name: "Conference Room A",
    capacity: 20,
    nextAvailable: "Tomorrow, 9:00 AM",
    equipment: ["Projector", "Video Conference", "Sound System"],
    status: "booked",
  },
];

export function RoomsList() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Available Rooms</span>
          <Button variant="outline" size="sm" className="text-sm h-8 px-3">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold">{room.name}</h3>
                  {room.status === "available" ? (
                    <Badge variant="outline" className="ml-2 bg-success/10 text-success border-success/20">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 bg-accent/10 text-accent border-accent/20">
                      Booked
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{room.capacity} people</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>Next: {room.nextAvailable}</span>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {room.equipment.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Button size="sm" className="bg-secondary hover:bg-secondary-light">Book</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
