
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Building, Users, Settings } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Button variant="outline">Export Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link to="/admin/rooms">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Room Management</CardTitle>
                </div>
                <CardDescription>
                  Manage meeting rooms, equipment, and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">Go to Room Management</Button>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">User Management</CardTitle>
              </div>
              <CardDescription>
                Manage users, permissions, and access control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Manage Users</Button>
            </CardContent>
          </Card>
          
          <Link to="/admin/settings">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">System Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure application settings and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">Open Settings</Button>
              </CardContent>
            </Card>
          </Link>
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
