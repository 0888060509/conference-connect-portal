
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { directoryIntegrationService, SyncStats } from "@/services/DirectoryIntegrationService";
import { 
  DirectoryIntegration as DirectoryIntegrationType, 
  authConfigService 
} from "@/services/AuthConfigService";
import { 
  Loader2, 
  Save, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export function DirectoryIntegration() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [integrations, setIntegrations] = useState<DirectoryIntegrationType[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  
  // New integration dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Omit<DirectoryIntegrationType, 'id' | 'last_sync'>>({
    provider: 'azure_ad',
    config: { tenant_id: '', client_id: '', client_secret: '' },
    enabled: false,
    sync_interval: 24
  });
  
  // User provisioning dialog
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);
  const [userToProvision, setUserToProvision] = useState({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  // User deprovisioning dialog
  const [deprovisionDialogOpen, setDeprovisionDialogOpen] = useState(false);
  const [userIdToDeprovision, setUserIdToDeprovision] = useState('');
  const [isDeprovisioning, setIsDeprovisioning] = useState(false);
  
  // Load integrations
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true);
      try {
        const integrationData = await authConfigService.getDirectoryIntegrations();
        setIntegrations(integrationData);
      } catch (error) {
        console.error("Error loading directory integrations:", error);
        toast.error("Failed to load directory integrations");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIntegrations();
  }, []);
  
  // Create new integration
  const createIntegration = async () => {
    try {
      const id = await authConfigService.createDirectoryIntegration(newIntegration);
      
      // Add the new integration to the list with the returned ID
      setIntegrations([
        ...integrations,
        {
          ...newIntegration,
          id,
          last_sync: null
        }
      ]);
      
      setDialogOpen(false);
      toast.success('Directory integration created successfully');
      
      // Reset the form
      setNewIntegration({
        provider: 'azure_ad',
        config: { tenant_id: '', client_id: '', client_secret: '' },
        enabled: false,
        sync_interval: 24
      });
    } catch (error) {
      console.error("Error creating integration:", error);
      toast.error("Failed to create directory integration");
    }
  };
  
  // Update integration
  const updateIntegration = async (integration: DirectoryIntegrationType) => {
    try {
      await authConfigService.updateDirectoryIntegration(integration);
      
      // Update the integration in the list
      setIntegrations(
        integrations.map(i => 
          i.id === integration.id ? integration : i
        )
      );
      
      toast.success('Directory integration updated successfully');
    } catch (error) {
      console.error("Error updating integration:", error);
      toast.error("Failed to update directory integration");
    }
  };
  
  // Delete integration
  const deleteIntegration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }
    
    try {
      await authConfigService.deleteDirectoryIntegration(id);
      
      // Remove the integration from the list
      setIntegrations(
        integrations.filter(i => i.id !== id)
      );
      
      toast.success('Directory integration deleted successfully');
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.error("Failed to delete directory integration");
    }
  };
  
  // Sync with directory
  const syncWithDirectory = async (directoryId: string) => {
    setIsSyncing(true);
    setSyncStats(null);
    
    try {
      const stats = await directoryIntegrationService.syncWithDirectory(directoryId);
      setSyncStats(stats);
      
      // Update the last_sync timestamp in the list
      setIntegrations(
        integrations.map(i => 
          i.id === directoryId ? {
            ...i,
            last_sync: new Date().toISOString()
          } : i
        )
      );
      
      toast.success('Directory sync completed successfully');
    } catch (error) {
      console.error("Error syncing with directory:", error);
      toast.error("Failed to sync with directory");
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Provision user
  const provisionUser = async () => {
    setIsProvisioning(true);
    
    try {
      const result = await directoryIntegrationService.provisionUser(
        userToProvision.email,
        userToProvision.first_name,
        userToProvision.last_name
      );
      
      if (result) {
        setProvisionDialogOpen(false);
        setUserToProvision({
          email: '',
          first_name: '',
          last_name: ''
        });
      }
    } catch (error) {
      console.error("Error provisioning user:", error);
      toast.error("Failed to provision user");
    } finally {
      setIsProvisioning(false);
    }
  };
  
  // Deprovision user
  const deprovisionUser = async () => {
    setIsDeprovisioning(true);
    
    try {
      const success = await directoryIntegrationService.deprovisionUser(userIdToDeprovision);
      
      if (success) {
        setDeprovisionDialogOpen(false);
        setUserIdToDeprovision('');
      }
    } catch (error) {
      console.error("Error deprovisioning user:", error);
      toast.error("Failed to deprovision user");
    } finally {
      setIsDeprovisioning(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading directory integrations...</span>
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Directory Integration</CardTitle>
          <CardDescription>
            You need administrator privileges to access these settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Directory Integration</h1>
          <p className="text-muted-foreground">
            Connect to your organization's directory services for user management.
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={provisionDialogOpen} onOpenChange={setProvisionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="mr-2 h-4 w-4" />
                Provision User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Provision User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the specified details.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={userToProvision.email}
                    onChange={(e) => setUserToProvision({
                      ...userToProvision,
                      email: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={userToProvision.first_name}
                    onChange={(e) => setUserToProvision({
                      ...userToProvision,
                      first_name: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={userToProvision.last_name}
                    onChange={(e) => setUserToProvision({
                      ...userToProvision,
                      last_name: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setProvisionDialogOpen(false)}>Cancel</Button>
                <Button onClick={provisionUser} disabled={isProvisioning}>
                  {isProvisioning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    'Provision User'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={deprovisionDialogOpen} onOpenChange={setDeprovisionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserX className="mr-2 h-4 w-4" />
                Deprovision User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deprovision User</DialogTitle>
                <DialogDescription>
                  Remove a user account from the system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    placeholder="Enter user ID"
                    value={userIdToDeprovision}
                    onChange={(e) => setUserIdToDeprovision(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeprovisionDialogOpen(false)}>Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={deprovisionUser} 
                  disabled={isDeprovisioning || !userIdToDeprovision}
                >
                  {isDeprovisioning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deprovisioning...
                    </>
                  ) : (
                    'Deprovision User'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Connected Directories</CardTitle>
            <CardDescription>
              Manage your connected directory services and sync settings.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Directory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Directory Integration</DialogTitle>
                <DialogDescription>
                  Connect to a directory service to automatically provision and manage users.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Directory Provider</Label>
                  <Select
                    value={newIntegration.provider}
                    onValueChange={(value) => setNewIntegration({
                      ...newIntegration,
                      provider: value,
                      config: value === 'azure_ad' 
                        ? { tenant_id: '', client_id: '', client_secret: '' } 
                        : { ldap_url: '', bind_dn: '', bind_password: '' }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azure_ad">Azure Active Directory</SelectItem>
                      <SelectItem value="ldap">LDAP / Active Directory</SelectItem>
                      <SelectItem value="okta">Okta</SelectItem>
                      <SelectItem value="google">Google Workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newIntegration.provider === 'azure_ad' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tenant_id">Tenant ID</Label>
                      <Input
                        id="tenant_id"
                        value={(newIntegration.config as any).tenant_id || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            tenant_id: e.target.value
                          }
                        })}
                        placeholder="Azure AD Tenant ID"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="client_id">Client ID</Label>
                      <Input
                        id="client_id"
                        value={(newIntegration.config as any).client_id || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            client_id: e.target.value
                          }
                        })}
                        placeholder="Azure AD Application ID"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="client_secret">Client Secret</Label>
                      <Input
                        id="client_secret"
                        type="password"
                        value={(newIntegration.config as any).client_secret || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            client_secret: e.target.value
                          }
                        })}
                        placeholder="Azure AD Client Secret"
                      />
                    </div>
                  </>
                )}
                
                {newIntegration.provider === 'ldap' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ldap_url">LDAP URL</Label>
                      <Input
                        id="ldap_url"
                        value={(newIntegration.config as any).ldap_url || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            ldap_url: e.target.value
                          }
                        })}
                        placeholder="ldap://ldap.example.com:389"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bind_dn">Bind DN</Label>
                      <Input
                        id="bind_dn"
                        value={(newIntegration.config as any).bind_dn || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            bind_dn: e.target.value
                          }
                        })}
                        placeholder="cn=admin,dc=example,dc=com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bind_password">Bind Password</Label>
                      <Input
                        id="bind_password"
                        type="password"
                        value={(newIntegration.config as any).bind_password || ''}
                        onChange={(e) => setNewIntegration({
                          ...newIntegration,
                          config: {
                            ...newIntegration.config,
                            bind_password: e.target.value
                          }
                        })}
                        placeholder="Password"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="sync_interval">Sync Interval (hours)</Label>
                  <Input
                    id="sync_interval"
                    type="number"
                    min="1"
                    max="168"
                    value={newIntegration.sync_interval}
                    onChange={(e) => setNewIntegration({
                      ...newIntegration,
                      sync_interval: parseInt(e.target.value) || 24
                    })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newIntegration.enabled}
                    onCheckedChange={(checked) => setNewIntegration({
                      ...newIntegration,
                      enabled: checked
                    })}
                  />
                  <Label htmlFor="enabled">Enable automatic synchronization</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={createIntegration}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Directory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Directories Connected</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Connect to your organization's directory services to automatically provision
                and manage users. Click "Add Directory" to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Sync Interval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>
                      <div className="font-medium">
                        {integration.provider === 'azure_ad' && 'Azure Active Directory'}
                        {integration.provider === 'ldap' && 'LDAP / Active Directory'}
                        {integration.provider === 'okta' && 'Okta'}
                        {integration.provider === 'google' && 'Google Workspace'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {integration.provider === 'azure_ad' && `Tenant: ${(integration.config as any).tenant_id || 'Not set'}`}
                        {integration.provider === 'ldap' && `Server: ${(integration.config as any).ldap_url || 'Not set'}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`rounded-full w-2 h-2 mr-2 ${integration.enabled ? 'bg-success' : 'bg-muted'}`} />
                        {integration.enabled ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {integration.last_sync 
                        ? new Date(integration.last_sync).toLocaleString() 
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>{integration.sync_interval} hours</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncWithDirectory(integration.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteIntegration(integration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {syncStats && (
            <div className="mt-6 p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Sync Results</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted p-3 rounded-md text-center">
                  <div className="text-2xl font-bold">{syncStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="bg-success/20 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold">{syncStats.created}</div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
                <div className="bg-primary/20 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold">{syncStats.updated}</div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="bg-warning/20 p-3 rounded-md text-center">
                  <div className="text-2xl font-bold">{syncStats.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
