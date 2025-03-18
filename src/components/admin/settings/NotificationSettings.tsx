
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  Save,
  Pencil
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const templateTypes = [
  {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    subject: "Your booking has been confirmed",
    template: `Hello {{name}},

Your booking for {{room}} on {{date}} from {{start_time}} to {{end_time}} has been confirmed.

Booking Details:
- Room: {{room}}
- Date: {{date}}
- Time: {{start_time}} - {{end_time}}

Thank you for using our room booking system.

Best regards,
{{company_name}} Team`,
  },
  {
    id: "booking_reminder",
    name: "Booking Reminder",
    subject: "Reminder: Upcoming booking",
    template: `Hello {{name}},

This is a reminder for your upcoming booking:

- Room: {{room}}
- Date: {{date}}
- Time: {{start_time}} - {{end_time}}

Thank you for using our room booking system.

Best regards,
{{company_name}} Team`,
  },
  {
    id: "booking_cancelled",
    name: "Booking Cancellation",
    subject: "Your booking has been cancelled",
    template: `Hello {{name}},

Your booking for {{room}} on {{date}} from {{start_time}} to {{end_time}} has been cancelled.

If you did not cancel this booking yourself, please contact the administrator.

Best regards,
{{company_name}} Team`,
  },
  {
    id: "booking_modified",
    name: "Booking Modified",
    subject: "Your booking has been modified",
    template: `Hello {{name}},

Your booking has been modified with the following details:

- Room: {{room}}
- Date: {{date}}
- Time: {{start_time}} - {{end_time}}

If you did not make these changes yourself, please contact the administrator.

Best regards,
{{company_name}} Team`,
  },
];

export function NotificationSettings() {
  const [activeTemplate, setActiveTemplate] = useState("booking_confirmation");
  const [templates, setTemplates] = useState(templateTypes);
  const [emailSettings, setEmailSettings] = useState({
    enableEmailNotifications: true,
    smtpServer: "smtp.company.com",
    smtpPort: "587",
    smtpUsername: "notifications@company.com",
    enableSSL: true,
    fromName: "Meeting Room Booking",
    fromEmail: "bookings@company.com",
  });

  const currentTemplate = templates.find(t => t.id === activeTemplate) || templates[0];

  const handleTemplateChange = (value: string) => {
    setActiveTemplate(value);
  };

  const handleTemplateUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedTemplates = templates.map(template => 
      template.id === activeTemplate 
        ? { ...template, template: e.target.value }
        : template
    );
    setTemplates(updatedTemplates);
  };

  const handleSubjectUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTemplates = templates.map(template => 
      template.id === activeTemplate 
        ? { ...template, subject: e.target.value }
        : template
    );
    setTemplates(updatedTemplates);
  };

  const saveTemplates = () => {
    console.log("Saving email templates:", templates);
    toast({
      title: "Templates saved",
      description: "Email templates have been updated successfully.",
    });
  };

  const saveEmailSettings = () => {
    console.log("Saving email settings:", emailSettings);
    toast({
      title: "Settings saved",
      description: "Email configuration has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="email_templates">
        <TabsList>
          <TabsTrigger value="email_templates">Email Templates</TabsTrigger>
          <TabsTrigger value="email_config">Email Configuration</TabsTrigger>
          <TabsTrigger value="notification_rules">Notification Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email_templates" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Email Notification Templates</CardTitle>
              </div>
              <CardDescription>
                Customize email templates sent to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4">
                  <Label className="mb-2 block">Template Type</Label>
                  <div className="flex flex-col space-y-2">
                    {templates.map(template => (
                      <Button
                        key={template.id}
                        variant={activeTemplate === template.id ? "default" : "outline"}
                        onClick={() => handleTemplateChange(template.id)}
                        className="justify-start"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="w-full md:w-3/4">
                  <div className="mb-4">
                    <Label htmlFor="subject" className="mb-2 block">Email Subject</Label>
                    <Input 
                      id="subject"
                      value={currentTemplate.subject}
                      onChange={handleSubjectUpdate}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="template" className="block">Email Body</Label>
                      <div className="text-sm text-muted-foreground">
                        Use <code>{'{{variable}}'}</code> for dynamic content
                      </div>
                    </div>
                    <Textarea 
                      id="template"
                      value={currentTemplate.template}
                      onChange={handleTemplateUpdate}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={saveTemplates}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Templates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email_config" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Email Server Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure SMTP server settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Enable Email Notifications</label>
                  <p className="text-xs text-muted-foreground">Send automated emails for bookings and changes</p>
                </div>
                <Switch 
                  checked={emailSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, enableEmailNotifications: checked }))
                  }
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input 
                    id="smtp-server" 
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input 
                    id="smtp-port" 
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input 
                    id="smtp-username" 
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ssl"
                  checked={emailSettings.enableSSL}
                  onCheckedChange={(checked) => 
                    setEmailSettings(prev => ({ ...prev, enableSSL: checked }))
                  }
                />
                <Label htmlFor="ssl" className="cursor-pointer">Enable SSL/TLS</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input 
                    id="from-name" 
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input 
                    id="from-email" 
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Test Email
                </Button>
                <Button onClick={saveEmailSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notification_rules" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Notification Triggers</CardTitle>
              </div>
              <CardDescription>
                Configure which events trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Booking Confirmations</label>
                    <p className="text-xs text-muted-foreground">Send notifications when bookings are confirmed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Booking Reminders</label>
                    <p className="text-xs text-muted-foreground">Send reminders before scheduled bookings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Booking Modifications</label>
                    <p className="text-xs text-muted-foreground">Send notifications when bookings are changed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Cancellations</label>
                    <p className="text-xs text-muted-foreground">Send notifications when bookings are cancelled</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Admin Notifications</label>
                    <p className="text-xs text-muted-foreground">Send notifications to admins for approval requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
