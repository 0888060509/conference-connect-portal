
import { Heart, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomFilters } from "../RoomFilters";

interface SavedSearchesDropdownProps {
  savedSearches: Array<{ id: string; name: string; filters: RoomFilters }>;
  setSavedSearches: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; filters: RoomFilters }>>>;
  loadSavedSearch: (search: { id: string; name: string; filters: RoomFilters }) => void;
}

export function SavedSearchesDropdown({ 
  savedSearches, 
  setSavedSearches, 
  loadSavedSearch 
}: SavedSearchesDropdownProps) {
  // Handle deleting a saved search
  const deleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSearches(savedSearches.filter(search => search.id !== id));
  };

  return (
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
  );
}
