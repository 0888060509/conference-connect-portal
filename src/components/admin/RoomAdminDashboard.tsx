
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomList } from "@/components/admin/RoomList";
import { RoomStatistics } from "@/components/admin/RoomStatistics";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { RoomFormDialog } from "@/components/admin/RoomFormDialog";

export function RoomAdminDashboard() {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const handleExportData = () => {
    // Generate CSV data from rooms
    const rooms = getRooms();
    const headers = ["Name", "Number", "Location", "Capacity", "Availability"];
    const csvContent = 
      headers.join(",") + 
      "\n" + 
      rooms.map(room => 
        [
          room.name,
          room.number,
          room.location,
          room.capacity,
          room.available ? "Available" : "Unavailable"
        ].join(",")
      ).join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "room_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock function to get rooms - in a real app this would come from API/context
  const getRooms = () => {
    return [
      {
        id: 1,
        name: "Executive Boardroom",
        number: "101",
        location: "1st Floor, Building A",
        capacity: 12,
        available: true,
        amenities: ["Projector", "Video Conferencing", "Whiteboard"],
        maintenanceSchedule: "First Monday of every month",
      },
      {
        id: 2,
        name: "Conference Room Alpha",
        number: "202",
        location: "2nd Floor, Building B",
        capacity: 20,
        available: true,
        amenities: ["Projector", "Sound System", "Whiteboard"],
        maintenanceSchedule: "Every other Friday",
      },
      {
        id: 3,
        name: "Small Meeting Room",
        number: "303",
        location: "3rd Floor, Building A",
        capacity: 6,
        available: false,
        amenities: ["TV Screen", "Whiteboard"],
        maintenanceSchedule: "Last Friday of every month",
      },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setIsAddRoomOpen(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Room List</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <RoomList />
        </TabsContent>
        
        <TabsContent value="statistics" className="mt-6">
          <RoomStatistics />
        </TabsContent>
      </Tabs>

      <RoomFormDialog 
        open={isAddRoomOpen} 
        onOpenChange={setIsAddRoomOpen}
        mode="add"
      />
    </div>
  );
}
