
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data - in a real app this would come from your data API
const AVAILABLE_METRICS = [
  { id: "usage_percent", name: "Usage Percentage", unit: "%" },
  { id: "hours_booked", name: "Hours Booked", unit: "hours" },
  { id: "bookings_count", name: "Number of Bookings", unit: "count" },
  { id: "avg_duration", name: "Average Meeting Duration", unit: "minutes" },
  { id: "total_cost", name: "Total Cost", unit: "currency" },
  { id: "cost_per_hour", name: "Cost per Hour", unit: "currency/hour" },
  { id: "peak_usage", name: "Peak Usage", unit: "%" },
  { id: "capacity_utilization", name: "Capacity Utilization", unit: "%" },
  { id: "no_show_rate", name: "No-Show Rate", unit: "%" },
  { id: "cancellation_rate", name: "Cancellation Rate", unit: "%" },
];

const AVAILABLE_DIMENSIONS = [
  { id: "room", name: "Room", type: "category" },
  { id: "day", name: "Day", type: "date" },
  { id: "week", name: "Week", type: "date" },
  { id: "month", name: "Month", type: "date" },
  { id: "quarter", name: "Quarter", type: "date" },
  { id: "year", name: "Year", type: "date" },
  { id: "department", name: "Department", type: "category" },
  { id: "floor", name: "Floor", type: "category" },
  { id: "building", name: "Building", type: "category" },
  { id: "capacity", name: "Room Capacity", type: "numeric" },
  { id: "amenities", name: "Amenities", type: "category" },
  { id: "booking_user", name: "Booked By", type: "category" },
];

interface FieldSelectorProps {
  fieldType: "metrics" | "dimensions";
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
}

export function FieldSelector({ fieldType, selectedFields, onFieldsChange }: FieldSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const availableFields = fieldType === "metrics" ? AVAILABLE_METRICS : AVAILABLE_DIMENSIONS;
  
  const filteredFields = availableFields.filter(
    field => field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleToggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      onFieldsChange(selectedFields.filter(id => id !== fieldId));
    } else {
      onFieldsChange([...selectedFields, fieldId]);
    }
  };
  
  const handleClearAll = () => {
    onFieldsChange([]);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${fieldType}...`}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {selectedFields.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Selected {fieldType}</label>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedFields.map(fieldId => {
              const field = availableFields.find(f => f.id === fieldId);
              return (
                <Badge key={fieldId} variant="secondary" className="px-2 py-1">
                  {field?.name || fieldId}
                  <button 
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleToggleField(fieldId)}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Available {fieldType}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-48 border-t">
            <div className="p-3 space-y-3">
              {filteredFields.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleToggleField(field.id)}
                  />
                  <label
                    htmlFor={field.id}
                    className="text-sm flex flex-1 justify-between items-center cursor-pointer"
                  >
                    <span>{field.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {fieldType === "metrics" ? field.unit : field.type}
                    </span>
                  </label>
                </div>
              ))}
              
              {filteredFields.length === 0 && (
                <div className="py-3 text-center text-muted-foreground text-sm">
                  No {fieldType} found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
