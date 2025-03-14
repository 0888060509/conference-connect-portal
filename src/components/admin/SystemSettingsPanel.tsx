
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthSettings } from "./settings/AuthSettings";
import { BookingSettings } from "./settings/BookingSettings";
import { IntegrationSettings } from "./settings/IntegrationSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { MaintenanceSettings } from "./settings/MaintenanceSettings";
import { DirectoryIntegration } from "./settings/DirectoryIntegration";
import { UserPermissions } from "./settings/UserPermissions";
import { SuperAdminSetup } from "./settings/SuperAdminSetup";

export function SystemSettingsPanel() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="mb-4 w-full max-w-3xl flex overflow-auto">
          <TabsTrigger value="permissions">User Permissions</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="superadmin">Superadmin Access</TabsTrigger>
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="directory">Directory Sync</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions">
          <UserPermissions />
        </TabsContent>
        
        <TabsContent value="auth">
          <AuthSettings />
        </TabsContent>
        
        <TabsContent value="superadmin">
          <SuperAdminSetup />
        </TabsContent>
        
        <TabsContent value="booking">
          <BookingSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>
        
        <TabsContent value="directory">
          <DirectoryIntegration />
        </TabsContent>
        
        <TabsContent value="maintenance">
          <MaintenanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
