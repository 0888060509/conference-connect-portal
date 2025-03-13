
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Sliders, 
  X, 
  Check, 
  Clock, 
  Calendar as CalendarIcon,
  Save,
  StarIcon,
  Building,
  Users,
  Monitor,
  Mic,
  Video,
  Wifi,
  Maximize,
  Coffee,
  FileText,
  ChevronDown,
  Heart,
  LayoutGrid,
  List,
  Zap,
  Sun,
  SortAsc,
  SortDesc
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");
  
  // State for tracking if filters are active
  const [filtersActive, setFiltersActive] = useState(false);
  
  // State for current sort
  const [currentSort, setCurrentSort] = useState<SortOption>({ 
    field: 'availability', 
    direction: 'desc' 
  });

  // Group amenities by category
  const amenityCategories = {
    "Technology": ["Video Conference", "TV Screen", "Projector", "Whiteboard", "Computers", "Wi-Fi"],
    "Facilities": ["Coffee Machine", "Water Dispenser", "Catering Available", "Air Conditioning"],
    "Setup": ["U-Shape", "Boardroom", "Theater", "Classroom", "Standing"]
  };

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

  // Handle toggling an amenity
  const toggleAmenity = (amenity: string) => {
    if (filters.amenities.includes(amenity)) {
      updateFilters({ 
        amenities: filters.amenities.filter(a => a !== amenity) 
      });
    } else {
      updateFilters({ 
        amenities: [...filters.amenities, amenity] 
      });
    }
  };

  // Handle saving a search
  const saveCurrentSearch = () => {
    if (newSearchName.trim()) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name: newSearchName,
        filters: { ...filters }
      };
      
      setSavedSearches([...savedSearches, newSearch]);
      setSaveDialogOpen(false);
      setNewSearchName("");
    }
  };

  // Handle loading a saved search
  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
  };

  // Handle deleting a saved search
  const deleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSearches(savedSearches.filter(search => search.id !== id));
  };

  // Update sort
  const handleSortChange = (field: SortOption['field']) => {
    const direction: 'asc' | 'desc' = 
      currentSort.field === field && currentSort.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    const newSort: SortOption = { field, direction };
    setCurrentSort(newSort);
    onSortChange(newSort);
  };

  return (
    <div className="space-y-4">
      {/* Main search and quick filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-auto sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
            className="pl-8 pr-10"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => updateFilters({ search: "" })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={filtersActive ? "default" : "outline"} 
                size="sm"
                className="w-full sm:w-auto"
              >
                <Sliders className="mr-2 h-4 w-4" />
                Filters
                {filtersActive && (
                  <Badge className="ml-2 bg-primary/20 text-primary" variant="outline">
                    Active
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Filter Rooms</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {/* Capacity slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="capacity">Capacity</Label>
                      <span className="text-sm text-muted-foreground">
                        {filters.capacity[0]} - {filters.capacity[1]} people
                      </span>
                    </div>
                    <Slider
                      id="capacity"
                      min={1}
                      max={50}
                      step={1}
                      value={filters.capacity}
                      onValueChange={(value) => updateFilters({ capacity: value as [number, number] })}
                      className="py-2"
                    />
                  </div>

                  {/* Location dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={filters.location}
                      onValueChange={(value) => updateFilters({ location: value })}
                    >
                      <SelectTrigger id="location" className="w-full">
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability date picker */}
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filters.availableDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.availableDate ? (
                              format(filters.availableDate, "PPP")
                            ) : (
                              "Pick a date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.availableDate}
                            onSelect={(date) => updateFilters({ 
                              availableDate: date,
                              availableNow: false,
                              availableToday: false
                            })}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                          <div className="border-t p-3 flex justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateFilters({ availableDate: undefined })}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateFilters({ 
                                availableDate: new Date(),
                                availableToday: true,
                                availableNow: false
                              })}
                            >
                              Today
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time range if date is selected */}
                    {filters.availableDate && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                          <Select
                            value={filters.availableTimeStart || ""}
                            onValueChange={(value) => updateFilters({ availableTimeStart: value })}
                          >
                            <SelectTrigger id="start-time">
                              <SelectValue placeholder="Start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="end-time" className="text-xs">End Time</Label>
                          <Select
                            value={filters.availableTimeEnd || ""}
                            onValueChange={(value) => updateFilters({ availableTimeEnd: value })}
                          >
                            <SelectTrigger id="end-time">
                              <SelectValue placeholder="End time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick availability filters */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="available-now"
                        checked={filters.availableNow}
                        onCheckedChange={(checked) => updateFilters({ 
                          availableNow: checked, 
                          availableToday: false,
                          availableDate: checked ? new Date() : filters.availableDate
                        })}
                      />
                      <Label htmlFor="available-now" className="flex items-center cursor-pointer">
                        <Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                        Available Now
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="available-today"
                        checked={filters.availableToday}
                        onCheckedChange={(checked) => updateFilters({ 
                          availableToday: checked, 
                          availableNow: false,
                          availableDate: checked ? new Date() : filters.availableDate
                        })}
                      />
                      <Label htmlFor="available-today" className="flex items-center cursor-pointer">
                        <Sun className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                        Available Today
                      </Label>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <Label className="text-base">Amenities</Label>
                    
                    {Object.entries(amenityCategories).map(([category, amenities]) => (
                      <div key={category} className="mt-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {amenities.map(amenity => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`amenity-${amenity}`}
                                checked={filters.amenities.includes(amenity)}
                                onCheckedChange={() => toggleAmenity(amenity)}
                              />
                              <Label 
                                htmlFor={`amenity-${amenity}`} 
                                className="text-sm cursor-pointer"
                              >
                                {amenity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-1 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    Reset
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Save Search
                  </Button>
                </CardFooter>

                {/* Save search dialog */}
                {saveDialogOpen && (
                  <div className="border-t p-4">
                    <h3 className="text-sm font-medium mb-2">Save this search</h3>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Search name"
                        value={newSearchName}
                        onChange={(e) => setNewSearchName(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSaveDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={saveCurrentSearch}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </PopoverContent>
          </Popover>

          {/* Saved searches */}
          {savedSearches.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Saved
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {savedSearches.map((search) => (
                  <DropdownMenuItem
                    key={search.id}
                    className="flex justify-between"
                    onClick={() => loadSavedSearch(search)}
                  >
                    <span>{search.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => deleteSavedSearch(search.id, e)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View toggle */}
          <div className="border rounded-md flex">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 rounded-none rounded-l-md border-r",
                currentView === "grid" && "bg-muted"
              )}
              onClick={() => onViewChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 rounded-none rounded-r-md",
                currentView === "list" && "bg-muted"
              )}
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex"
              >
                {currentSort.direction === 'asc' ? (
                  <SortAsc className="mr-2 h-4 w-4" />
                ) : (
                  <SortDesc className="mr-2 h-4 w-4" />
                )}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange('name')}>
                <div className="flex items-center justify-between w-full">
                  <span>Name</span>
                  {currentSort.field === 'name' && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('capacity')}>
                <div className="flex items-center justify-between w-full">
                  <span>Capacity</span>
                  {currentSort.field === 'capacity' && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('availability')}>
                <div className="flex items-center justify-between w-full">
                  <span>Availability</span>
                  {currentSort.field === 'availability' && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('popularity')}>
                <div className="flex items-center justify-between w-full">
                  <span>Popularity</span>
                  {currentSort.field === 'popularity' && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setCurrentSort({ 
                  ...currentSort, 
                  direction: currentSort.direction === 'asc' ? 'desc' : 'asc' 
                })}
              >
                <div className="flex items-center">
                  {currentSort.direction === 'asc' ? (
                    <>
                      <SortAsc className="mr-2 h-4 w-4" />
                      <span>Ascending</span>
                    </>
                  ) : (
                    <>
                      <SortDesc className="mr-2 h-4 w-4" />
                      <span>Descending</span>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {filtersActive && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{filters.search}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ search: "" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.capacity[0] > 1 || filters.capacity[1] < 50) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {filters.capacity[0]}-{filters.capacity[1]} people
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ capacity: [1, 50] })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {filters.location}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ location: "" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.availableDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(filters.availableDate, "MMM d, yyyy")}
              {(filters.availableTimeStart && filters.availableTimeEnd) && (
                <span className="ml-1">
                  {filters.availableTimeStart} - {filters.availableTimeEnd}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ 
                  availableDate: undefined, 
                  availableTimeStart: undefined, 
                  availableTimeEnd: undefined 
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.availableNow && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              Available Now
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ availableNow: false })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.availableToday && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sun className="h-3 w-3 text-orange-500" />
              Available Today
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => updateFilters({ availableToday: false })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.amenities.map(amenity => (
            <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
              {amenity.includes("Video") && <Video className="h-3 w-3" />}
              {amenity.includes("TV") && <Monitor className="h-3 w-3" />}
              {amenity.includes("Wi-Fi") && <Wifi className="h-3 w-3" />}
              {amenity.includes("Coffee") && <Coffee className="h-3 w-3" />}
              {amenity.includes("Whiteboard") && <FileText className="h-3 w-3" />}
              {!amenity.includes("Video") && !amenity.includes("TV") && 
               !amenity.includes("Wi-Fi") && !amenity.includes("Coffee") && 
               !amenity.includes("Whiteboard") && <Check className="h-3 w-3" />}
              {amenity}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => toggleAmenity(amenity)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
