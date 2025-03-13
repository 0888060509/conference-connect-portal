
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { 
  getAmenityBundles, 
  getAmenities, 
  deleteAmenityBundle,
  AmenityBundle
} from "@/services/amenities";
import { BundleDialog } from "./BundleDialog";
import { 
  BundleList,
  BundleDeleteDialog,
  SearchBar
} from "./bundle";

export function BundleManagement() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<AmenityBundle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<AmenityBundle | null>(null);

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

  const handleAddEdit = (bundle: AmenityBundle | null) => {
    setEditBundle(bundle);
    setDialogOpen(true);
  };

  const handleDelete = (bundle: AmenityBundle) => {
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

  return (
    <div className="space-y-4">
      <SearchBar 
        search={search} 
        onSearchChange={setSearch} 
        onAddClick={() => handleAddEdit(null)} 
      />

      <BundleList 
        bundles={filteredBundles}
        amenities={amenities}
        isLoading={isLoading}
        onAddBundle={() => handleAddEdit(null)}
        onEditBundle={handleAddEdit}
        onDeleteBundle={handleDelete}
      />

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

      <BundleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bundle={bundleToDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
