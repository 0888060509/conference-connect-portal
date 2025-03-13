
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Users } from "lucide-react";
import { type Room } from "./RoomCard";
import { cn } from "@/lib/utils";

interface RoomListProps {
  rooms: Room[];
}

export function RoomList({ rooms }: RoomListProps) {
  return (
    <div className="space-y-3">
      {rooms.map(room => (
        <RoomListItem key={room.id} room={room} />
      ))}
    </div>
  );
}

function RoomListItem({ room }: { room: Room }) {
  const { id, name, location, capacity, status, equipment, image, matchPercentage } = room;
  
  // Function to render the match percentage indicator
  const renderMatchIndicator = () => {
    if (matchPercentage === undefined) return null;
    
    // Different color based on match percentage
    const getMatchColor = () => {
      if (matchPercentage >= 90) return "bg-success text-white";
      if (matchPercentage >= 70) return "bg-success/80 text-white";
      if (matchPercentage >= 50) return "bg-warning/80 text-white";
      return "bg-muted text-foreground";
    };
    
    return (
      <div className={cn(
        "flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium",
        getMatchColor()
      )}>
        {matchPercentage}% match
      </div>
    );
  };

  return (
    <div className="flex border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      <div 
        className="w-24 sm:w-32 md:w-48 bg-cover bg-center hidden sm:block" 
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="flex-1 p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              <Badge variant="outline" className={cn(
                "ml-2",
                status === "available" && "bg-success/10 text-success border-success/20",
                status === "booked" && "bg-accent/10 text-accent border-accent/20",
                status === "maintenance" && "bg-warning/10 text-warning border-warning/20"
              )}>
                {status === "available" ? "Available" : status === "booked" ? "Booked" : "Maintenance"}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Building className="h-3.5 w-3.5 mr-1" />
              {location}
            </div>
          </div>
          
          {renderMatchIndicator()}
        </div>
        
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          <div className="flex items-center text-sm">
            <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Capacity: {capacity}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Next available: 2:30 PM</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Duration: 4 hours</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {equipment.map((item, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {item}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">View Details</Button>
          <Button 
            className={cn(
              "bg-secondary hover:bg-secondary-light",
              status !== "available" && "opacity-50 cursor-not-allowed"
            )}
            disabled={status !== "available"}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
