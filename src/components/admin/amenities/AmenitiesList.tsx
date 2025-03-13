import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AmenityIcon } from "./AmenityIcon";
import { AmenityDialog } from "./AmenityDialog";
import { Amenity, AmenityType } from "@/services/amenities";
import { 
  getAmenities, 
  getAmenityTypes,
  deleteAmenity,
  updateAmenityStatus
} from "@/services/amenities";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AmenityDetailsDialog } from "./AmenityDetailsDialog";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { IssueDialog } from "./IssueDialog";

export function AmenitiesList() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState<Amenity | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  const { data: amenities = [], isLoading, refetch } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  });

  const { data: amenityTypes = [] } = useQuery({
    queryKey: ['amenityTypes'],
    queryFn: getAmenityTypes
  });

  const filteredAmenities = amenities.filter(amenity => 
    amenity.name.toLowerCase().includes(search.toLowerCase()) ||
    amenity.description.toLowerCase().includes(search.toLowerCase())
  );

  const getAmenityTypeName = (typeId: string) => {
    const type = amenityTypes.find(t => t.id === typeId);
    return type ? type.name : "Unknown Type";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Available
          </Badge>
        );
      case "unavailable":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Unavailable
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Maintenance
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info/20 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const handleAddEdit = (amenity: Amenity | null) => {
    setEditAmenity(amenity);
    setDialogOpen(true);
  };

  const handleDelete = (amenity: Amenity) => {
    setAmenityToDelete(amenity);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!amenityToDelete) return;
    
    try {
      await deleteAmenity(amenityToDelete.id);
      toast({
        title: "Amenity deleted",
        description: `${amenityToDelete.name} has been removed successfully.`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the amenity.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setAmenityToDelete(null);
    }
  };

  const handleStatusChange = async (amenity: Amenity, status: "available" | "unavailable" | "maintenance" | "scheduled") => {
    try {
      await updateAmenityStatus(amenity.id, status);
      toast({
        title: "Status updated",
        description: `${amenity.name} is now ${status}.`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the status.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setDetailsDialogOpen(true);
  };

  const handleAddMaintenance = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setMaintenanceDialogOpen(true);
  };

  const handleReportIssue = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIssueDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search amenities..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleAddEdit(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Amenity
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amenity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead className="hidden md:table-cell">Last Maintained</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading amenities...
                </TableCell>
              </TableRow>
            ) : filteredAmenities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No amenities found
                </TableCell>
              </TableRow>
            ) : (
              filteredAmenities.map((amenity) => (
                <TableRow key={amenity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AmenityIcon icon={amenity.icon} className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{amenity.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {amenity.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getAmenityTypeName(amenity.type)}</TableCell>
                  <TableCell>{getStatusBadge(amenity.status)}</TableCell>
                  <TableCell>{amenity.roomIds.length} room(s)</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {amenity.maintenanceRecords && amenity.maintenanceRecords.length > 0 
                      ? new Date(amenity.maintenanceRecords[amenity.maintenanceRecords.length - 1].date).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(amenity)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddEdit(amenity)}>
                            Edit Amenity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(amenity, "available")}>
                            Set as Available
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(amenity, "unavailable")}>
                            Set as Unavailable
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(amenity, "maintenance")}>
                            Set to Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAddMaintenance(amenity)}>
                            Log Maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReportIssue(amenity)}>
                            Report Issue
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(amenity)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete Amenity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AmenityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        amenity={editAmenity}
        amenityTypes={amenityTypes}
        onSuccess={() => {
          refetch();
          setEditAmenity(null);
        }}
      />

      {selectedAmenity && (
        <>
          <AmenityDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            amenity={selectedAmenity}
            amenityTypes={amenityTypes}
          />

          <MaintenanceDialog
            open={maintenanceDialogOpen}
            onOpenChange={setMaintenanceDialogOpen}
            amenity={selectedAmenity}
            onSuccess={() => {
              refetch();
              setMaintenanceDialogOpen(false);
            }}
          />

          <IssueDialog
            open={issueDialogOpen}
            onOpenChange={setIssueDialogOpen}
            amenity={selectedAmenity}
            onSuccess={() => {
              refetch();
              setIssueDialogOpen(false);
            }}
          />
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Amenity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{amenityToDelete?.name}"? This action cannot be undone
              and will remove this amenity from all assigned rooms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
