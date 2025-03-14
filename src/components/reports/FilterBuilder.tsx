
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FilterBuilderProps {
  dimensions: string[];
  metrics: string[];
  onFiltersChange: (filters: Record<string, any>) => void;
}

type Operator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';

interface Filter {
  id: string;
  field: string;
  operator: Operator;
  value: string | string[] | number | [number, number];
}

export function FilterBuilder({ dimensions, metrics, onFiltersChange }: FilterBuilderProps) {
  const [filters, setFilters] = useState<Filter[]>([]);
  
  const allFields = [...dimensions, ...metrics];
  
  const addFilter = () => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      field: allFields.length > 0 ? allFields[0] : '',
      operator: 'equals',
      value: '',
    };
    
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    updateFilters(updatedFilters);
  };
  
  const removeFilter = (id: string) => {
    const updatedFilters = filters.filter(filter => filter.id !== id);
    setFilters(updatedFilters);
    updateFilters(updatedFilters);
  };
  
  const updateFilter = (id: string, updates: Partial<Filter>) => {
    const updatedFilters = filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    );
    setFilters(updatedFilters);
    updateFilters(updatedFilters);
  };
  
  const updateFilters = (updatedFilters: Filter[]) => {
    const filtersObj = updatedFilters.reduce((acc, filter) => {
      acc[filter.field] = { 
        operator: filter.operator, 
        value: filter.value 
      };
      return acc;
    }, {} as Record<string, any>);
    
    onFiltersChange(filtersObj);
  };
  
  const getOperators = (field: string): { value: Operator; label: string }[] => {
    if (metrics.includes(field)) {
      return [
        { value: 'equals', label: 'Equal to' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
        { value: 'between', label: 'Between' },
      ];
    } else {
      return [
        { value: 'equals', label: 'Equal to' },
        { value: 'contains', label: 'Contains' },
        { value: 'in', label: 'In list' },
      ];
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-md">
      {filters.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          No filters added yet. Click the button below to add a filter.
        </div>
      )}
      
      {filters.map((filter, index) => (
        <div key={filter.id} className="flex items-center gap-2 pb-4 border-b">
          <div className="flex-1 grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(filter.id, { field: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium">Dimensions</div>
                      {dimensions.map(dim => (
                        <SelectItem key={dim} value={dim}>
                          {dim}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {metrics.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium">Metrics</div>
                      {metrics.map(metric => (
                        <SelectItem key={metric} value={metric}>
                          {metric}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-3">
              <Select
                value={filter.operator}
                onValueChange={(value) => 
                  updateFilter(filter.id, { operator: value as Operator })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getOperators(filter.field).map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-5">
              <Input
                placeholder="Value"
                value={
                  typeof filter.value === 'object' ? 
                    Array.isArray(filter.value) ? 
                      filter.value.join(', ') : 
                      JSON.stringify(filter.value) : 
                    filter.value.toString()
                }
                onChange={(e) => {
                  let value: string | number | string[] = e.target.value;
                  
                  // Handle numeric values for metrics
                  if (metrics.includes(filter.field)) {
                    if (filter.operator === 'between') {
                      // Parse comma-separated values for 'between' operator
                      const parts = e.target.value.split(',').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
                      value = parts.length === 2 ? ([parts[0].toString(), parts[1].toString()] as string[]) : ['0', '0'];
                    } else {
                      // For single numeric values
                      const num = parseFloat(e.target.value);
                      value = !isNaN(num) ? num.toString() : '0';
                    }
                  } else if (filter.operator === 'in') {
                    // Parse comma-separated values for 'in' operator
                    value = e.target.value.split(',').map(v => v.trim());
                  }
                  
                  updateFilter(filter.id, { value });
                }}
              />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => removeFilter(filter.id)}
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={addFilter}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Filter
      </Button>
      
      {filters.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <Badge key={filter.id} variant="outline" className="px-2 py-1">
                {filter.field} {filter.operator.replace(/_/g, ' ')} {
                  typeof filter.value === 'object' ? 
                    JSON.stringify(filter.value) : 
                    filter.value.toString()
                }
                <button 
                  className="ml-2 text-muted-foreground hover:text-foreground"
                  onClick={() => removeFilter(filter.id)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
