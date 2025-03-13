
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AmenityIcon } from "./AmenityIcon";
import { 
  getAmenityBundles, 
  getAmenities, 
  deleteAmenityBundle 
} from "@/services/amenities";
import { BundleDialog } from "./BundleDialog";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Package, 
  Edit, 
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function BundleManagement() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<any | null>(null);

  const { data: bundles = [], isLoading, refetch } = useQuery({
    queryKey: ['amenityBundles'],
    queryFn: getAmenityBundles
  });

  const { data: amenities = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  });

  const filteredBundles = bundles.filter(bundle => 
    bundle.name.toLowerCase().includes(search.toLowerCase()) ||
    bundle.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddEdit = (bundle: any | null) => {
    setEditBundle(bundle);
    setDialogOpen(true);
  };

  const handleDelete = (bundle: any) => {
    setBundleToDelete(bundle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bundleToDelete) return;
    
    try {
      await deleteAmenityBundle(bundleToDelete.id);
      toast({
        title: "Bundle deleted",
        description: `${bundleToDelete.name} has been removed successfully.`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the bundle.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setBundleToDelete(null);
    }
  };

  // Get amenity names for a bundle
  const getAmenityNames = (amenityIds: string[]) => {
    return amenityIds.map(id => {
      const amenity = amenities.find(a => a.id === id);
      return amenity ? amenity.name : "Unknown";
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bundles..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => handleAddEdit(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bundle
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading bundles...</p>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-muted/20">
          <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
          <p className="mt-2 text-muted-foreground">No equipment bundles found</p>
          <Button onClick={() => handleAddEdit(null)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Bundle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBundles.map((bundle) => (
            <Card key={bundle.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <AmenityIcon icon={bundle.icon} className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAddEdit(bundle)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(bundle)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{bundle.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-medium mb-2">Included Amenities:</h4>
                <div className="flex flex-wrap gap-2">
                  {getAmenityNames(bundle.amenityIds).map((name, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-sm text-muted-foreground">
                  {bundle.amenityIds.length} item{bundle.amenityIds.length !== 1 ? 's' : ''}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <BundleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bundle={editBundle}
        amenities={amenities}
        onSuccess={() => {
          refetch();
          setEditBundle(null);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bundleToDelete?.name}"? This action cannot be undone.
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
