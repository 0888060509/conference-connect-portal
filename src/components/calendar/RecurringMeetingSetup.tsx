import React, { useState, useEffect } from "react";
import { addDays, addWeeks, addMonths, format, isSameDay, isWithinInterval, parseISO, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarIcon,
  Check,
  Clock,
  Repeat,
  CalendarDays,
  CalendarClock,
  X,
  Calendar as CalendarLucide,
  AlertCircle,
  Infinity,
  CalendarX,
  CalendarRange,
  Sliders,
  Pencil,
  Trash2,
  Copy,
  Timer,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const MAX_RECURRING_INSTANCES = 52;
const DAYS_OF_WEEK = [
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
  { value: "SU", label: "Sunday" },
];
const MONTHLY_OPTIONS = [
  { value: "dayOfMonth", label: "On day of month" },
  { value: "dayOfWeek", label: "On day of week" },
];
const END_RECURRENCE_OPTIONS = [
  { value: "afterDate", label: "End by date" },
  { value: "afterOccurrences", label: "End after number of occurrences" },
  { value: "never", label: "No end date" },
];
const BLACKOUT_DATES = [
  new Date(2023, 11, 25),
  new Date(2024, 0, 1),
  new Date(2024, 4, 27),
  new Date(2024, 6, 4),
];

export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval: number;
  weekdays?: string[];
  monthlyOption?: "dayOfMonth" | "dayOfWeek";
  endType: "afterDate" | "afterOccurrences" | "never";
  endDate?: Date;
  occurrences?: number;
  exceptionDates: Date[];
}

export interface RecurringMeetingSetupProps {
  startDate: Date;
  startTime: string;
  endTime: string;
  existingBookings?: Array<{
    start: string;
    end: string;
    roomId: string;
  }>;
  roomId: string;
  onPatternChange: (pattern: RecurrencePattern) => void;
  maxOccurrences?: number;
  isEnabled: boolean;
  currentTimezone?: string;
}

