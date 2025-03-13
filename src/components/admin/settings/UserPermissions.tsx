
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  UserPlus, 
  Save 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define user roles with permissions
type Permission = {
  id: string;
  name: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isCustom?: boolean;
};

// Sample permissions
const permissions: Permission[] = [
  { 
    id: "book_rooms", 
    name: "Book Rooms", 
    description: "Ability to make room bookings" 
  },
  { 
    id: "cancel_own", 
    name: "Cancel Own Bookings", 
    description: "Ability to cancel user's own bookings" 
  },
  { 
    id: "view_all", 
    name: "View All Bookings", 
    description: "Ability to view all users' bookings" 
  },
  { 
    id: "modify_all", 
    name: "Modify All Bookings", 
    description: "Ability to modify any booking" 
  },
  { 
    id: "cancel_all", 
    name: "Cancel All Bookings", 
    description: "Ability to cancel any booking" 
  },
  { 
    id: "manage_rooms", 
    name: "Manage Rooms", 
    description: "Ability to add/edit room details" 
  },
  { 
    id: "manage_users", 
    name: "Manage Users", 
    description: "Ability to manage user accounts" 
  },
  { 
    id: "system_settings", 
    name: "System Settings", 
    description: "Access to system configuration" 
  },
];

// Sample roles with their default permissions
const defaultRoles: Role[] = [
  { 
    id: "user", 
    name: "Regular User", 
    description: "Standard access for most employees",
    isDefault: true
  },
  { 
    id: "manager", 
    name: "Department Manager", 
    description: "Expanded access for team leaders",
    isDefault: true
  },
  { 
    id: "admin", 
    name: "System Administrator", 
    description: "Full access to all features",
    isDefault: true
  },
  { 
    id: "custom1", 
    name: "Reception Staff", 
    description: "Custom role for front desk staff",
    isCustom: true
  },
];

// Default permission matrix (which roles have which permissions)
const defaultPermissionMatrix: Record<string, Record<string, boolean>> = {
  user: {
    book_rooms: true,
    cancel_own: true,
    view_all: false,
    modify_all: false,
    cancel_all: false,
    manage_rooms: false,
    manage_users: false,
    system_settings: false,
  },
  manager: {
    book_rooms: true,
    cancel_own: true,
    view_all: true,
    modify_all: true,
    cancel_all: true,
    manage_rooms: false,
    manage_users: false,
    system_settings: false,
  },
  admin: {
    book_rooms: true,
    cancel_own: true,
    view_all: true,
    modify_all: true,
    cancel_all: true,
    manage_rooms: true,
    manage_users: true,
    system_settings: true,
  },
  custom1: {
    book_rooms: true,
    cancel_own: true,
    view_all: true,
    modify_all: false,
    cancel_all: true,
    manage_rooms: false,
    manage_users: false,
    system_settings: false,
  },
};

export function UserPermissions() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [permissionMatrix, setPermissionMatrix] = useState(defaultPermissionMatrix);
  const [selectedRole, setSelectedRole] = useState<string>("user");

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [permissionId]: checked
      }
    }));
  };

  const savePermissions = () => {
    // This would be an API call in a real application
    console.log("Saving permissions:", permissionMatrix);
    toast({
      title: "Permissions saved",
      description: "User role permissions have been updated.",
    });
  };

  const addCustomRole = () => {
    // This would open a dialog to create a new role in a real application
    console.log("Adding custom role");
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Role Permissions</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={addCustomRole}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Custom Role
            </Button>
          </div>
          <CardDescription>
            Configure access levels for different user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Role to Configure</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col">
                      <span>{role.name}</span>
                      <span className="text-xs text-muted-foreground">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Permission</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-center">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={permissionMatrix[selectedRole]?.[permission.id] || false}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6">
            <Button onClick={savePermissions}>
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Directory Integration</CardTitle>
          </div>
          <CardDescription>
            Configure user directory synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Active Directory Integration</label>
                <p className="text-xs text-muted-foreground">Sync users and groups from company directory</p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Automatic Role Assignment</label>
                <p className="text-xs text-muted-foreground">Assign roles based on directory groups</p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Daily Synchronization</label>
                <p className="text-xs text-muted-foreground">Automatically sync user data daily</p>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" className="mr-2">
              Test Connection
            </Button>
            <Button>
              Configure Directory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
