
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface IntegrationSettingsProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function IntegrationSettings({ settings, onUpdateSetting }: IntegrationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Settings</CardTitle>
        <CardDescription>
          Configure third-party integrations and services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Integrations */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Calendar Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="google-calendar">Google Calendar</Label>
                <p className="text-sm text-muted-foreground">
                  Sync room bookings with Google Calendar
                </p>
              </div>
              <Switch 
                id="google-calendar"
                checked={settings?.integrations?.google_calendar?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('integrations', {
                  ...settings?.integrations,
                  google_calendar: {
                    ...settings?.integrations?.google_calendar,
                    enabled: checked
                  }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="microsoft-calendar">Microsoft 365 Calendar</Label>
                <p className="text-sm text-muted-foreground">
                  Sync room bookings with Microsoft 365 Calendar
                </p>
              </div>
              <Switch 
                id="microsoft-calendar"
                checked={settings?.integrations?.microsoft_calendar?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('integrations', {
                  ...settings?.integrations,
                  microsoft_calendar: {
                    ...settings?.integrations?.microsoft_calendar,
                    enabled: checked
                  }
                })}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Communication Integrations */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Communication Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="slack-integration">Slack</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to Slack channels
                </p>
              </div>
              <Switch 
                id="slack-integration"
                checked={settings?.integrations?.slack?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('integrations', {
                  ...settings?.integrations,
                  slack: {
                    ...settings?.integrations?.slack,
                    enabled: checked
                  }
                })}
              />
            </div>
            
            {settings?.integrations?.slack?.enabled && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="slack-webhook">Webhook URL</Label>
                <Input 
                  id="slack-webhook"
                  type="text"
                  placeholder="https://hooks.slack.com/services/..." 
                  value={settings?.integrations?.slack?.webhook_url || ''}
                  onChange={(e) => onUpdateSetting('integrations', {
                    ...settings?.integrations,
                    slack: {
                      ...settings?.integrations?.slack,
                      webhook_url: e.target.value
                    }
                  })}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="teams-integration">Microsoft Teams</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to Microsoft Teams
                </p>
              </div>
              <Switch 
                id="teams-integration"
                checked={settings?.integrations?.teams?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('integrations', {
                  ...settings?.integrations,
                  teams: {
                    ...settings?.integrations?.teams,
                    enabled: checked
                  }
                })}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Authentication Integrations */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Authentication Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="saml-sso">SAML Single Sign-On</Label>
                <p className="text-sm text-muted-foreground">
                  Enterprise SAML-based SSO
                </p>
              </div>
              <Switch 
                id="saml-sso"
                checked={settings?.integrations?.saml?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('integrations', {
                  ...settings?.integrations,
                  saml: {
                    ...settings?.integrations?.saml,
                    enabled: checked
                  }
                })}
              />
            </div>
            
            {settings?.integrations?.saml?.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saml-entity-id">Entity ID</Label>
                  <Input 
                    id="saml-entity-id"
                    type="text"
                    placeholder="https://yourdomain.com" 
                    value={settings?.integrations?.saml?.entity_id || ''}
                    onChange={(e) => onUpdateSetting('integrations', {
                      ...settings?.integrations,
                      saml: {
                        ...settings?.integrations?.saml,
                        entity_id: e.target.value
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="saml-acs-url">ACS URL</Label>
                  <Input 
                    id="saml-acs-url"
                    type="text"
                    placeholder="https://yourdomain.com/auth/saml/callback" 
                    value={settings?.integrations?.saml?.acs_url || ''}
                    onChange={(e) => onUpdateSetting('integrations', {
                      ...settings?.integrations,
                      saml: {
                        ...settings?.integrations?.saml,
                        acs_url: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button variant="outline" className="mt-4">
          Save All Integration Settings
        </Button>
      </CardContent>
    </Card>
  );
}
