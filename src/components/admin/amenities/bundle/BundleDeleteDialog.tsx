
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
import { AmenityBundle } from "@/services/amenities";

interface BundleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: AmenityBundle | null;
  onConfirm: () => void;
}

export function BundleDeleteDialog({ 
  open, 
  onOpenChange, 
  bundle, 
  onConfirm 
}: BundleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{bundle?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
