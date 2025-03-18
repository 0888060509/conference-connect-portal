
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar, Search, Filter, X, Users, Building, LayoutGrid } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RoomFilter } from "@/services/BookingService";

interface RoomSearchFormProps {
  onSearch: (filters: RoomFilter) => void;
}

export function RoomSearchForm({ onSearch }: RoomSearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Generate time options from 8:00 to 20:00
  const timeOptions = Array.from({ length: 25 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const form = useForm<RoomFilter>({
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00"
    }
  });

  const handleSubmit = (data: RoomFilter) => {
    onSearch(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-2 flex-1">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem 
                          key={time} 
                          value={time}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => {
                        const startTime = form.getValues("startTime");
                        return (
                          <SelectItem 
                            key={time} 
                            value={time}
                            disabled={time <= startTime}
                          >
                            {time}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          
          <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
          
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Find Rooms
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Min capacity"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                        min={1}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Building name"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <LayoutGrid className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        placeholder="Floor number"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  );
}
