
import { useState, useEffect } from "react";
import { RoomCard, type Room } from "./RoomCard";
import { RoomList } from "./RoomList";
import { RoomFilters, type RoomFilters as Filters, type SortOption } from "./RoomFilters";

interface RoomResultsProps {
  rooms: Room[];
}

export function RoomResults({ rooms: initialRooms }: RoomResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    capacity: [1, 50],
    amenities: [],
    location: "",
    availableNow: false,
    availableToday: false
  });
  const [sort, setSort] = useState<SortOption>({ field: 'availability', direction: 'desc' });
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(initialRooms);
  
  // Get unique locations from rooms
  const locations = Array.from(new Set(initialRooms.map(room => room.location)));
  
  // Get all unique equipment from rooms
  const allAmenities = Array.from(
    new Set(initialRooms.flatMap(room => room.equipment))
  );

  // Filter and sort rooms when filters or sort changes
  useEffect(() => {
    let result = [...initialRooms];
    
    // Apply search filter
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(room => 
        room.name.toLowerCase().includes(lowerSearch) || 
        room.location.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply capacity filter
    result = result.filter(room => 
      room.capacity >= filters.capacity[0] && 
      room.capacity <= filters.capacity[1]
    );
    
    // Apply location filter
    if (filters.location) {
      result = result.filter(room => room.location === filters.location);
    }
    
    // Apply amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter(room => 
        filters.amenities.every(amenity => 
          room.equipment.includes(amenity)
        )
      );
    }
    
    // Apply availability filters
    if (filters.availableNow || filters.availableToday) {
      result = result.filter(room => room.status === "available");
    }
    
    // Apply date/time filter
    if (filters.availableDate) {
      // For demo purposes, we'll just filter for available rooms
      // In a real app, you'd check against booking records
      result = result.filter(room => room.status === "available");
    }
    
    // Calculate match percentage
    result = result.map(room => {
      let matchScore = 100;
      
      // Weighted factors for match score
      const amenityMatch = filters.amenities.length > 0 
        ? (filters.amenities.filter(a => room.equipment.includes(a)).length / filters.amenities.length) * 100
        : 100;
      
      const capacityIdeal = (filters.capacity[0] + filters.capacity[1]) / 2;
      const capacityDiff = Math.abs(room.capacity - capacityIdeal) / capacityIdeal;
      const capacityMatch = Math.max(0, 100 - (capacityDiff * 50));
      
      // Calculate overall match percentage
      matchScore = Math.round((amenityMatch * 0.6) + (capacityMatch * 0.4));
      
      return {
        ...room,
        matchPercentage: matchScore
      };
    });
    
    // Sort results
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'capacity':
          comparison = a.capacity - b.capacity;
          break;
        case 'availability':
          // For simple sorting, we'll use a status priority: available > booked > maintenance
          const statusPriority = { 'available': 0, 'booked': 1, 'maintenance': 2 };
          comparison = statusPriority[a.status] - statusPriority[b.status];
          break;
        case 'popularity':
          // This would require real data; for now just use ID as a stand-in
          comparison = a.id - b.id;
          break;
        default:
          // If sort by match percentage, put highest matches first
          comparison = (b.matchPercentage || 0) - (a.matchPercentage || 0);
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredRooms(result);
  }, [initialRooms, filters, sort]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Handle view changes
  const handleViewChange = (view: "grid" | "list") => {
    setViewMode(view);
  };

  // Handle sort changes
  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };

  return (
    <div className="space-y-6">
      <RoomFilters 
        onFilterChange={handleFilterChange}
        onViewChange={handleViewChange}
        onSortChange={handleSortChange}
        currentView={viewMode}
        locations={locations}
        allAmenities={allAmenities}
      />
      
      {filteredRooms.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No rooms match your search</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters to find more results</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
          </div>
          
          {/* Room results */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <RoomList rooms={filteredRooms} />
          )}
        </>
      )}
    </div>
  );
}