export function RecurringMeetingSetup({
  startDate,
  startTime,
  endTime,
  existingBookings = [],
  roomId,
  onPatternChange,
  maxOccurrences = MAX_RECURRING_INSTANCES,
  isEnabled,
  currentTimezone = "UTC"
}: RecurringMeetingSetupProps) {
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    type: "weekly",
    interval: 1,
    weekdays: [DAYS_OF_WEEK[startDate.getDay() === 0 ? 6 : startDate.getDay() - 1].value],
    monthlyOption: "dayOfMonth",
    endType: "afterOccurrences",
    occurrences: 10,
    exceptionDates: [],
  });

  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [conflictDates, setConflictDates] = useState<Date[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [ruleDescription, setRuleDescription] = useState("");

  useEffect(() => {
    if (!isEnabled) {
      setPreviewDates([]);
      setConflictDates([]);
      return;
    }

    const dates = generateOccurrences(recurrencePattern, startDate);
    setPreviewDates(dates);
    
    const conflicts = findConflicts(dates, existingBookings, roomId, startTime, endTime);
    setConflictDates(conflicts);
    
    const description = generateRuleDescription(recurrencePattern, startDate);
    setRuleDescription(description);
    
    onPatternChange(recurrencePattern);
  }, [recurrencePattern, startDate, isEnabled, existingBookings, roomId, startTime, endTime, onPatternChange]);

  const handlePatternChange = (changes: Partial<RecurrencePattern>) => {
    const newPattern = { ...recurrencePattern, ...changes };
    
    if (newPattern.endType === "afterOccurrences" && 
        newPattern.occurrences && 
        newPattern.occurrences > maxOccurrences) {
      toast({
        title: "Too many occurrences",
        description: `The maximum number of occurrences is ${maxOccurrences}`,
        variant: "destructive"
      });
      newPattern.occurrences = maxOccurrences;
    }
    
    setRecurrencePattern(newPattern);
  };

  const toggleExceptionDate = (date: Date) => {
    const exceptions = [...recurrencePattern.exceptionDates];
    const exists = exceptions.some(d => isSameDay(d, date));
    
    if (exists) {
      handlePatternChange({
        exceptionDates: exceptions.filter(d => !isSameDay(d, date))
      });
    } else {
      handlePatternChange({ 
        exceptionDates: [...exceptions, date] 
      });
    }
  };

  const generateRuleDescription = (pattern: RecurrencePattern, baseDate: Date): string => {
    let description = "";
    
    switch (pattern.type) {
      case "daily":
        description = pattern.interval === 1 
          ? "Occurs every day" 
          : `Occurs every ${pattern.interval} days`;
        break;
      case "weekly":
        if (pattern.interval === 1) {
          if (pattern.weekdays?.length === 1) {
            const day = DAYS_OF_WEEK.find(d => d.value === pattern.weekdays?.[0])?.label;
            description = `Occurs every ${day}`;
          } else if (pattern.weekdays?.length) {
            const days = pattern.weekdays.map(d => 
              DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)
            ).join(", ");
            description = `Occurs every week on ${days}`;
          }
        } else {
          if (pattern.weekdays?.length === 1) {
            const day = DAYS_OF_WEEK.find(d => d.value === pattern.weekdays?.[0])?.label;
            description = `Occurs every ${pattern.interval} weeks on ${day}`;
          } else if (pattern.weekdays?.length) {
            const days = pattern.weekdays.map(d => 
              DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)
            ).join(", ");
            description = `Occurs every ${pattern.interval} weeks on ${days}`;
          }
        }
        break;
      case "monthly":
        if (pattern.monthlyOption === "dayOfMonth") {
          const dayOfMonth = baseDate.getDate();
          description = pattern.interval === 1
            ? `Occurs on day ${dayOfMonth} of every month`
            : `Occurs on day ${dayOfMonth} of every ${pattern.interval} months`;
        } else {
          const weekNum = Math.ceil(baseDate.getDate() / 7);
          const weekText = ["first", "second", "third", "fourth", "last"][
            Math.min(weekNum - 1, 4)
          ];
          const dayName = DAYS_OF_WEEK[baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1].label;
          
          description = pattern.interval === 1
            ? `Occurs on the ${weekText} ${dayName} of every month`
            : `Occurs on the ${weekText} ${dayName} of every ${pattern.interval} months`;
        }
        break;
      case "custom":
        description = "Custom recurrence pattern";
        break;
    }
    
    if (pattern.endType === "afterDate" && pattern.endDate) {
      description += ` until ${format(pattern.endDate, "MMMM d, yyyy")}`;
    } else if (pattern.endType === "afterOccurrences" && pattern.occurrences) {
      description += `, ${pattern.occurrences} times`;
    } else {
      description += " (no end date)";
    }
    
    if (pattern.exceptionDates.length > 0) {
      const exceptionsText = pattern.exceptionDates.length === 1 
        ? "1 exception date" 
        : `${pattern.exceptionDates.length} exception dates`;
        
      description += ` with ${exceptionsText}`;
    }
    
    return description;
  };

  const generateOccurrences = (pattern: RecurrencePattern, baseDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(baseDate);
    let occurrenceCount = 0;
    
    const shouldContinue = () => {
      if (pattern.endType === "afterDate" && pattern.endDate) {
        return currentDate <= pattern.endDate;
      } else if (pattern.endType === "afterOccurrences" && pattern.occurrences) {
        return occurrenceCount < pattern.occurrences;
      } else if (pattern.endType === "never") {
        return occurrenceCount < maxOccurrences;
      }
      return false;
    };
    
    dates.push(new Date(baseDate));
    occurrenceCount++;
    
    while (shouldContinue() && occurrenceCount < maxOccurrences) {
      switch (pattern.type) {
        case "daily":
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case "weekly":
          if (pattern.weekdays && pattern.weekdays.length > 1) {
            const currentDayValue = DAYS_OF_WEEK[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1].value;
            const currentDayIndex = pattern.weekdays.indexOf(currentDayValue);
            
            if (currentDayIndex < pattern.weekdays.length - 1) {
              const nextDayValue = pattern.weekdays[currentDayIndex + 1];
              const nextDayIndex = DAYS_OF_WEEK.findIndex(d => d.value === nextDayValue);
              const daysToAdd = (nextDayIndex + 1) % 7 - (currentDate.getDay() === 0 ? 7 : currentDate.getDay());
              currentDate = addDays(currentDate, daysToAdd > 0 ? daysToAdd : daysToAdd + 7);
            } else {
              currentDate = addWeeks(currentDate, pattern.interval);
              const firstDayValue = pattern.weekdays[0];
              const firstDayIndex = DAYS_OF_WEEK.findIndex(d => d.value === firstDayValue);
              const daysToAdd = (firstDayIndex + 1) % 7 - (currentDate.getDay() === 0 ? 7 : currentDate.getDay());
              currentDate = addDays(currentDate, daysToAdd > 0 ? daysToAdd : daysToAdd + 7);
            }
          } else {
            currentDate = addWeeks(currentDate, pattern.interval);
          }
          break;
        case "monthly":
          currentDate = addMonths(currentDate, pattern.interval);
          break;
        case "custom":
          currentDate = addWeeks(currentDate, pattern.interval);
          break;
      }
      
      if (!pattern.exceptionDates.some(d => isSameDay(d, currentDate))) {
        dates.push(new Date(currentDate));
        occurrenceCount++;
      }
    }
    
    return dates;
  };

  const findConflicts = (
    dates: Date[], 
    bookings: Array<{start: string, end: string, roomId: string}>, 
    currentRoomId: string,
    eventStartTime: string,
    eventEndTime: string
  ): Date[] => {
    return dates.filter(date => {
      const [startHour, startMinute] = eventStartTime.split(":").map(Number);
      const [endHour, endMinute] = eventEndTime.split(":").map(Number);
      
      const eventStart = setMinutes(setHours(new Date(date), startHour), startMinute);
      const eventEnd = setMinutes(setHours(new Date(date), endHour), endMinute);
      
      return bookings.some(booking => {
        if (booking.roomId !== currentRoomId) return false;
        
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        
        return (
          (eventStart < bookingEnd && eventEnd > bookingStart) ||
          (bookingStart < eventEnd && bookingEnd > eventStart)
        );
      });
    });
  };

  const isDateInArray = (date: Date, dateArray: Date[]): boolean => {
    return dateArray.some(d => isSameDay(d, date));
  };

  if (!isEnabled) return null;

  return (
    <div className="space-y-6 mt-4 border-t pt-4">
      <div className="flex items-center">
        <Repeat className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-medium">Recurring Meeting Setup</h3>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Recurrence Pattern</CardTitle>
          <CardDescription>Define how often this meeting repeats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recurrence Type</Label>
            <RadioGroup 
              value={recurrencePattern.type} 
              onValueChange={(value) => 
                handlePatternChange({ 
                  type: value as RecurrencePattern["type"],
                  weekdays: value === "weekly" 
                    ? [DAYS_OF_WEEK[startDate.getDay() === 0 ? 6 : startDate.getDay() - 1].value] 
                    : undefined
                })
              }
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="flex items-center cursor-pointer">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Daily
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="flex items-center cursor-pointer">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Weekly
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex items-center cursor-pointer">
                  <CalendarLucide className="h-4 w-4 mr-1" />
                  Monthly
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex items-center cursor-pointer">
                  <Sliders className="h-4 w-4 mr-1" />
                  Custom
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Repeat every</Label>
              <div className="flex items-center">
                <Input 
                  type="number" 
                  min={1} 
                  max={100}
                  value={recurrencePattern.interval}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0 && value <= 100) {
                      handlePatternChange({ interval: value });
                    }
                  }}
                  className="w-20 mr-2"
                />
                <span className="text-muted-foreground">
                  {recurrencePattern.type === "daily" && "day(s)"}
                  {recurrencePattern.type === "weekly" && "week(s)"}
                  {recurrencePattern.type === "monthly" && "month(s)"}
                  {recurrencePattern.type === "custom" && "interval(s)"}
                </span>
              </div>
            </div>
            
            {recurrencePattern.type === "weekly" && (
              <div className="space-y-2 col-span-2">
                <Label>On these days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={recurrencePattern.weekdays?.includes(day.value) ? "default" : "outline"}
                      className="h-8 px-3"
                      onClick={() => {
                        const weekdays = [...(recurrencePattern.weekdays || [])];
                        if (weekdays.includes(day.value)) {
                          if (weekdays.length > 1) {
                            handlePatternChange({ 
                              weekdays: weekdays.filter(d => d !== day.value) 
                            });
                          }
                        } else {
                          handlePatternChange({ 
                            weekdays: [...weekdays, day.value] 
                          });
                        }
                      }}
                    >
                      {day.label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {recurrencePattern.type === "monthly" && (
              <div className="space-y-2 col-span-2">
                <Label>Monthly options</Label>
                <RadioGroup 
                  value={recurrencePattern.monthlyOption || "dayOfMonth"} 
                  onValueChange={(value) => 
                    handlePatternChange({ 
                      monthlyOption: value as "dayOfMonth" | "dayOfWeek" 
                    })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dayOfMonth" id="dayOfMonth" />
                    <Label htmlFor="dayOfMonth" className="cursor-pointer">
                      Day {startDate.getDate()} of the month
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dayOfWeek" id="dayOfWeek" />
                    <Label htmlFor="dayOfWeek" className="cursor-pointer">
                      The {["first", "second", "third", "fourth", "last"][
                        Math.min(Math.ceil(startDate.getDate() / 7) - 1, 4)
                      ]} {DAYS_OF_WEEK[startDate.getDay() === 0 ? 6 : startDate.getDay() - 1].label} of the month
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>End Recurrence</Label>
            <RadioGroup 
              value={recurrencePattern.endType} 
              onValueChange={(value) => 
                handlePatternChange({ 
                  endType: value as RecurrencePattern["endType"] 
                })
              }
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afterOccurrences" id="afterOccurrences" />
                <div className="flex items-center">
                  <Label htmlFor="afterOccurrences" className="mr-2 cursor-pointer">
                    End after
                  </Label>
                  <Input 
                    type="number" 
                    min={1}
                    max={maxOccurrences}
                    value={recurrencePattern.occurrences || 10}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0 && value <= maxOccurrences) {
                        handlePatternChange({ 
                          occurrences: value,
                          endType: "afterOccurrences"
                        });
                      }
                    }}
                    className="w-20 mr-2"
                    disabled={recurrencePattern.endType !== "afterOccurrences"}
                  />
                  <span className="text-muted-foreground">occurrence(s)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afterDate" id="afterDate" />
                <div className="flex items-center">
                  <Label htmlFor="afterDate" className="mr-2 cursor-pointer">
                    End by
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !recurrencePattern.endDate && "text-muted-foreground"
                        )}
                        disabled={recurrencePattern.endType !== "afterDate"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurrencePattern.endDate
                          ? format(recurrencePattern.endDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recurrencePattern.endDate}
                        onSelect={(date) => {
                          if (date) {
                            handlePatternChange({ 
                              endDate: date,
                              endType: "afterDate"
                            });
                          }
                        }}
                        initialFocus
                        disabled={(date) => date < startDate}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="flex items-center cursor-pointer">
                  <Infinity className="h-4 w-4 mr-1" />
                  No end date (limited to {maxOccurrences} occurrences)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center">
              <CalendarX className="h-4 w-4 mr-2" />
              Exception Dates
            </CardTitle>
            <CardDescription>
              Exclude specific dates from the recurrence pattern
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select dates to exclude</Label>
              <p className="text-sm text-muted-foreground">
                Click on dates in the preview calendar below to exclude them from the recurring pattern.
              </p>
            </div>
            
            {recurrencePattern.exceptionDates.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {recurrencePattern.exceptionDates.map((date, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 pl-2">
                    {format(date, "MMM d, yyyy")}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-destructive"
                      onClick={() => toggleExceptionDate(date)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center">
              <CalendarRange className="h-4 w-4 mr-2" />
              Preview
            </CardTitle>
            {conflictDates.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {conflictDates.length} conflict{conflictDates.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <CardDescription>
            {ruleDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-3">
            <Calendar
              mode="multiple"
              selected={previewDates}
              onSelect={(date) => {
                if (date && previewDates.some(d => isSameDay(d, date))) {
                  toggleExceptionDate(date);
                }
              }}
              className="pointer-events-auto"
              modifiers={{
                conflict: (date) => isDateInArray(date, conflictDates),
                exception: (date) => isDateInArray(date, recurrencePattern.exceptionDates),
                blackout: (date) => isDateInArray(date, BLACKOUT_DATES),
              }}
              modifiersClassNames={{
                conflict: "bg-destructive/20 text-destructive-foreground border border-destructive",
                exception: "line-through text-muted-foreground border border-muted",
                blackout: "bg-muted/50 text-muted-foreground",
              }}
            />
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-primary mr-2" />
              <span>Regular occurrence</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-destructive/20 border border-destructive mr-2" />
              <span>Scheduling conflict</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm border border-muted mr-2" />
              <span>Exception date</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-muted/50 mr-2" />
              <span>Unavailable date</span>
            </div>
          </div>
          
          {conflictDates.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/50"
                onClick={() => setShowConflicts(!showConflicts)}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {showConflicts ? "Hide conflict details" : "Show conflict details"}
              </Button>
              
              {showConflicts && (
                <div className="mt-2 p-3 border border-destructive/50 rounded-md bg-destructive/10">
                  <h4 className="text-sm font-medium mb-2">Conflicts detected:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {conflictDates.map((date, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <X className="h-3 w-3 text-destructive mr-2" />
                        <span>{format(date, "EEEE, MMMM d, yyyy")} at {startTime}-{endTime}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-2">
                    These dates already have bookings that conflict with your recurring meeting.
                    Consider adding them as exception dates.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      handlePatternChange({
                        exceptionDates: [
                          ...recurrencePattern.exceptionDates,
                          ...conflictDates.filter(
                            date => !recurrencePattern.exceptionDates.some(
                              d => isSameDay(d, date)
                            )
                          )
                        ]
                      });
                      setShowConflicts(false);
                    }}
                  >
                    Add all conflicts as exceptions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-options">
          <AccordionTrigger className="text-md">
            <div className="flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              Advanced Options
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Pencil className="h-4 w-4 mr-2" />
                  Allow modifying individual occurrences
                </Label>
                <Switch 
                  checked={true} 
                  disabled 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Enable series cancellation
                </Label>
                <Switch 
                  checked={true} 
                  disabled 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Save as recurring template
                </Label>
                <Switch />
              </div>
            </div>
            
            <div className="pt-2">
              <Label className="mb-2 block">Series naming convention</Label>
              <Input 
                placeholder="Meeting series name" 
                defaultValue={`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} Recurring Meeting`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                This name will help identify this series of meetings
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="bg-muted/30 p-4 rounded-md flex items-start">
        <Info className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium">About this recurring meeting</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {ruleDescription}
          </p>
          {conflictDates.length > 0 && (
            <p className="text-sm text-destructive mt-1">
              Warning: {conflictDates.length} instance{conflictDates.length !== 1 ? 's' : ''} of this meeting conflict{conflictDates.length === 1 ? 's' : ''} with existing bookings.
            </p>
          )}
          {previewDates.length === maxOccurrences && (
            <p className="text-sm text-amber-500 mt-1">
              Note: This series has reached the maximum allowed {maxOccurrences} occurrences.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
