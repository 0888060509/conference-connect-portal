
import { useState, useEffect } from "react";
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
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import { RoomFormDialog } from "./RoomFormDialog";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Room, getRooms, deleteRoom } from "@/services/RoomManagementService";
import { Spinner } from "@/components/ui/spinner";

export function RoomList() {
  // State for room data and operations
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [search, setSearch] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Room>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showPhotos, setShowPhotos] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    setIsRefreshing(false);
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(search.toLowerCase()) ||
    (room.number && room.number.includes(search)) ||
    (room.location && room.location.toLowerCase().includes(search.toLowerCase()))
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
  const handleDeleteConfirm = (id: string) => {
    setRoomToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Handle actual deletion
  const handleDeleteRoom = async () => {
    if (roomToDelete !== null) {
      try {
        await deleteRoom(roomToDelete);
        setRooms(rooms.filter(room => room.id !== roomToDelete));
        setIsDeleteConfirmOpen(false);
        setRoomToDelete(null);
      } catch (err) {
        console.error("Error deleting room:", err);
      }
    }
  };

  // Handle batch deletion
  const handleBatchDelete = async () => {
    try {
      for (const roomId of selectedRooms) {
        await deleteRoom(roomId);
      }
      setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
      toast.success(`${selectedRooms.length} rooms deleted`);
      setSelectedRooms([]);
    } catch (err) {
      console.error("Error batch deleting rooms:", err);
      toast.error("Failed to delete some rooms");
    }
  };

  // Handle room update from edit form
  const handleRoomUpdated = (updatedRoom: Room) => {
    setRooms(rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
    setIsEditOpen(false);
    setEditRoom(null);
  };

  // Handle room created from form
  const handleRoomCreated = (newRoom: Room) => {
    setRooms([...rooms, newRoom]);
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
  const handleSelectRoom = (id: string) => {
    if (selectedRooms.includes(id)) {
      setSelectedRooms(selectedRooms.filter(roomId => roomId !== id));
    } else {
      setSelectedRooms([...selectedRooms, id]);
    }
  };

  // Handle view photos
  const handleViewPhotos = (id: string) => {
    setShowPhotos(id);
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading rooms...</span>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchRooms} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

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
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          
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
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Photos</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
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
                  <TableCell>{room.number || '-'}</TableCell>
                  <TableCell>{room.location || '-'}</TableCell>
                  <TableCell>{room.capacity || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        room.status === 'active' ? "secondary" : 
                        room.status === 'maintenance' ? "warning" : 
                        "destructive"
                      }
                    >
                      {room.status === 'active' ? "Available" : 
                       room.status === 'maintenance' ? "Maintenance" : 
                       "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {room.image_url ? (
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
          <div className="grid grid-cols-1 gap-4 my-4">
            {showPhotos !== null && 
              rooms.find(r => r.id === showPhotos)?.image_url && (
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <img 
                    src={rooms.find(r => r.id === showPhotos)?.image_url} 
                    alt="Room photo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
