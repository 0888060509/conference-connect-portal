
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveSearchDialogProps {
  newSearchName: string;
  setNewSearchName: (name: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function SaveSearchDialog({ 
  newSearchName, 
  setNewSearchName, 
  onCancel, 
  onSave 
}: SaveSearchDialogProps) {
  return (
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
