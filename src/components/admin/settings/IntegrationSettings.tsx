
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
import { Textarea } from "@/components/ui/textarea";
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
  Link as LinkIcon,
  Users,
  Mail,
  FileSpreadsheet,
  Webhook,
  Code,
  MessageSquare
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function IntegrationSettings() {
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [outlookCalendarEnabled, setOutlookCalendarEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [teamsEnabled, setTeamsEnabled] = useState(false);
  const [directoryEnabled, setDirectoryEnabled] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [emailServerEnabled, setEmailServerEnabled] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  
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

  const connectTeams = () => {
    // This would initiate OAuth flow in a real application
    console.log("Connecting to Microsoft Teams");
    setTeamsEnabled(true);
    toast({
      title: "Microsoft Teams connected",
      description: "Teams integration has been enabled.",
    });
  };

  const connectDirectory = () => {
    // This would initiate company directory connection
    console.log("Connecting to Company Directory");
    setDirectoryEnabled(true);
    toast({
      title: "Company Directory connected",
      description: "Directory integration has been enabled.",
    });
  };

  const connectSSO = () => {
    // This would initiate SSO configuration
    console.log("Setting up SSO with Google");
    setSsoEnabled(true);
    toast({
      title: "SSO Setup Started",
      description: "Single Sign-On configuration has begun.",
    });
  };

  const connectEmailServer = () => {
    // This would initiate email server connection
    console.log("Connecting to Email Server");
    setEmailServerEnabled(true);
    toast({
      title: "Email Server connected",
      description: "Email integration has been enabled.",
    });
  };

  const enableAPI = () => {
    // This would enable API access
    console.log("Enabling API Access");
    setApiEnabled(true);
    toast({
      title: "API Access Enabled",
      description: "API endpoints are now available.",
    });
  };

  const enableWebhooks = () => {
    // This would enable webhook functionality
    console.log("Enabling Webhooks");
    setWebhookEnabled(true);
    toast({
      title: "Webhooks Enabled",
      description: "Webhook support is now available.",
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
      <Tabs defaultValue="calendar">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="directory">Directory & SSO</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="export">Export & API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <Card>
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="external-users">External user invitations</Label>
                      <Switch id="external-users" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Allow external guests to receive Google Calendar invites
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Company Directory & SSO</CardTitle>
              </div>
              <CardDescription>
                Integrate with your company's directory and authentication system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Company Directory</div>
                  <div className="text-xs text-muted-foreground">
                    Sync user profiles and departments from your company directory
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {directoryEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Connected</span>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </>
                  ) : (
                    <Button onClick={connectDirectory}>
                      Connect Directory
                    </Button>
                  )}
                </div>
              </div>

              {directoryEnabled && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="directory-sync-interval">Directory Sync Interval</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="directory-sync-interval" className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-provision">Auto-provision users</Label>
                      <Switch id="auto-provision" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically create accounts for users in the directory
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sync-departments">Sync departments</Label>
                      <Switch id="sync-departments" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Import department information for room access control
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Single Sign-On (SSO)</div>
                  <div className="text-xs text-muted-foreground">
                    Allow users to login with company Google account
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {ssoEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Enabled</span>
                      <Button variant="outline" size="sm">Disable</Button>
                    </>
                  ) : (
                    <Button onClick={connectSSO}>
                      Set Up SSO
                    </Button>
                  )}
                </div>
              </div>

              {ssoEnabled && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sso-domain">Google Domains</Label>
                    <Input 
                      id="sso-domain" 
                      placeholder="company.com" 
                      defaultValue="company.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only users with these domains can sign in (comma separated)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="force-sso">Force SSO</Label>
                      <Switch id="force-sso" defaultChecked />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Disable regular username/password login
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Email Integration</CardTitle>
              </div>
              <CardDescription>
                Configure company email server for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Email Server</div>
                  <div className="text-xs text-muted-foreground">
                    Connect to your company's email server for sending notifications
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {emailServerEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Connected</span>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </>
                  ) : (
                    <Button onClick={connectEmailServer}>
                      Connect Email Server
                    </Button>
                  )}
                </div>
              </div>

              {emailServerEnabled && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-server">SMTP Server</Label>
                      <Input 
                        id="smtp-server" 
                        placeholder="smtp.company.com" 
                        defaultValue="smtp.company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input 
                        id="smtp-port" 
                        placeholder="587" 
                        defaultValue="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">SMTP Username</Label>
                      <Input 
                        id="smtp-username" 
                        placeholder="notifications@company.com" 
                        defaultValue="notifications@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input 
                        id="smtp-password" 
                        type="password" 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtp-ssl">Use SSL/TLS</Label>
                      <Switch id="smtp-ssl" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name</Label>
                    <Input 
                      id="from-name" 
                      placeholder="Meeting Room Booking" 
                      defaultValue="Meeting Room Booking"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input 
                      id="from-email" 
                      placeholder="no-reply@company.com" 
                      defaultValue="no-reply@company.com"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline">Test Email</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Messaging Integrations</CardTitle>
              </div>
              <CardDescription>
                Connect with messaging platforms for notifications
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
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="slack-channel">Default Slack Channel</Label>
                    <Input 
                      id="slack-channel"
                      defaultValue="#room-bookings"
                      placeholder="Enter channel name"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="slack-notify-all" />
                    <Label htmlFor="slack-notify-all" className="cursor-pointer">
                      Notify for all booking events
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Microsoft Teams</div>
                  <div className="text-xs text-muted-foreground">
                    Receive booking notifications in Microsoft Teams
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {teamsEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Connected</span>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </>
                  ) : (
                    <Button onClick={connectTeams}>
                      Connect Teams
                    </Button>
                  )}
                </div>
              </div>
              
              {teamsEnabled && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="teams-channel">Default Teams Channel</Label>
                    <Input 
                      id="teams-channel"
                      defaultValue="Room Bookings"
                      placeholder="Enter channel name"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="teams-notify-all" />
                    <Label htmlFor="teams-notify-all" className="cursor-pointer">
                      Notify for all booking events
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Export & Reporting</CardTitle>
              </div>
              <CardDescription>
                Configure export options and API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Button variant="outline" className="w-full justify-start">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Bookings to CSV
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full justify-start">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Bookings to Excel
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="scheduled-reports">Scheduled Reports</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="scheduled-reports">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-recipients">Recipients (comma separated)</Label>
                  <Input 
                    id="report-recipients" 
                    placeholder="admin@company.com" 
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">API Access</div>
                    <div className="text-xs text-muted-foreground">
                      Enable API endpoints for integration with other systems
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apiEnabled ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Enabled</span>
                        <Button variant="outline" size="sm">Disable</Button>
                      </>
                    ) : (
                      <Button onClick={enableAPI}>
                        Enable API
                      </Button>
                    )}
                  </div>
                </div>

                {apiEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="api-key" 
                          className="font-mono"
                          readOnly
                          value="sk_live_f3c74185-6d8a-4a9e-9191-711d7e2b834d"
                        />
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Available Endpoints</Label>
                      <div className="rounded-md border p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <code className="text-sm">/api/v1/bookings</code>
                          <Badge>GET, POST</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <code className="text-sm">/api/v1/bookings/:id</code>
                          <Badge>GET, PUT, DELETE</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <code className="text-sm">/api/v1/rooms</code>
                          <Badge>GET</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <code className="text-sm">/api/v1/users</code>
                          <Badge>GET</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="api-auth">Require authentication</Label>
                        <Switch id="api-auth" defaultChecked />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline">
                        View API Documentation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Webhook className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Webhook Integrations</CardTitle>
              </div>
              <CardDescription>
                Configure webhooks for custom automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Webhook Support</div>
                  <div className="text-xs text-muted-foreground">
                    Allow external systems to receive booking events
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {webhookEnabled ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Enabled</span>
                      <Button variant="outline" size="sm">Disable</Button>
                    </>
                  ) : (
                    <Button onClick={enableWebhooks}>
                      Enable Webhooks
                    </Button>
                  )}
                </div>
              </div>

              {webhookEnabled && (
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label>Webhook Endpoints</Label>
                    <div className="rounded-md border">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="font-medium">Booking Created</div>
                            <div className="text-xs text-muted-foreground">https://example.com/webhook/booking-created</div>
                          </div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">booking.created</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="font-medium">Booking Status</div>
                            <div className="text-xs text-muted-foreground">https://example.com/webhook/booking-status</div>
                          </div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">booking.updated</Badge>
                          <Badge variant="outline">booking.cancelled</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    Add New Webhook
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="webhook-secret" 
                        className="font-mono"
                        type="password"
                        readOnly
                        value="whsec_8fb7824c90efc1f456e38001637d0451"
                      />
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used to verify webhook signatures for security
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Available Events</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="event-booking-created" defaultChecked />
                        <Label htmlFor="event-booking-created">booking.created</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-booking-updated" defaultChecked />
                        <Label htmlFor="event-booking-updated">booking.updated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-booking-cancelled" defaultChecked />
                        <Label htmlFor="event-booking-cancelled">booking.cancelled</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-booking-reminded" defaultChecked />
                        <Label htmlFor="event-booking-reminded">booking.reminded</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-user-checked-in" defaultChecked />
                        <Label htmlFor="event-user-checked-in">user.checked_in</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-user-checked-out" defaultChecked />
                        <Label htmlFor="event-user-checked-out">user.checked_out</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Webhook</Label>
                    <Textarea
                      placeholder="Enter webhook URL to test"
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="outline">
                        Send Test Event
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save All Integration Settings
        </Button>
      </div>
    </div>
  );
}
