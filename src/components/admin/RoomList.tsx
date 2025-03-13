
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Filter, 
  Search, 
  Trash2, 
  ArrowUpDown,
  Image as ImageIcon,
  X
} from "lucide-react";
import { RoomFormDialog } from "./RoomFormDialog";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Mock room data type
interface Room {
  id: number;
  name: string;
  number: string;
  location: string;
  capacity: number;
  available: boolean;
  amenities: string[];
  maintenanceSchedule: string;
  photos?: string[];
}

export function RoomList() {
  // State for room data and operations
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      name: "Executive Boardroom",
      number: "101",
      location: "1st Floor, Building A",
      capacity: 12,
      available: true,
      amenities: ["Projector", "Video Conferencing", "Whiteboard"],
      maintenanceSchedule: "First Monday of every month",
      photos: ["https://placehold.co/400x300/2C3E50/FFFFFF?text=Executive+Boardroom"]
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
      photos: ["https://placehold.co/400x300/3498DB/FFFFFF?text=Conference+Room"]
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
      photos: ["https://placehold.co/400x300/E74C3C/FFFFFF?text=Meeting+Room"]
    },
  ]);

  // UI state
  const [search, setSearch] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof Room>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showPhotos, setShowPhotos] = useState<number | null>(null);

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(search.toLowerCase()) ||
    room.number.includes(search) ||
    room.location.toLowerCase().includes(search.toLowerCase())
  );

  // Sort rooms based on current sort field and direction
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc' 
        ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
        : (bValue ? 1 : 0) - (aValue ? 1 : 0);
    }
    
    return 0;
  });

  // Handle sort column click
  const handleSort = (field: keyof Room) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle edit room
  const handleEditRoom = (room: Room) => {
    setEditRoom(room);
    setIsEditOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id: number) => {
    setRoomToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Handle actual deletion
  const handleDeleteRoom = () => {
    if (roomToDelete !== null) {
      setRooms(rooms.filter(room => room.id !== roomToDelete));
      toast({
        title: "Room deleted",
        description: "The room has been successfully removed"
      });
      setIsDeleteConfirmOpen(false);
      setRoomToDelete(null);
    }
  };

  // Handle batch deletion
  const handleBatchDelete = () => {
    setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
    toast({
      title: `${selectedRooms.length} rooms deleted`,
      description: "The selected rooms have been removed"
    });
    setSelectedRooms([]);
  };

  // Handle room update from edit form
  const handleRoomUpdated = (updatedRoom: Room) => {
    setRooms(rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
    setIsEditOpen(false);
    setEditRoom(null);
    
    toast({
      title: "Room updated",
      description: "Room details have been updated successfully"
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(filteredRooms.map(room => room.id));
    }
  };

  // Handle individual row selection
  const handleSelectRoom = (id: number) => {
    if (selectedRooms.includes(id)) {
      setSelectedRooms(selectedRooms.filter(roomId => roomId !== id));
    } else {
      setSelectedRooms([...selectedRooms, id]);
    }
  };

  // Handle view photos
  const handleViewPhotos = (id: number) => {
    setShowPhotos(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          
          {selectedRooms.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBatchDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRooms.length})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0} 
                  indeterminate={selectedRooms.length > 0 && selectedRooms.length < filteredRooms.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rooms"
                />
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary"
                  onClick={() => handleSort('name')}
                >
                  Room Name
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary"
                  onClick={() => handleSort('number')}
                >
                  Number
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary"
                  onClick={() => handleSort('location')}
                >
                  Location
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary"
                  onClick={() => handleSort('capacity')}
                >
                  Capacity
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary"
                  onClick={() => handleSort('available')}
                >
                  Status
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              sortedRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRooms.includes(room.id)}
                      onCheckedChange={() => handleSelectRoom(room.id)}
                      aria-label={`Select ${room.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.number}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={room.available ? "success" : "destructive"}>
                      {room.available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 2).map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {room.photos && room.photos.length > 0 ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPhotos(room.id)}
                        className="flex items-center gap-1"
                      >
                        <ImageIcon className="h-4 w-4" />
                        View
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No photos</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditRoom(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteConfirm(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Room Dialog */}
      {editRoom && (
        <RoomFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          room={editRoom}
          mode="edit"
          onSave={handleRoomUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photos Dialog */}
      <Dialog open={showPhotos !== null} onOpenChange={() => setShowPhotos(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Room Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 my-4">
            {showPhotos !== null && rooms.find(r => r.id === showPhotos)?.photos?.map((photo, i) => (
              <div key={i} className="relative aspect-video rounded-md overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Room photo ${i + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
