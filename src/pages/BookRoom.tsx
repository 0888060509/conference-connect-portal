
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { RoomSearchForm } from "@/components/bookings/RoomSearchForm";
import { AvailableRoomsList } from "@/components/bookings/AvailableRoomsList";
import { Card, CardContent } from "@/components/ui/card";
import { RoomFilter, getAvailableRooms } from "@/services/BookingService";

export default function BookRoom() {
  const [searchFilters, setSearchFilters] = useState<RoomFilter | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (filters: RoomFilter) => {
    setSearchFilters(filters);
    setIsLoading(true);
    
    try {
      const availableRooms = await getAvailableRooms(filters);
      setRooms(availableRooms);
    } catch (error) {
      console.error("Error searching for rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingComplete = () => {
    // Refresh the room list after a booking is made
    if (searchFilters) {
      handleSearch(searchFilters);
    }
  };

  return (
    <Layout title="Book a Room">
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <RoomSearchForm onSearch={handleSearch} />
          </CardContent>
        </Card>
        
        {searchFilters && (
          <AvailableRoomsList 
            rooms={rooms} 
            isLoading={isLoading} 
            date={searchFilters.date || new Date()}
            startTime={searchFilters.startTime || "09:00"}
            endTime={searchFilters.endTime || "10:00"}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </div>
    </Layout>
  );
}
