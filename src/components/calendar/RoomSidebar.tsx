
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Search, X, Filter } from "lucide-react";
import { RoomStatusIndicator } from "./RoomStatusIndicator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  availability: "available" | "partial" | "booked";
}

interface RoomSidebarProps {
  rooms: Room[];
  isOpen: boolean;
  onToggle: () => void;
  selectedRooms: number[];
  onRoomToggle: (roomId: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RoomSidebar({
  rooms,
  isOpen,
  onToggle,
  selectedRooms,
  onRoomToggle,
  searchQuery,
  onSearchChange,
}: RoomSidebarProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  return (
    <div
      className={`
        border-r bg-card transition-all duration-300 flex flex-col
        ${isOpen ? "w-64" : "w-0"}
      `}
    >
      {isOpen && (
        <div className="p-4 space-y-4 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-lg">Meeting Rooms</h2>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              className="pl-8 pr-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {rooms.length} Room{rooms.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>

          {filterMenuOpen && (
            <div className="p-2 border rounded-md text-sm">
              <div className="font-medium mb-1">Capacity</div>
              <div className="space-y-2 ml-2 mb-2">
                <div className="flex items-center">
                  <Checkbox id="capacity-small" />
                  <label htmlFor="capacity-small" className="ml-2">
                    Small (1-6)
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="capacity-medium" />
                  <label htmlFor="capacity-medium" className="ml-2">
                    Medium (7-12)
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="capacity-large" />
                  <label htmlFor="capacity-large" className="ml-2">
                    Large (13+)
                  </label>
                </div>
              </div>
              
              <div className="font-medium mb-1">Availability</div>
              <div className="space-y-2 ml-2 mb-2">
                <div className="flex items-center">
                  <Checkbox id="available" />
                  <label htmlFor="available" className="ml-2 flex items-center">
                    <RoomStatusIndicator status="available" label="Available" />
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="partial" />
                  <label htmlFor="partial" className="ml-2 flex items-center">
                    <RoomStatusIndicator status="partial" label="Partial" />
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="booked" />
                  <label htmlFor="booked" className="ml-2 flex items-center">
                    <RoomStatusIndicator status="booked" label="Booked" />
                  </label>
                </div>
              </div>
              
              <div className="font-medium mb-1">Equipment</div>
              <div className="space-y-2 ml-2">
                <div className="flex items-center">
                  <Checkbox id="projector" />
                  <label htmlFor="projector" className="ml-2">
                    Projector
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="videoconf" />
                  <label htmlFor="videoconf" className="ml-2">
                    Video Conferencing
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="whiteboard" />
                  <label htmlFor="whiteboard" className="ml-2">
                    Whiteboard
                  </label>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-4">
              {rooms.map((room) => (
                <HoverCard key={room.id} openDelay={300} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div 
                      className={`
                        flex items-center p-2 rounded-md cursor-pointer
                        ${selectedRooms.includes(room.id) ? "bg-secondary/10" : "hover:bg-secondary/5"}
                      `}
                      onClick={() => onRoomToggle(room.id)}
                    >
                      <Checkbox 
                        id={`room-${room.id}`} 
                        checked={selectedRooms.includes(room.id)}
                        onCheckedChange={() => onRoomToggle(room.id)}
                        className="mr-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{room.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{room.location}</div>
                      </div>
                      <RoomStatusIndicator status={room.availability} size="sm" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{room.name}</h4>
                      <div className="text-sm">{room.location}</div>
                      <div className="flex items-center text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="ml-1 font-medium">{room.capacity} people</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Equipment:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.equipment.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="m-2"
          onClick={onToggle}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
