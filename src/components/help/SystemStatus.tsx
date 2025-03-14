
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface SystemComponent {
  name: string;
  status: "operational" | "degraded" | "maintenance" | "outage";
  lastUpdated: string;
}

export function SystemStatus() {
  // Mock data - in a real app, this would come from an API
  const components: SystemComponent[] = [
    {
      name: "Booking Services",
      status: "operational",
      lastUpdated: "2 minutes ago"
    },
    {
      name: "User Authentication",
      status: "operational",
      lastUpdated: "5 minutes ago"
    },
    {
      name: "Notifications",
      status: "degraded",
      lastUpdated: "15 minutes ago"
    },
    {
      name: "Calendar Integration",
      status: "maintenance",
      lastUpdated: "1 hour ago"
    }
  ];

  const getStatusIcon = (status: SystemComponent["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "degraded":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "maintenance":
        return <Clock className="h-4 w-4 text-info" />;
      case "outage":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: SystemComponent["status"]) => {
    switch (status) {
      case "operational":
        return <Badge variant="outline" className="bg-success/10 text-success">Operational</Badge>;
      case "degraded":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">Degraded</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">Maintenance</Badge>;
      case "outage":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">Outage</Badge>;
    }
  };

  // Calculate overall system status
  const getOverallStatus = () => {
    if (components.some(c => c.status === "outage")) {
      return "outage";
    } else if (components.some(c => c.status === "degraded")) {
      return "degraded";
    } else if (components.some(c => c.status === "maintenance")) {
      return "maintenance";
    } else {
      return "operational";
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> System Status
        </CardTitle>
        <CardDescription>
          Current status of all system components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-background border">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              <span className="font-medium">Overall System Status</span>
            </div>
            {getStatusBadge(overallStatus)}
          </div>
          
          <div className="space-y-2">
            {components.map((component, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {getStatusIcon(component.status)}
                  <span>{component.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{component.lastUpdated}</span>
                  {getStatusBadge(component.status)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-center text-muted-foreground">
            Last updated: Today at 10:45 AM
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
