
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookingSettings 
} from "@/components/admin/settings/BookingSettings";
import { 
  UserPermissions 
} from "@/components/admin/settings/UserPermissions";
import { 
  NotificationSettings 
} from "@/components/admin/settings/NotificationSettings";
import { 
  IntegrationSettings 
} from "@/components/admin/settings/IntegrationSettings";
import { 
  MaintenanceSettings 
} from "@/components/admin/settings/MaintenanceSettings";

export function SystemSettingsPanel() {
  const [activeTab, setActiveTab] = useState("booking");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>
      
      <Tabs defaultValue="booking" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="booking" className="mt-6">
          <BookingSettings />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <UserPermissions />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-6">
          <IntegrationSettings />
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
