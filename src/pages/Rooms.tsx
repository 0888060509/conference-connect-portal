
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample rooms data
const rooms = [
  {
    id: 1,
    name: "Executive Boardroom",
    location: "3rd Floor, Building A",
    capacity: 14,
    status: "available",
    equipment: ["Video Conference", "Whiteboard", "Projector"],
    image: "https://placehold.co/400x300/2C3E50/FFFFFF?text=Executive+Boardroom"
  },
  {
    id: 2,
    name: "Innovation Lab",
    location: "2nd Floor, Building B",
    capacity: 8,
    status: "available",
    equipment: ["TV Screen", "Whiteboard", "Video Conference"],
    image: "https://placehold.co/400x300/3498DB/FFFFFF?text=Innovation+Lab"
  },
  {
    id: 3,
    name: "Meeting Room 101",
    location: "1st Floor, Building A",
    capacity: 6,
    status: "available",
    equipment: ["TV Screen", "Whiteboard"],
    image: "https://placehold.co/400x300/E74C3C/FFFFFF?text=Meeting+Room+101"
  },
  {
    id: 4,
    name: "Conference Room A",
    location: "4th Floor, Building C",
    capacity: 20,
    status: "booked",
    equipment: ["Projector", "Video Conference", "Sound System"],
    image: "https://placehold.co/400x300/2C3E50/FFFFFF?text=Conference+Room+A"
  },
  {
    id: 5,
    name: "Small Meeting Room 1",
    location: "2nd Floor, Building A",
    capacity: 4,
    status: "available",
    equipment: ["TV Screen"],
    image: "https://placehold.co/400x300/3498DB/FFFFFF?text=Small+Meeting+Room"
  },
  {
    id: 6,
    name: "Training Room",
    location: "3rd Floor, Building B",
    capacity: 30,
    status: "maintenance",
    equipment: ["Projector", "Computers", "Whiteboard"],
    image: "https://placehold.co/400x300/E74C3C/FFFFFF?text=Training+Room"
  },
];

export default function Rooms() {
  return (
    <Layout title="Rooms">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search rooms..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="w-full md:w-auto">
              Filter
            </Button>
            <Button className="bg-secondary hover:bg-secondary-light w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${room.image})` }}
              />
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Building className="h-3.5 w-3.5 mr-1" />
                      {room.location}
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className={cn(
                      room.status === "available" && "bg-success/10 text-success border-success/20",
                      room.status === "booked" && "bg-accent/10 text-accent border-accent/20",
                      room.status === "maintenance" && "bg-warning/10 text-warning border-warning/20"
                    )}>
                      {room.status === "available" ? "Available" : room.status === "booked" ? "Booked" : "Maintenance"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center mt-3 text-sm">
                  <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>Capacity: {room.capacity}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {room.equipment.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button 
                    size="sm" 
                    className={cn(
                      "bg-secondary hover:bg-secondary-light",
                      room.status !== "available" && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={room.status !== "available"}
                  >
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
