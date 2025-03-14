
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthSettings } from "@/components/admin/settings/AuthSettings";
import { BookingSettings } from "@/components/admin/settings/BookingSettings";
import { NotificationSettings } from "@/components/admin/settings/NotificationSettings";
import { IntegrationSettings } from "@/components/admin/settings/IntegrationSettings";
import { DirectoryIntegration } from "@/components/admin/settings/DirectoryIntegration";
import { MaintenanceSettings } from "@/components/admin/settings/MaintenanceSettings";
import { UserPermissions } from "@/components/admin/settings/UserPermissions";
import { Button } from "@/components/ui/button";
import { getSystemSettings, updateSystemSetting } from "@/services/SystemSettingsService";
import { performHealthCheck, getSystemHealth, SystemHealthStatus } from "@/services/SystemHealthService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getAuditLogs } from "@/services/AuditService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface SettingsComponentProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function SystemSettingsPanel() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const settingsData = await getSystemSettings();
      const settingsMap: Record<string, any> = {};
      settingsData.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
      
      await performHealthCheck();
      const healthData = await getSystemHealth();
      setSystemHealth(healthData);
      
      const { logs } = await getAuditLogs(10);
      setRecentActivity(logs);
    } catch (error) {
      console.error("Error loading settings data:", error);
      toast.error("Failed to load settings data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
    toast.success("Settings data refreshed");
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      await updateSystemSetting(key, value);
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current health of system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium">{item.category}</span>
                  <Badge 
                    variant={
                      item.status === 'healthy' ? "secondary" : 
                      item.status === 'warning' ? "outline" : 
                      "destructive"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px] pr-4">
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="text-sm border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {activity.resource_type} {activity.resource_id ? `#${activity.resource_id.substring(0, 8)}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("maintenance")}>
              Run System Maintenance
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("backups")}>
              Create Backup
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("users")}>
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("notifications")}>
              Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="bookings">Booking Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
          <TabsTrigger value="backups">Backups & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    General settings interface will be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <AuthSettings 
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingSettings 
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings 
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationSettings 
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        </TabsContent>

        <TabsContent value="directory">
          <DirectoryIntegration 
            settings={settings}
            onUpdateSetting={handleUpdateSetting}
          />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserPermissions />
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backups & Restore</CardTitle>
              <CardDescription>
                Manage system backups and restore points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    Backup and restore interface will be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
