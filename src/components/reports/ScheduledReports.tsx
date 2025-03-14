
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getScheduledReports, deleteScheduledReport } from "@/services/reportService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Mail, FileType, Trash, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { ScheduleDialog } from "@/components/reports/ScheduleDialog";

export function ScheduledReports() {
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const { data: scheduledReports, isLoading, error, refetch } = useQuery({
    queryKey: ['scheduledReports'],
    queryFn: getScheduledReports
  });
  
  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteScheduledReport(id);
      toast({
        title: "Schedule deleted",
        description: "The scheduled report has been deleted."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete scheduled report.",
        variant: "destructive"
      });
    }
  };
  
  const handleEditSchedule = (reportId: string) => {
    setSelectedReportId(reportId);
    setScheduleDialogOpen(true);
  };
  
  const formatTime = (timeStr: string) => {
    try {
      // Parse time string like "14:30:00"
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };
  
  if (isLoading) return <div>Loading scheduled reports...</div>;
  if (error) return <div>Error loading scheduled reports</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Scheduled Reports</h2>
      </div>
      
      {scheduledReports && scheduledReports.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReports.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {/* In a real app, this would show the report name */}
                      Report {schedule.report_id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{schedule.frequency}</span>
                        {schedule.time_of_day && (
                          <span className="ml-2 text-muted-foreground">
                            at {formatTime(schedule.time_of_day)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {/* Calculate next run based on frequency */}
                        {new Date().toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {Array.isArray(schedule.recipients) ? schedule.recipients.length : 0} recipients
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileType className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="uppercase">
                          {schedule.export_format}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={schedule.is_active} 
                        // In a real app, this would update the schedule status
                        onCheckedChange={() => {}}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSchedule(schedule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No scheduled reports</CardTitle>
            <CardDescription>
              You haven't scheduled any reports yet. Select a report and set up a schedule for automated delivery.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button disabled>Schedule Report</Button>
          </CardContent>
        </Card>
      )}
      
      {selectedReportId && (
        <ScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          reportId={selectedReportId}
          mode="edit"
        />
      )}
    </div>
  );
}
