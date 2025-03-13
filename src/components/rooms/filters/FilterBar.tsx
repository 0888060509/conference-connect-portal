
import { Search, X, Sliders, Heart, ChevronDown, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FilterPopover } from "./FilterPopover";
import { SavedSearchesDropdown } from "./SavedSearchesDropdown";
import { SortDropdown } from "./SortDropdown";
import { ActiveFilters } from "./ActiveFilters";
import { RoomFilters, SortOption } from "../RoomFilters";

interface FilterBarProps {
  filters: RoomFilters;
  updateFilters: (updatedValues: Partial<RoomFilters>) => void;
  clearAllFilters: () => void;
  filtersActive: boolean;
  currentView: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  savedSearches: Array<{ id: string; name: string; filters: RoomFilters }>;
  setSavedSearches: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; filters: RoomFilters }>>>;
  loadSavedSearch: (search: { id: string; name: string; filters: RoomFilters }) => void;
  locations: string[];
  allAmenities: string[];
}

export function FilterBar({
  filters,
  updateFilters,
  clearAllFilters,
  filtersActive,
  currentView,
  onViewChange,
  currentSort,
  onSortChange,
  savedSearches,
  setSavedSearches,
  loadSavedSearch,
  locations,
  allAmenities
}: FilterBarProps) {
  
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
          <FilterPopover 
            filters={filters}
            updateFilters={updateFilters}
            clearAllFilters={clearAllFilters}
            filtersActive={filtersActive}
            locations={locations}
            allAmenities={allAmenities}
          />

          {/* Saved searches */}
          {savedSearches.length > 0 && (
            <SavedSearchesDropdown 
              savedSearches={savedSearches}
              setSavedSearches={setSavedSearches}
              loadSavedSearch={loadSavedSearch}
            />
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
          <SortDropdown 
            currentSort={currentSort} 
            onSortChange={onSortChange} 
          />
        </div>
      </div>

      {/* Active filters display */}
      {filtersActive && (
        <ActiveFilters 
          filters={filters}
          updateFilters={updateFilters}
          clearAllFilters={clearAllFilters}
        />
      )}
    </div>
  );
}
