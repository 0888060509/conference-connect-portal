
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications, NotificationType } from "@/contexts/NotificationContext";

export default function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications();
  
  const handleChannelChange = (
    type: NotificationType,
    channel: "email" | "in_app" | "push" | "calendar",
    checked: boolean
  ) => {
    updatePreferences({
      channels: {
        ...preferences.channels,
        [type]: {
          ...preferences.channels[type],
          [channel]: checked
        }
      }
    });
  };
  
  const handleReminderTimeChange = (index: number, value: string) => {
    const newMinutes = [...preferences.reminderTimes.minutes];
    newMinutes[index] = parseInt(value, 10);
    
    updatePreferences({
      reminderTimes: {
        minutes: newMinutes
      }
    });
  };
  
  const addReminderTime = () => {
    updatePreferences({
      reminderTimes: {
        minutes: [...preferences.reminderTimes.minutes, 30]
      }
    });
  };
  
  const removeReminderTime = (index: number) => {
    const newMinutes = [...preferences.reminderTimes.minutes];
    newMinutes.splice(index, 1);
    
    updatePreferences({
      reminderTimes: {
        minutes: newMinutes
      }
    });
  };
  
  const notificationTypes: {
    id: NotificationType;
    name: string;
    description: string;
  }[] = [
    {
      id: "booking_confirmation",
      name: "Booking Confirmations",
      description: "Receive notifications when your booking is confirmed"
    },
    {
      id: "booking_reminder",
      name: "Meeting Reminders",
      description: "Get reminders before your scheduled meetings"
    },
    {
      id: "booking_modification",
      name: "Booking Changes",
      description: "Be notified when bookings are modified"
    },
    {
      id: "booking_cancellation",
      name: "Booking Cancellations",
      description: "Be notified when bookings are cancelled"
    },
    {
      id: "admin_request",
      name: "Room Requests",
      description: "Receive notifications about new room requests"
    },
    {
      id: "admin_issue",
      name: "Room Issues",
      description: "Be notified about room maintenance or issues"
    },
    {
      id: "booking_conflict",
      name: "Booking Conflicts",
      description: "Be alerted when there are conflicts with your bookings"
    }
  ];
  
  const minutesToHumanReadable = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes before`;
    } else if (minutes === 60) {
      return `1 hour before`;
    } else if (minutes < 1440) {
      return `${minutes / 60} hours before`;
    } else if (minutes === 1440) {
      return `1 day before`;
    } else {
      return `${minutes / 1440} days before`;
    }
  };
  
  return (
    <Layout title="Notification Preferences">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="reminders">Reminder Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Choose how you want to receive different types of notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationTypes.map((type) => (
                    <div key={type.id} className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium">{type.name}</h3>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor={`${type.id}-email`} className="flex-1">Email</Label>
                          <Switch 
                            id={`${type.id}-email`}
                            checked={preferences.channels[type.id].email}
                            onCheckedChange={(checked) => 
                              handleChannelChange(type.id, "email", checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor={`${type.id}-in-app`} className="flex-1">In-app</Label>
                          <Switch 
                            id={`${type.id}-in-app`}
                            checked={preferences.channels[type.id].in_app}
                            onCheckedChange={(checked) => 
                              handleChannelChange(type.id, "in_app", checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor={`${type.id}-push`} className="flex-1">Push</Label>
                          <Switch 
                            id={`${type.id}-push`}
                            checked={preferences.channels[type.id].push}
                            onCheckedChange={(checked) => 
                              handleChannelChange(type.id, "push", checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor={`${type.id}-calendar`} className="flex-1">Calendar</Label>
                          <Switch 
                            id={`${type.id}-calendar`}
                            checked={preferences.channels[type.id].calendar}
                            onCheckedChange={(checked) => 
                              handleChannelChange(type.id, "calendar", checked)
                            }
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reminders" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Reminder Times</CardTitle>
                <CardDescription>
                  Set when you want to receive reminders before your meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.reminderTimes.minutes.map((minutes, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={minutes}
                        onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                        className="w-24"
                      />
                      <Label>minutes</Label>
                      <div className="flex-1 text-sm text-muted-foreground">
                        ({minutesToHumanReadable(minutes)})
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeReminderTime(index)}
                        disabled={preferences.reminderTimes.minutes.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addReminderTime}
                    className="mt-2"
                  >
                    Add Reminder Time
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
