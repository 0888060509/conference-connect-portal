
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: "available" | "booked" | "maintenance";
  equipment: string[];
  image: string;
  matchPercentage?: number;
}

interface RoomCardProps {
  room: Room;
  compact?: boolean;
}

export function RoomCard({ room, compact = false }: RoomCardProps) {
  const { id, name, location, capacity, status, equipment, image, matchPercentage } = room;

  // Function to render the match percentage indicator
  const renderMatchIndicator = () => {
    if (matchPercentage === undefined) return null;
    
    // Different color based on match percentage
    const getMatchColor = () => {
      if (matchPercentage >= 90) return "bg-success";
      if (matchPercentage >= 70) return "bg-success/80";
      if (matchPercentage >= 50) return "bg-warning/80";
      return "bg-muted";
    };
    
    return (
      <div className="absolute top-2 right-2 z-10">
        <div className={cn(
          "flex items-center justify-center rounded-full",
          "w-10 h-10 text-white font-medium text-sm",
          getMatchColor()
        )}>
          {matchPercentage}%
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative">
        {renderMatchIndicator()}
        <div 
          className="h-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <CardContent className={cn(
        "flex-1 flex flex-col",
        compact ? "p-3" : "p-5"
      )}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn(
              "font-semibold", 
              compact ? "text-base" : "text-lg"
            )}>{name}</h3>
            <div className={cn(
              "flex items-center text-muted-foreground",
              compact ? "text-xs mt-0.5" : "text-sm mt-1"
            )}>
              <Building className={cn(
                compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1"
              )} />
              {location}
            </div>
          </div>
          <div>
            <Badge variant="outline" className={cn(
              status === "available" && "bg-success/10 text-success border-success/20",
              status === "booked" && "bg-accent/10 text-accent border-accent/20",
              status === "maintenance" && "bg-warning/10 text-warning border-warning/20",
              compact && "text-xs px-1.5 py-0"
            )}>
              {status === "available" ? "Available" : status === "booked" ? "Booked" : "Maintenance"}
            </Badge>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center",
          compact ? "mt-2 text-xs" : "mt-3 text-sm"
        )}>
          <Users className={cn(
            "text-muted-foreground",
            compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1"
          )} />
          <span>Capacity: {capacity}</span>
        </div>
        
        <div className={cn(
          "flex flex-wrap gap-1",
          compact ? "mt-2" : "mt-3"
        )}>
          {equipment.slice(0, compact ? 2 : 3).map((item, i) => (
            <Badge key={i} variant="secondary" className={cn(
              "font-normal",
              compact ? "text-[10px] px-1" : "text-xs"
            )}>
              {item}
            </Badge>
          ))}
          {equipment.length > (compact ? 2 : 3) && (
            <Badge variant="secondary" className={cn(
              "font-normal",
              compact ? "text-[10px] px-1" : "text-xs"
            )}>
              +{equipment.length - (compact ? 2 : 3)} more
            </Badge>
          )}
        </div>
        
        <div className={cn(
          "flex justify-between mt-auto",
          compact ? "mt-2" : "mt-4"
        )}>
          <Button variant="outline" size={compact ? "sm" : "default"} className={compact ? "text-xs h-7 px-2" : ""}>
            View Details
          </Button>
          <Button 
            size={compact ? "sm" : "default"}
            className={cn(
              "bg-secondary hover:bg-secondary-light",
              status !== "available" && "opacity-50 cursor-not-allowed",
              compact && "text-xs h-7 px-2"
            )}
            disabled={status !== "available"}
          >
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
