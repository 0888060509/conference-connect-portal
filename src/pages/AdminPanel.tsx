
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPanel() {
  const { user } = useAuth();

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button variant="outline">Export Data</Button>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    User management interface would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Directory Integration</CardTitle>
                <CardDescription>
                  Configure Active Directory/LDAP integration settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    LDAP configuration interface would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Manage global system settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    System configuration interface would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  View and analyze system activity logs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    Log viewer interface would appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
