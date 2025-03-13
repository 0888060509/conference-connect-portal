
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Database, 
  Download, 
  AlertTriangle, 
  Save,
  Timer,
  RotateCcw,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function MaintenanceSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const toggleMaintenanceMode = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    if (enabled) {
      toast({
        title: "Maintenance mode enabled",
        description: "The system is now in maintenance mode. Users cannot make new bookings.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Maintenance mode disabled",
        description: "The system is now fully operational.",
      });
    }
  };
  
  const runBackup = () => {
    console.log("Running manual backup");
    toast({
      title: "Backup started",
      description: "System backup has been initiated. You will be notified when complete.",
    });
  };
  
  const saveRetentionSettings = () => {
    console.log("Saving data retention settings");
    toast({
      title: "Settings saved",
      description: "Data retention policies have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">System Maintenance</CardTitle>
          </div>
          <CardDescription>
            Schedule system maintenance and manage downtime
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Maintenance Mode</label>
              <p className="text-xs text-muted-foreground">
                Enable to prevent new bookings while performing maintenance
              </p>
            </div>
            <Switch 
              checked={maintenanceMode}
              onCheckedChange={toggleMaintenanceMode}
            />
          </div>
          
          {maintenanceMode && (
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    System is in maintenance mode
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Users cannot create new bookings while maintenance mode is active.
                      Existing bookings are not affected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Scheduled Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance-date">Maintenance Date</Label>
                <Input 
                  id="maintenance-date"
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenance-time">Maintenance Time</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="maintenance-time-start"
                    type="time"
                    className="flex-1"
                  />
                  <span className="flex items-center">to</span>
                  <Input 
                    id="maintenance-time-end"
                    type="time"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Input 
                id="maintenance-message"
                placeholder="System will be unavailable for scheduled maintenance"
              />
              <p className="text-xs text-muted-foreground">
                This message will be displayed to users during the maintenance window
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-notifications">Pre-maintenance Notifications</Label>
              <Switch id="maintenance-notifications" defaultChecked />
            </div>
            <p className="text-xs text-muted-foreground">
              Send notifications to users before scheduled maintenance
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Backup & Restore</CardTitle>
          </div>
          <CardDescription>
            Configure system backup and restoration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Automatic Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-time">Backup Time</Label>
                <Input 
                  id="backup-time"
                  type="time"
                  defaultValue="02:00"
                />
                <p className="text-xs text-muted-foreground">
                  Schedule backups during off-peak hours
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-retention">Backup Retention Period</Label>
              <Select defaultValue="30">
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={runBackup} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Run Manual Backup
              </Button>
              <Button variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore from Backup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Data Retention</CardTitle>
          </div>
          <CardDescription>
            Configure how long different types of data are retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-retention">Booking History Retention</Label>
              <Select defaultValue="365">
                <SelectTrigger id="booking-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">3 months</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                  <SelectItem value="forever">Indefinitely</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How long to keep completed booking records
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-log-retention">User Activity Logs</Label>
              <Select defaultValue="180">
                <SelectTrigger id="user-log-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How long to keep user login and activity records
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-cleanup">Automatic Data Cleanup</Label>
                <Switch id="auto-cleanup" defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically remove data that exceeds retention periods
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={saveRetentionSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Retention Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
