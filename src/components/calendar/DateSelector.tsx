
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DateSelectorProps {
  date: Date;
  onSelect: (date: Date) => void;
}

export function DateSelector({ date, onSelect }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        initialFocus
        className="rounded-md border"
      />
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedDate(new Date());
            onSelect(new Date());
          }}
        >
          Today
        </Button>
        <Button
          onClick={() => {
            if (selectedDate) {
              onSelect(selectedDate);
            }
          }}
          disabled={!selectedDate}
        >
          Go to Date
        </Button>
      </div>
    </div>
  );
}
