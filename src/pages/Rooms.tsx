
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoomResults } from "@/components/rooms/RoomResults";
import { type Room } from "@/components/rooms/RoomCard";

// Sample rooms data
const rooms: Room[] = [
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
  {
    id: 7,
    name: "Brainstorming Room",
    location: "1st Floor, Building B",
    capacity: 12,
    status: "available",
    equipment: ["Whiteboard", "Wi-Fi", "Coffee Machine"],
    image: "https://placehold.co/400x300/27AE60/FFFFFF?text=Brainstorming+Room"
  },
  {
    id: 8,
    name: "Focus Room",
    location: "4th Floor, Building A",
    capacity: 2,
    status: "available",
    equipment: ["TV Screen", "Wi-Fi"],
    image: "https://placehold.co/400x300/8E44AD/FFFFFF?text=Focus+Room"
  },
  {
    id: 9,
    name: "Auditorium",
    location: "Ground Floor, Building C",
    capacity: 50,
    status: "available",
    equipment: ["Sound System", "Projector", "Video Conference", "Wi-Fi"],
    image: "https://placehold.co/400x300/F39C12/FFFFFF?text=Auditorium"
  },
];

export default function Rooms() {
  return (
    <Layout title="Rooms">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Meeting Rooms</h1>
          <Button className="bg-secondary hover:bg-secondary-light">
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
        </div>
        
        <RoomResults rooms={rooms} />
      </div>
    </Layout>
  );
}
