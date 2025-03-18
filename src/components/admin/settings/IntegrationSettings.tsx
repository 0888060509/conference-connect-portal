
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
  CalendarDays, 
  Calendar as CalendarIcon, 
  Save,
  Check,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function IntegrationSettings() {
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [outlookCalendarEnabled, setOutlookCalendarEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  
  const connectGoogleCalendar = () => {
    // This would initiate OAuth flow in a real application
    console.log("Connecting to Google Calendar");
    setGoogleCalendarEnabled(true);
    toast({
      title: "Google Calendar connected",
      description: "Calendar integration has been enabled.",
    });
  };
  
  const connectOutlookCalendar = () => {
    // This would initiate OAuth flow in a real application
    console.log("Connecting to Outlook Calendar");
    setOutlookCalendarEnabled(true);
    toast({
      title: "Outlook Calendar connected",
      description: "Calendar integration has been enabled.",
    });
  };
  
  const connectSlack = () => {
    // This would initiate OAuth flow in a real application
    console.log("Connecting to Slack");
    setSlackEnabled(true);
    toast({
      title: "Slack connected",
      description: "Slack integration has been enabled.",
    });
  };
  
  const saveSettings = () => {
    console.log("Saving integration settings");
    toast({
      title: "Settings saved",
      description: "Integration settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Calendar Integrations</CardTitle>
          </div>
          <CardDescription>
            Connect with external calendar systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Google Calendar</div>
                <div className="text-xs text-muted-foreground">
                  Sync bookings with Google Calendar
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {googleCalendarEnabled ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Connected</span>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </>
                ) : (
                  <Button onClick={connectGoogleCalendar}>
                    Connect Google Calendar
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Microsoft Outlook</div>
                <div className="text-xs text-muted-foreground">
                  Sync bookings with Outlook Calendar
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {outlookCalendarEnabled ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Connected</span>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </>
                ) : (
                  <Button onClick={connectOutlookCalendar}>
                    Connect Outlook Calendar
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {(googleCalendarEnabled || outlookCalendarEnabled) && (
            <div className="border-t pt-6 mt-6 space-y-4">
              <h3 className="text-sm font-medium mb-2">Calendar Sync Settings</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-way-sync">Two-way synchronization</Label>
                  <Switch id="two-way-sync" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Updates in either system will be reflected in the other
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync Interval</Label>
                <Select defaultValue="15">
                  <SelectTrigger id="sync-interval" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-details">Include booking details</Label>
                  <Switch id="include-details" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add meeting details and attendees to calendar events
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Other Integrations</CardTitle>
          </div>
          <CardDescription>
            Connect with additional tools and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Slack</div>
              <div className="text-xs text-muted-foreground">
                Receive booking notifications in Slack
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {slackEnabled ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Connected</span>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </>
              ) : (
                <Button onClick={connectSlack}>
                  Connect Slack
                </Button>
              )}
            </div>
          </div>
          
          {slackEnabled && (
            <div>
              <div className="space-y-2">
                <Label htmlFor="slack-channel">Default Slack Channel</Label>
                <Input 
                  id="slack-channel"
                  defaultValue="#room-bookings"
                  placeholder="Enter channel name"
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch id="slack-notify-all" />
                <Label htmlFor="slack-notify-all" className="cursor-pointer">
                  Notify for all booking events
                </Label>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL for Custom Integrations</Label>
            <Input 
              id="webhook-url"
              placeholder="https://"
            />
            <p className="text-xs text-muted-foreground">
              Use webhooks to integrate with custom systems
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Integration Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
