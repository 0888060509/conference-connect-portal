import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/admin/amenities/MultiSelect";
import { 
  createAmenityBundle, 
  updateAmenityBundle 
} from "@/services/AmenityService";
import { AmenityType, AmenityBundle, Amenity } from "@/types/amenities";
import { Package, Loader2 } from "lucide-react";

export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "yearly"; 
  interval: number; // e.g., every 2 weeks
  weekdays?: number[]; // 0-6, Sunday-Saturday
  monthDay?: number; // day of month for monthly
  endType: "never" | "afterDate" | "afterOccurrences";
  endDate?: Date;
  occurrences?: number; // number of occurrences
  exceptionDates: Date[]; // dates to exclude
}

interface BundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: AmenityBundle | null;
  amenities: Amenity[];
  onSuccess: () => void;
}

export function BundleDialog({ 
  open, 
  onOpenChange, 
  bundle, 
  amenities,
  onSuccess 
}: BundleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("package");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bundle) {
      setName(bundle.name);
      setDescription(bundle.description);
      setIcon(bundle.icon);
      setSelectedAmenities(bundle.amenityIds);
    } else {
      setName("");
      setDescription("");
      setIcon("package");
      setSelectedAmenities([]);
    }
  }, [bundle]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the bundle.",
        variant: "destructive"
      });
      return;
    }

    if (selectedAmenities.length === 0) {
      toast({
        title: "No amenities selected",
        description: "Please select at least one amenity for the bundle.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (bundle) {
        await updateAmenityBundle(bundle.id, {
          name,
          description,
          icon,
          amenityIds: selectedAmenities
        });
        toast({
          title: "Bundle updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        await createAmenityBundle({
          name,
          description,
          icon,
          amenityIds: selectedAmenities
        });
        toast({
          title: "Bundle created",
          description: `${name} has been created successfully.`
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the bundle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{bundle ? 'Edit Bundle' : 'Create Bundle'}</DialogTitle>
          <DialogDescription>
            {bundle 
              ? 'Update the properties of this equipment bundle.'
              : 'Create a new bundle of equipment that can be assigned to rooms.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Bundle Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Conference Room Essentials"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Essential equipment for standard conference rooms"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="package"
            />
            <p className="text-sm text-muted-foreground">
              Use a valid Lucide icon name (e.g., package, presentation, video)
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label>Included Amenities</Label>
            <MultiSelect
              options={amenities.map(a => ({ value: a.id, label: a.name }))}
              selected={selectedAmenities}
              onChange={setSelectedAmenities}
              placeholder="Select amenities to include"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {bundle ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RecurringMeetingSetupProps {
  startDate: Date;
  startTime: string;
  endTime: string;
  roomId: string;
  onPatternChange: (pattern: RecurrencePattern) => void;
  isEnabled: boolean;
  existingBookings: { date: Date; startTime: string; endTime: string }[];
}

export function RecurringMeetingSetup({
  startDate,
  startTime,
  endTime,
  roomId,
  onPatternChange,
  isEnabled,
  existingBookings
}: RecurringMeetingSetupProps) {
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [interval, setInterval] = useState(1);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([startDate.getDay()]);
  const [monthDay, setMonthDay] = useState(startDate.getDate());
  const [endType, setEndType] = useState<"never" | "afterDate" | "afterOccurrences">("afterDate");
  const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000));
  const [occurrences, setOccurrences] = useState(10);
  const [exceptionDates, setExceptionDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!isEnabled) return;

    const pattern: RecurrencePattern = {
      type: recurrenceType,
      interval,
      weekdays: recurrenceType === "weekly" ? selectedWeekdays : undefined,
      monthDay: recurrenceType === "monthly" ? monthDay : undefined,
      endType,
      endDate: endType === "afterDate" ? endDate : undefined,
      occurrences: endType === "afterOccurrences" ? occurrences : undefined,
      exceptionDates
    };

    onPatternChange(pattern);
  }, [
    isEnabled,
    recurrenceType,
    interval,
    selectedWeekdays,
    monthDay,
    endType,
    endDate,
    occurrences,
    exceptionDates,
    onPatternChange
  ]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="space-y-4 border rounded-md p-4 mt-2">
      <h3 className="font-medium">Recurrence Pattern</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Repeats</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            <Button
              type="button"
              variant={recurrenceType === "daily" ? "default" : "outline"}
              className="w-full"
              onClick={() => setRecurrenceType("daily")}
            >
              Daily
            </Button>
            <Button
              type="button"
              variant={recurrenceType === "weekly" ? "default" : "outline"}
              className="w-full"
              onClick={() => setRecurrenceType("weekly")}
            >
              Weekly
            </Button>
            <Button
              type="button"
              variant={recurrenceType === "monthly" ? "default" : "outline"}
              className="w-full"
              onClick={() => setRecurrenceType("monthly")}
            >
              Monthly
            </Button>
            <Button
              type="button"
              variant={recurrenceType === "yearly" ? "default" : "outline"}
              className="w-full"
              onClick={() => setRecurrenceType("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 items-center">
          <Label className="col-span-1">Every</Label>
          <div className="col-span-1">
            <Input
              type="number"
              min={1}
              max={99}
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="col-span-2 text-sm text-muted-foreground">
            {recurrenceType === "daily" && "day(s)"}
            {recurrenceType === "weekly" && "week(s)"}
            {recurrenceType === "monthly" && "month(s)"}
            {recurrenceType === "yearly" && "year(s)"}
          </div>
        </div>
        
        {recurrenceType === "weekly" && (
          <div>
            <Label>Repeat On</Label>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={selectedWeekdays.includes(index) ? "default" : "outline"}
                  className="w-full px-0"
                  onClick={() => {
                    if (selectedWeekdays.includes(index)) {
                      if (selectedWeekdays.length > 1) {
                        setSelectedWeekdays(selectedWeekdays.filter(d => d !== index));
                      }
                    } else {
                      setSelectedWeekdays([...selectedWeekdays, index]);
                    }
                  }}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {recurrenceType === "monthly" && (
          <div>
            <Label>Day of Month</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={monthDay}
              onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
        )}
        
        <div className="space-y-3">
          <Label>Ends</Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="never"
                name="endType"
                className="mr-2"
                checked={endType === "never"}
                onChange={() => setEndType("never")}
              />
              <Label htmlFor="never" className="cursor-pointer">Never</Label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="afterDate"
                name="endType"
                className="mr-2"
                checked={endType === "afterDate"}
                onChange={() => setEndType("afterDate")}
              />
              <Label htmlFor="afterDate" className="cursor-pointer mr-2">On date</Label>
              {endType === "afterDate" && (
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={endDate.toISOString().split('T')[0]}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="afterOccurrences"
                name="endType"
                className="mr-2"
                checked={endType === "afterOccurrences"}
                onChange={() => setEndType("afterOccurrences")}
              />
              <Label htmlFor="afterOccurrences" className="cursor-pointer mr-2">After</Label>
              {endType === "afterOccurrences" && (
                <div className="flex items-center">
                  <Input
                    type="number"
                    className="w-16 mr-2"
                    min={1}
                    max={999}
                    value={occurrences}
                    onChange={(e) => setOccurrences(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-sm text-muted-foreground">occurrence(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
