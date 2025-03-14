
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface NotificationSettingsProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function NotificationSettings({ settings, onUpdateSetting }: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure system notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-email">Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications via email
                </p>
              </div>
              <Switch 
                id="enable-email"
                checked={settings?.email_notifications_enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('email_notifications_enabled', checked)}
              />
            </div>
            
            <div className="pt-2 pl-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-booking"
                  checked={settings?.notification_types?.email?.includes('booking')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.email || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: [...types, 'booking']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: types.filter(t => t !== 'booking')
                      });
                    }
                  }}
                />
                <Label htmlFor="email-booking">Booking confirmations & reminders</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-system"
                  checked={settings?.notification_types?.email?.includes('system')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.email || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: [...types, 'system']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: types.filter(t => t !== 'system')
                      });
                    }
                  }}
                />
                <Label htmlFor="email-system">System announcements</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email-reports"
                  checked={settings?.notification_types?.email?.includes('reports')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.email || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: [...types, 'reports']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        email: types.filter(t => t !== 'reports')
                      });
                    }
                  }}
                />
                <Label htmlFor="email-reports">Report delivery</Label>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* In-App Notifications */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">In-App Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-inapp">Enable In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the application
                </p>
              </div>
              <Switch 
                id="enable-inapp"
                checked={settings?.inapp_notifications_enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('inapp_notifications_enabled', checked)}
              />
            </div>
            
            <div className="pt-2 pl-6 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inapp-booking"
                  checked={settings?.notification_types?.inapp?.includes('booking')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.inapp || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: [...types, 'booking']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: types.filter(t => t !== 'booking')
                      });
                    }
                  }}
                />
                <Label htmlFor="inapp-booking">Booking updates</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inapp-realtime"
                  checked={settings?.notification_types?.inapp?.includes('realtime')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.inapp || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: [...types, 'realtime']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: types.filter(t => t !== 'realtime')
                      });
                    }
                  }}
                />
                <Label htmlFor="inapp-realtime">Real-time system events</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inapp-reminders"
                  checked={settings?.notification_types?.inapp?.includes('reminders')}
                  onCheckedChange={(checked) => {
                    const types = settings?.notification_types?.inapp || [];
                    if (checked) {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: [...types, 'reminders']
                      });
                    } else {
                      onUpdateSetting('notification_types', {
                        ...settings?.notification_types,
                        inapp: types.filter(t => t !== 'reminders')
                      });
                    }
                  }}
                />
                <Label htmlFor="inapp-reminders">Meeting reminders</Label>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Email Template */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Email Templates</h3>
          <div className="space-y-2">
            <Label htmlFor="email-footer">Email Footer Text</Label>
            <Textarea 
              id="email-footer"
              placeholder="Enter your email footer text..." 
              rows={3}
              value={settings?.email_footer || ''}
              onChange={(e) => onUpdateSetting('email_footer', e.target.value)}
            />
          </div>
        </div>
        
        <Button variant="outline" className="mt-4">
          Save All Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
}
