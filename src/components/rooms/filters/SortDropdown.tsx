
import { SortAsc, SortDesc, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortOption } from "../RoomFilters";

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  // Handle changing the sort field
  const handleSortChange = (field: SortOption['field']) => {
    const direction: 'asc' | 'desc' = 
      currentSort.field === field && currentSort.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    const newSort: SortOption = { field, direction };
    onSortChange(newSort);
  };

  return (
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
          onClick={() => {
            const direction: 'asc' | 'desc' = currentSort.direction === 'asc' ? 'desc' : 'asc';
            onSortChange({ ...currentSort, direction });
          }}
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
  );
}
