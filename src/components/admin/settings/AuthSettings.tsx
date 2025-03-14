
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AuthSettingsProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function AuthSettings({ settings, onUpdateSetting }: AuthSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Settings</CardTitle>
        <CardDescription>
          Configure authentication methods and security policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* MFA Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Multi-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mfa-required">Require MFA for all users</Label>
              <p className="text-sm text-muted-foreground">
                All users must set up multi-factor authentication
              </p>
            </div>
            <Switch 
              id="mfa-required"
              checked={settings?.mfa_required === true}
              onCheckedChange={(checked) => onUpdateSetting('mfa_required', checked)}
            />
          </div>
        </div>
        
        {/* Password Policy */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Password Policy</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="min-password-length">Minimum Password Length</Label>
              <Input 
                id="min-password-length"
                type="number" 
                min={8}
                max={64}
                value={settings?.password_policy?.min_length || 8}
                onChange={(e) => onUpdateSetting('password_policy', {
                  ...settings?.password_policy,
                  min_length: parseInt(e.target.value)
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-uppercase">Require Uppercase</Label>
              <Switch 
                id="require-uppercase"
                checked={settings?.password_policy?.require_uppercase === true}
                onCheckedChange={(checked) => onUpdateSetting('password_policy', {
                  ...settings?.password_policy,
                  require_uppercase: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-lowercase">Require Lowercase</Label>
              <Switch 
                id="require-lowercase"
                checked={settings?.password_policy?.require_lowercase === true}
                onCheckedChange={(checked) => onUpdateSetting('password_policy', {
                  ...settings?.password_policy,
                  require_lowercase: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-number">Require Number</Label>
              <Switch 
                id="require-number"
                checked={settings?.password_policy?.require_number === true}
                onCheckedChange={(checked) => onUpdateSetting('password_policy', {
                  ...settings?.password_policy,
                  require_number: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-special">Require Special Character</Label>
              <Switch 
                id="require-special"
                checked={settings?.password_policy?.require_special === true}
                onCheckedChange={(checked) => onUpdateSetting('password_policy', {
                  ...settings?.password_policy,
                  require_special: checked
                })}
              />
            </div>
          </div>
        </div>
        
        {/* Single Sign On */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Single Sign-On</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Google SSO</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to login with Google
                </p>
              </div>
              <Switch 
                checked={settings?.sso_google === true}
                onCheckedChange={(checked) => onUpdateSetting('sso_google', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Microsoft SSO</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to login with Microsoft
                </p>
              </div>
              <Switch 
                checked={settings?.sso_microsoft === true}
                onCheckedChange={(checked) => onUpdateSetting('sso_microsoft', checked)}
              />
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="mt-4">
          Save All Authentication Settings
        </Button>
      </CardContent>
    </Card>
  );
}
