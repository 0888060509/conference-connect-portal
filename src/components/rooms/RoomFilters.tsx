
import { useState, useEffect } from "react";
import { FilterBar } from "./filters/FilterBar";
import { Save } from "lucide-react";

// Define the props for the Room component
export interface RoomFilterProps {
  onFilterChange: (filters: RoomFilters) => void;
  onViewChange: (view: "grid" | "list") => void;
  onSortChange: (sort: SortOption) => void;
  currentView: "grid" | "list";
  locations: string[];
  allAmenities: string[];
}

// Define the filter options
export interface RoomFilters {
  search: string;
  capacity: [number, number];
  amenities: string[];
  location: string;
  availableDate?: Date;
  availableTimeStart?: string;
  availableTimeEnd?: string;
  availableNow: boolean;
  availableToday: boolean;
}

// Define sort options
export type SortOption = {
  field: 'name' | 'capacity' | 'availability' | 'popularity';
  direction: 'asc' | 'desc';
};

interface SavedSearch {
  id: string;
  name: string;
  filters: RoomFilters;
}

export function RoomFilters({ 
  onFilterChange, 
  onViewChange, 
  onSortChange,
  currentView,
  locations, 
  allAmenities 
}: RoomFilterProps) {
  // Initialize filters with default values
  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    capacity: [1, 50],
    amenities: [],
    location: "",
    availableNow: false,
    availableToday: false
  });

  // State for saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  
  // State for tracking if filters are active
  const [filtersActive, setFiltersActive] = useState(false);
  
  // State for current sort
  const [currentSort, setCurrentSort] = useState<SortOption>({ 
    field: 'availability', 
    direction: 'desc' 
  });

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
    
    // Check if any filters are active
    const hasActiveFilters = 
      filters.search !== "" || 
      filters.capacity[0] > 1 ||
      filters.capacity[1] < 50 ||
      filters.amenities.length > 0 ||
      filters.location !== "" ||
      filters.availableDate !== undefined ||
      filters.availableTimeStart !== undefined ||
      filters.availableTimeEnd !== undefined ||
      filters.availableNow ||
      filters.availableToday;
    
    setFiltersActive(hasActiveFilters);
  }, [filters, onFilterChange]);

  // Handler for updating filters
  const updateFilters = (updatedValues: Partial<RoomFilters>) => {
    setFilters(prev => ({ ...prev, ...updatedValues }));
  };

  // Handler for clearing all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      capacity: [1, 50],
      amenities: [],
      location: "",
      availableNow: false,
      availableToday: false
    });
  };

  // Handle saving a search
  const saveCurrentSearch = (name: string) => {
    if (name.trim()) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name: name,
        filters: { ...filters }
      };
      
      setSavedSearches([...savedSearches, newSearch]);
      return true;
    }
    return false;
  };

  // Handle loading a saved search
  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
  };

  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort);
    onSortChange(newSort);
  };

  return (
    <FilterBar
      filters={filters}
      updateFilters={updateFilters}
      clearAllFilters={clearAllFilters}
      filtersActive={filtersActive}
      currentView={currentView}
      onViewChange={onViewChange}
      currentSort={currentSort}
      onSortChange={handleSortChange}
      savedSearches={savedSearches}
      setSavedSearches={setSavedSearches}
      loadSavedSearch={loadSavedSearch}
      locations={locations}
      allAmenities={allAmenities}
    />
  );
}
