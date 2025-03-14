
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { ReportExportFormat, ReportFrequency } from "@/types/reports";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getScheduledReportById, createScheduledReport, updateScheduledReport } from "@/services/reportService";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  mode?: "create" | "edit";
}

export function ScheduleDialog({ open, onOpenChange, reportId, mode = "create" }: ScheduleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [frequency, setFrequency] = useState<ReportFrequency>("daily");
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [exportFormat, setExportFormat] = useState<ReportExportFormat>("pdf");
  const [isActive, setIsActive] = useState(true);
  
  // Fetch existing schedule if in edit mode
  const { data: existingSchedule, isLoading } = useQuery({
    queryKey: ['scheduledReport', reportId],
    queryFn: () => getScheduledReportById(reportId),
    enabled: mode === "edit" && open
  });
  
  // Update form with existing data when editing
  useEffect(() => {
    if (existingSchedule && mode === "edit") {
      setFrequency(existingSchedule.frequency);
      if (existingSchedule.time_of_day) {
        setTimeOfDay(existingSchedule.time_of_day.slice(0, 5)); // Format from "09:00:00" to "09:00"
      }
      if (existingSchedule.day_of_week !== null) {
        setDayOfWeek(existingSchedule.day_of_week);
      }
      if (existingSchedule.day_of_month !== null) {
        setDayOfMonth(existingSchedule.day_of_month);
      }
      if (Array.isArray(existingSchedule.recipients)) {
        setEmailRecipients(existingSchedule.recipients.join(", "));
      }
      setExportFormat(existingSchedule.export_format);
      setIsActive(existingSchedule.is_active);
    }
  }, [existingSchedule, mode]);
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast({
        title: "Schedule created",
        description: "Your report has been scheduled successfully."
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule report. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateScheduledReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
      toast({
        title: "Schedule updated",
        description: "Your scheduled report has been updated."
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse email recipients
    const recipients = emailRecipients
      .split(",")
      .map(email => email.trim())
      .filter(email => email);
    
    const scheduleData = {
      report_id: reportId,
      frequency,
      time_of_day: `${timeOfDay}:00`, // Add seconds
      day_of_week: frequency === "weekly" ? dayOfWeek : undefined,
      day_of_month: frequency === "monthly" ? dayOfMonth : undefined,
      recipients,
      export_format: exportFormat,
      is_active: isActive,
    };
    
    if (mode === "create") {
      createMutation.mutate(scheduleData);
    } else if (existingSchedule) {
      updateMutation.mutate({ 
        id: existingSchedule.id, 
        data: scheduleData 
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Schedule Report" : "Edit Schedule"}</DialogTitle>
          <DialogDescription>
            Configure when and how your report will be delivered.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={frequency} 
                onValueChange={(value) => setFrequency(value as ReportFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time">Time of day</Label>
              <Input
                id="time"
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>
            
            {frequency === "weekly" && (
              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select 
                  value={dayOfWeek.toString()} 
                  onValueChange={(value) => setDayOfWeek(parseInt(value))}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {frequency === "monthly" && (
              <div className="grid gap-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Select 
                  value={dayOfMonth.toString()} 
                  onValueChange={(value) => setDayOfMonth(parseInt(value))}
                >
                  <SelectTrigger id="dayOfMonth">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="recipients">Email Recipients</Label>
              <Input
                id="recipients"
                placeholder="email@example.com, another@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="format">Export Format</Label>
              <Select 
                value={exportFormat} 
                onValueChange={(value) => setExportFormat(value as ReportExportFormat)}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Switch 
                id="active" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="active">Schedule is active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {mode === "create" ? "Schedule Report" : "Update Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
