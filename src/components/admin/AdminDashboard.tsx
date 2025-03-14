
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserManagement } from "@/components/admin/UserManagement";
import { getAuditLogs } from "@/services/AuditService";
import { getSystemHealth } from "@/services/SystemHealthService";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Settings, Database, ClipboardList, Clock, Activity } from "lucide-react";
import { RoomAdminDashboard } from "@/components/admin/RoomAdminDashboard";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch recent activity
      const { logs } = await getAuditLogs(5);
      setRecentActivity(logs);
      
      // Fetch system health
      const healthData = await getSystemHealth();
      setSystemHealth(healthData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock analytics data
  const analyticsData = {
    totalUsers: 254,
    activeUsers: 142,
    totalRooms: 28,
    totalBookings: 1249,
    recentBookings: 87,
    averageOccupancy: 64
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline">Export Reports</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.activeUsers} active in the last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Database className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData.totalRooms}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.averageOccupancy}% average occupancy rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData.totalBookings}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData.recentBookings} in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {systemHealth.find(h => h.category === 'overall')?.status || 'Unknown'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last checked: {new Date(systemHealth.find(h => h.category === 'overall')?.last_check || new Date()).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link to="/admin/rooms">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Database className="h-6 w-6" />
                  <span>Manage Rooms</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              
              <Link to="/admin/settings">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span>System Settings</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <ClipboardList className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
              
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <Activity className="h-6 w-6" />
                <span>System Health</span>
              </Button>
              
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                <Clock className="h-6 w-6" />
                <span>Audit Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px] pr-4">
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="text-sm border-b pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline">{activity.action}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {activity.resource_type} {activity.resource_id ? `#${activity.resource_id.substring(0, 8)}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="rooms">Room Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Key metrics and status information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overview content would be here */}
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    System overview will be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <RoomAdminDashboard />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View and generate system reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Report content would be here */}
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    Reporting interface will be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                System activity and audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Audit logs content would be here */}
                <div className="border rounded-md p-4 bg-muted/20">
                  <p className="text-center text-muted-foreground">
                    Audit logs will be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system settings and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Link to="/admin/settings">
                    <Button>Open System Settings</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
