
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DirectoryIntegrationProps {
  settings: Record<string, any>;
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export function DirectoryIntegration({ settings, onUpdateSetting }: DirectoryIntegrationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Directory Integration</CardTitle>
        <CardDescription>
          Configure user directory synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Directory Provider */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Directory Provider</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="directory-enabled">Enable Directory Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Synchronize users and groups from external directory
                </p>
              </div>
              <Switch 
                id="directory-enabled"
                checked={settings?.directory?.enabled === true}
                onCheckedChange={(checked) => onUpdateSetting('directory', {
                  ...settings?.directory,
                  enabled: checked
                })}
              />
            </div>
            
            {settings?.directory?.enabled && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="directory-provider">Provider</Label>
                  <Select 
                    value={settings?.directory?.provider || 'azure-ad'}
                    onValueChange={(value) => onUpdateSetting('directory', {
                      ...settings?.directory,
                      provider: value
                    })}
                  >
                    <SelectTrigger id="directory-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azure-ad">Azure AD</SelectItem>
                      <SelectItem value="gsuite">Google Workspace</SelectItem>
                      <SelectItem value="okta">Okta</SelectItem>
                      <SelectItem value="ldap">LDAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="sync-interval">Sync Interval (hours)</Label>
                  <Input 
                    id="sync-interval"
                    type="number" 
                    min={1}
                    max={168}
                    value={settings?.directory?.sync_interval || 24}
                    onChange={(e) => onUpdateSetting('directory', {
                      ...settings?.directory,
                      sync_interval: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Provider Settings - Azure AD */}
        {settings?.directory?.enabled && settings?.directory?.provider === 'azure-ad' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Azure AD Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                <Input 
                  id="azure-tenant-id"
                  type="text"
                  placeholder="00000000-0000-0000-0000-000000000000" 
                  value={settings?.directory?.config?.tenant_id || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      tenant_id: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="azure-client-id">Client ID</Label>
                <Input 
                  id="azure-client-id"
                  type="text"
                  placeholder="00000000-0000-0000-0000-000000000000" 
                  value={settings?.directory?.config?.client_id || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      client_id: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="azure-client-secret">Client Secret</Label>
                <Input 
                  id="azure-client-secret"
                  type="password"
                  placeholder="Enter client secret" 
                  value={settings?.directory?.config?.client_secret || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      client_secret: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Provider Settings - LDAP */}
        {settings?.directory?.enabled && settings?.directory?.provider === 'ldap' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">LDAP Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ldap-url">LDAP URL</Label>
                <Input 
                  id="ldap-url"
                  type="text"
                  placeholder="ldap://ldap.example.com:389" 
                  value={settings?.directory?.config?.url || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      url: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ldap-bind-dn">Bind DN</Label>
                <Input 
                  id="ldap-bind-dn"
                  type="text"
                  placeholder="cn=admin,dc=example,dc=com" 
                  value={settings?.directory?.config?.bind_dn || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      bind_dn: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ldap-bind-password">Bind Password</Label>
                <Input 
                  id="ldap-bind-password"
                  type="password"
                  placeholder="Enter bind password" 
                  value={settings?.directory?.config?.bind_password || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      bind_password: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ldap-base-dn">Search Base DN</Label>
                <Input 
                  id="ldap-base-dn"
                  type="text"
                  placeholder="dc=example,dc=com" 
                  value={settings?.directory?.config?.base_dn || ''}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    config: {
                      ...settings?.directory?.config,
                      base_dn: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* User Attribute Mapping */}
        {settings?.directory?.enabled && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Attribute Mapping</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="map-email">Email Attribute</Label>
                <Input 
                  id="map-email"
                  type="text"
                  placeholder="mail" 
                  value={settings?.directory?.mapping?.email || 'mail'}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    mapping: {
                      ...settings?.directory?.mapping,
                      email: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="map-firstname">First Name Attribute</Label>
                <Input 
                  id="map-firstname"
                  type="text"
                  placeholder="givenName" 
                  value={settings?.directory?.mapping?.first_name || 'givenName'}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    mapping: {
                      ...settings?.directory?.mapping,
                      first_name: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="map-lastname">Last Name Attribute</Label>
                <Input 
                  id="map-lastname"
                  type="text"
                  placeholder="sn" 
                  value={settings?.directory?.mapping?.last_name || 'sn'}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    mapping: {
                      ...settings?.directory?.mapping,
                      last_name: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="map-department">Department Attribute</Label>
                <Input 
                  id="map-department"
                  type="text"
                  placeholder="department" 
                  value={settings?.directory?.mapping?.department || 'department'}
                  onChange={(e) => onUpdateSetting('directory', {
                    ...settings?.directory,
                    mapping: {
                      ...settings?.directory?.mapping,
                      department: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" type="button">
            Test Connection
          </Button>
          
          <Button variant="default" type="button">
            Save Directory Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
