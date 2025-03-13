
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { AmenityIcon } from "../AmenityIcon";
import { Amenity, AmenityBundle } from "@/services/amenities";

interface BundleCardProps {
  bundle: AmenityBundle;
  amenities: Amenity[];
  onEdit: (bundle: AmenityBundle) => void;
  onDelete: (bundle: AmenityBundle) => void;
}

export function BundleCard({ bundle, amenities, onEdit, onDelete }: BundleCardProps) {
  // Get amenity names for a bundle
  const getAmenityNames = (amenityIds: string[]) => {
    return amenityIds.map(id => {
      const amenity = amenities.find(a => a.id === id);
      return amenity ? amenity.name : "Unknown";
    });
  };
  
  return (
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
              <DropdownMenuItem onClick={() => onEdit(bundle)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(bundle)}
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
  );
}
