
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingSettingsProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function BookingSettings({ settings, onUpdateSetting }: BookingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Settings</CardTitle>
        <CardDescription>
          Configure room booking behavior and policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Restrictions */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Booking Time Restrictions</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="min-booking-duration">Minimum Duration (minutes)</Label>
              <Input 
                id="min-booking-duration"
                type="number" 
                min={5}
                step={5}
                value={settings?.booking_min_duration || 30}
                onChange={(e) => onUpdateSetting('booking_min_duration', parseInt(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="max-booking-duration">Maximum Duration (minutes)</Label>
              <Input 
                id="max-booking-duration"
                type="number" 
                min={30}
                step={15}
                value={settings?.booking_max_duration || 120}
                onChange={(e) => onUpdateSetting('booking_max_duration', parseInt(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="advance-booking-days">Advance Booking (days)</Label>
              <Input 
                id="advance-booking-days"
                type="number" 
                min={1}
                value={settings?.booking_advance_days || 14}
                onChange={(e) => onUpdateSetting('booking_advance_days', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        {/* Booking Policies */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Booking Policies</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-recurring">Allow Recurring Bookings</Label>
                <p className="text-sm text-muted-foreground">
                  Users can create recurring meeting schedules
                </p>
              </div>
              <Switch 
                id="allow-recurring"
                checked={settings?.allow_recurring_bookings === true}
                onCheckedChange={(checked) => onUpdateSetting('allow_recurring_bookings', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="user-limit">User Booking Limit</Label>
                <p className="text-sm text-muted-foreground">
                  Maximum active bookings per user
                </p>
              </div>
              <Input 
                id="user-limit"
                type="number" 
                min={1}
                className="w-20"
                value={settings?.user_booking_limit || 5}
                onChange={(e) => onUpdateSetting('user_booking_limit', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-cancel">Auto-cancel After (minutes)</Label>
                <p className="text-sm text-muted-foreground">
                  Cancel booking if no check-in occurs (0 to disable)
                </p>
              </div>
              <Input 
                id="auto-cancel"
                type="number" 
                min={0}
                step={5}
                className="w-20"
                value={settings?.auto_cancel_minutes || 15}
                onChange={(e) => onUpdateSetting('auto_cancel_minutes', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        {/* Conflict Resolution */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Conflict Resolution</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="conflict-strategy">Default Conflict Strategy</Label>
              <Select 
                value={settings?.conflict_strategy || 'notify'}
                onValueChange={(value) => onUpdateSetting('conflict_strategy', value)}
              >
                <SelectTrigger id="conflict-strategy">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notify">Notify Only</SelectItem>
                  <SelectItem value="priority">Use Priority Rules</SelectItem>
                  <SelectItem value="waitlist">Add to Waitlist</SelectItem>
                  <SelectItem value="reject">Reject Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="admin-override">Admin Override</Label>
                <p className="text-sm text-muted-foreground">
                  Admins can override booking conflicts
                </p>
              </div>
              <Switch 
                id="admin-override"
                checked={settings?.admin_override_conflicts === true}
                onCheckedChange={(checked) => onUpdateSetting('admin_override_conflicts', checked)}
              />
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="mt-4">
          Save All Booking Settings
        </Button>
      </CardContent>
    </Card>
  );
}
