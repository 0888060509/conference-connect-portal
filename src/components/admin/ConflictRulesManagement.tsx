
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Info, 
  Settings, 
  Shield, 
  Calendar,
  Building,
  Users,
  Clock,
  Plus,
  UserCog,
  Trash2
} from "lucide-react";
import { getConflictPreventionRules } from "@/services/conflictResolutionService";

export function ConflictRulesManagement() {
  const [activeTab, setActiveTab] = useState("rules");
  const [prioritySettings, setPrioritySettings] = useState({
    enableDepartmentPriorities: true,
    enableRolePriorities: true,
    enableRecurringMeetingPriorities: true,
    enableExternalParticipantPriorities: false,
    enableTimeBuffers: true
  });
  
  const [departmentPriorities, setDepartmentPriorities] = useState([
    { id: 1, name: "Executive", priority: "critical" },
    { id: 2, name: "Sales", priority: "high" },
    { id: 3, name: "Marketing", priority: "normal" },
    { id: 4, name: "Engineering", priority: "normal" },
    { id: 5, name: "Customer Support", priority: "normal" }
  ]);
  
  const [rolePriorities, setRolePriorities] = useState([
    { id: 1, name: "CEO", priority: "critical" },
    { id: 2, name: "Director", priority: "high" },
    { id: 3, name: "Manager", priority: "high" },
    { id: 4, name: "Team Lead", priority: "normal" },
    { id: 5, name: "Employee", priority: "normal" }
  ]);
  
  const [preventionRules, setPreventionRules] = useState(getConflictPreventionRules());
  const [newRule, setNewRule] = useState("");
  
  const handleSettingChange = (setting: string, value: boolean) => {
    setPrioritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleAddRule = () => {
    if (newRule.trim()) {
      setPreventionRules([...preventionRules, newRule]);
      setNewRule("");
    }
  };
  
  const handleDeleteRule = (index: number) => {
    const updatedRules = [...preventionRules];
    updatedRules.splice(index, 1);
    setPreventionRules(updatedRules);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Conflict Resolution</h1>
          <p className="text-muted-foreground">
            Manage automatic conflict resolution rules and priorities
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Prevention Rules</TabsTrigger>
          <TabsTrigger value="priorities">Priority Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>
        
        {/* Prevention Rules Tab */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Automated Prevention Rules
              </CardTitle>
              <CardDescription>
                Rules that automatically apply to resolve conflicts without manual intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preventionRules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/40">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{rule}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteRule(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2 mt-4">
                  <Input 
                    placeholder="Add new prevention rule..." 
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Conflict Detection Settings
              </CardTitle>
              <CardDescription>
                Configure how the system detects and manages potential conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Buffer Time Between Meetings</Label>
                    <p className="text-sm text-muted-foreground">
                      Add a buffer time between meetings to allow for setup and cleanup
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      className="w-20" 
                      defaultValue="15" 
                      min="0"
                      max="60"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Switch 
                    id="early-detection" 
                    defaultChecked 
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="early-detection" className="cursor-pointer">
                      Early Conflict Detection
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Warn users about potential conflicts at the time of booking
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Switch 
                    id="recurring-check" 
                    defaultChecked 
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="recurring-check" className="cursor-pointer">
                      Check All Recurring Instances
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Validate conflicts across all instances of recurring meetings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Priority Settings Tab */}
        <TabsContent value="priorities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                Conflict Resolution Priorities
              </CardTitle>
              <CardDescription>
                Configure how conflicts are automatically resolved based on priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Switch 
                    id="department-priorities" 
                    checked={prioritySettings.enableDepartmentPriorities}
                    onCheckedChange={(checked) => handleSettingChange("enableDepartmentPriorities", checked)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="department-priorities" className="cursor-pointer flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Department-Based Priorities
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Prioritize bookings based on the department of the organizer
                    </p>
                  </div>
                </div>
                
                {prioritySettings.enableDepartmentPriorities && (
                  <div className="ml-8 mt-2 border rounded-md p-3 space-y-2">
                    {departmentPriorities.map((dept) => (
                      <div key={dept.id} className="flex items-center justify-between">
                        <span>{dept.name}</span>
                        <Badge variant={
                          dept.priority === "critical" ? "destructive" : 
                          dept.priority === "high" ? "default" : 
                          "secondary"
                        }>
                          {dept.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-start space-x-2 pt-2">
                  <Switch 
                    id="role-priorities" 
                    checked={prioritySettings.enableRolePriorities}
                    onCheckedChange={(checked) => handleSettingChange("enableRolePriorities", checked)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="role-priorities" className="cursor-pointer flex items-center">
                      <UserCog className="h-4 w-4 mr-2" />
                      Role-Based Priorities
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Prioritize bookings based on the role/position of the organizer
                    </p>
                  </div>
                </div>
                
                {prioritySettings.enableRolePriorities && (
                  <div className="ml-8 mt-2 border rounded-md p-3 space-y-2">
                    {rolePriorities.map((role) => (
                      <div key={role.id} className="flex items-center justify-between">
                        <span>{role.name}</span>
                        <Badge variant={
                          role.priority === "critical" ? "destructive" : 
                          role.priority === "high" ? "default" : 
                          "secondary"
                        }>
                          {role.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-start space-x-2 pt-2">
                  <Switch 
                    id="recurring-priorities" 
                    checked={prioritySettings.enableRecurringMeetingPriorities}
                    onCheckedChange={(checked) => handleSettingChange("enableRecurringMeetingPriorities", checked)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="recurring-priorities" className="cursor-pointer flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Recurring Meeting Priorities
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Give higher priority to recurring meetings over one-time bookings
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Switch 
                    id="external-priorities" 
                    checked={prioritySettings.enableExternalParticipantPriorities}
                    onCheckedChange={(checked) => handleSettingChange("enableExternalParticipantPriorities", checked)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="external-priorities" className="cursor-pointer flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      External Participant Priorities
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Prioritize meetings with external participants
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="ml-auto">
                Save Priority Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Conflict Resolution Audit Trail
              </CardTitle>
              <CardDescription>
                Track all conflict resolutions for compliance and review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-4 opacity-40" />
                <p className="text-lg">Audit data will appear here once conflicts are resolved</p>
                <p className="text-sm mt-2">All conflict resolutions are logged automatically</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
