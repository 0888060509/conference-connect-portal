
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReports, deleteReport, exportReport } from "@/services/reportService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { ShareDialog } from "@/components/reports/ShareDialog";
import { ReportFormats } from "@/components/reports/ReportFormats";
import { ScheduleDialog } from "@/components/reports/ScheduleDialog";
import { 
  MoreVertical, 
  FileText, 
  Trash, 
  Edit, 
  Share2, 
  Clock, 
  Star, 
  FileDown, 
  Eye 
} from "lucide-react";
import { Link } from "react-router-dom";

export function MyReports() {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['myReports'],
    queryFn: getReports
  });
  
  const handleViewReport = (reportId: string) => {
    // Navigate to report detail page
    window.location.href = `/reports/${reportId}`;
  };
  
  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      toast({
        title: "Report deleted",
        description: "Report has been deleted successfully."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleExport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportReport(reportId, format);
      toast({
        title: "Export started",
        description: `Your report is being exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report.",
        variant: "destructive"
      });
    }
  };
  
  const handleShare = (reportId: string) => {
    setSelectedReportId(reportId);
    setShareDialogOpen(true);
  };
  
  const handleSchedule = (reportId: string) => {
    setSelectedReportId(reportId);
    setScheduleDialogOpen(true);
  };
  
  if (isLoading) return <div>Loading your reports...</div>;
  if (error) return <div>Error loading reports</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Reports</h2>
        <Link to="/reports/builder">
          <Button>Create Custom Report</Button>
        </Link>
      </div>
      
      {reports && reports.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Export</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        {report.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.last_run_at 
                        ? new Date(report.last_run_at).toLocaleDateString() 
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <ReportFormats
                        onExport={(format) => handleExport(report.id, format)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewReport(report.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(report.id)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSchedule(report.id)}>
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteReport(report.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <CardTitle>No reports yet</CardTitle>
            <CardDescription>
              Create your first report by using a template or the custom report builder.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Link to="/reports?tab=templates">
              <Button variant="outline">Use Template</Button>
            </Link>
            <Link to="/reports/builder">
              <Button>Create Custom Report</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {selectedReportId && (
        <>
          <ShareDialog 
            open={shareDialogOpen} 
            onOpenChange={setShareDialogOpen}
            reportId={selectedReportId}
          />
          <ScheduleDialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
            reportId={selectedReportId}
          />
        </>
      )}
    </div>
  );
}
