
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthSettings } from "./settings/AuthSettings";
import { BookingSettings } from "./settings/BookingSettings";
import { IntegrationSettings } from "./settings/IntegrationSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { MaintenanceSettings } from "./settings/MaintenanceSettings";
import { DirectoryIntegration } from "./settings/DirectoryIntegration";
import { UserPermissions } from "./settings/UserPermissions";
import { SuperAdminSetup } from "./settings/SuperAdminSetup";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export function SystemSettingsPanel() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      // Transform array of settings to an object
      const settingsObj = data.reduce((acc, item) => {
        try {
          acc[item.setting_key] = item.setting_value;
        } catch (e) {
          console.error(`Error parsing setting ${item.setting_key}:`, e);
        }
        return acc;
      }, {} as Record<string, any>);
      
      setSettings(settingsObj);
    } catch (err) {
      console.error("Error loading settings:", err);
      toast.error("Failed to load system settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({ 
          setting_key: key, 
          setting_value: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'setting_key' 
        });
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      toast.success(`Setting "${key}" updated successfully`);
    } catch (err) {
      console.error("Error updating setting:", err);
      toast.error("Failed to update setting");
    } finally {
      setIsLoading(false);
    }
  };

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
          <AuthSettings 
            settings={settings} 
            onUpdateSetting={updateSetting} 
          />
        </TabsContent>
        
        <TabsContent value="superadmin">
          <SuperAdminSetup />
        </TabsContent>
        
        <TabsContent value="booking">
          <BookingSettings 
            settings={settings} 
            onUpdateSetting={updateSetting} 
          />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings 
            settings={settings} 
            onUpdateSetting={updateSetting} 
          />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationSettings 
            settings={settings} 
            onUpdateSetting={updateSetting} 
          />
        </TabsContent>
        
        <TabsContent value="directory">
          <DirectoryIntegration 
            settings={settings} 
            onUpdateSetting={updateSetting} 
          />
        </TabsContent>
        
        <TabsContent value="maintenance">
          <MaintenanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
