
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues, FREQUENCY_OPTIONS } from "./types";

interface MaintenanceScheduleFieldsProps {
  form: UseFormReturn<FormValues>;
}

export function MaintenanceScheduleFields({ form }: MaintenanceScheduleFieldsProps) {
  const { register, setValue, watch } = form;
  const selectedFrequency = watch("maintenanceFrequency");

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="maintenanceFrequency">Maintenance Schedule (Optional)</Label>
        <Select
          value={selectedFrequency || ""}
          onValueChange={(value) => setValue("maintenanceFrequency", value as any || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No scheduled maintenance</SelectItem>
            {FREQUENCY_OPTIONS.map((frequency) => (
              <SelectItem key={frequency.value} value={frequency.value}>
                {frequency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedFrequency && (
        <div className="space-y-2">
          <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
          <Input
            id="nextMaintenanceDate"
            type="date"
            {...register("nextMaintenanceDate")}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}
    </>
  );
}
