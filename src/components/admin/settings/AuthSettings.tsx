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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  authConfigService, 
  PasswordPolicy, 
  SessionSettings, 
  OAuthProviders, 
  EmailTemplates 
} from "@/services/AuthConfigService";
import { Loader2, Save, Shield, Mail, Key, RefreshCw, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export function AuthSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    min_length: 10,
    require_uppercase: true,
    require_lowercase: true,
    require_number: true,
    require_special: true
  });
  
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    session_duration_seconds: 3600,
    refresh_token_rotation: true,
    refresh_token_expiry_days: 7
  });
  
  const [oauthProviders, setOauthProviders] = useState<OAuthProviders>({
    google: {
      enabled: false,
      client_id: '',
      client_secret: ''
    },
    microsoft: {
      enabled: false,
      client_id: '',
      client_secret: '',
      tenant_id: ''
    }
  });
  
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates>({
    verification: {
      subject: 'Verify your email',
      custom_template: false
    },
    password_reset: {
      subject: 'Reset your password',
      custom_template: false
    },
    magic_link: {
      subject: 'Your magic link',
      custom_template: false
    }
  });

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const [passwordPolicyData, sessionSettingsData, oauthProvidersData, emailTemplatesData] = await Promise.all([
          authConfigService.getPasswordPolicy(),
          authConfigService.getSessionSettings(),
          authConfigService.getOAuthProviders(),
          authConfigService.getEmailTemplates()
        ]);
        
        setPasswordPolicy(passwordPolicyData);
        setSessionSettings(sessionSettingsData);
        setOauthProviders(oauthProvidersData);
        setEmailTemplates(emailTemplatesData);
      } catch (error) {
        console.error("Error loading auth settings:", error);
        toast.error("Failed to load authentication settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings based on active tab
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      switch (activeTab) {
        case "general":
          await authConfigService.updatePasswordPolicy(passwordPolicy);
          await authConfigService.updateSessionSettings(sessionSettings);
          break;
        case "oauth":
          await authConfigService.updateOAuthProviders(oauthProviders);
          break;
        case "email":
          await authConfigService.updateEmailTemplates(emailTemplates);
          break;
      }
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset to default settings
  const resetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset to default settings? This cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      switch (activeTab) {
        case "general":
          setPasswordPolicy({
            min_length: 10,
            require_uppercase: true,
            require_lowercase: true,
            require_number: true,
            require_special: true
          });
          setSessionSettings({
            session_duration_seconds: 3600,
            refresh_token_rotation: true,
            refresh_token_expiry_days: 7
          });
          break;
        case "oauth":
          setOauthProviders({
            google: {
              enabled: false,
              client_id: '',
              client_secret: ''
            },
            microsoft: {
              enabled: false,
              client_id: '',
              client_secret: '',
              tenant_id: ''
            }
          });
          break;
        case "email":
          setEmailTemplates({
            verification: {
              subject: 'Verify your email',
              custom_template: false
            },
            password_reset: {
              subject: 'Reset your password',
              custom_template: false
            },
            magic_link: {
              subject: 'Your magic link',
              custom_template: false
            }
          });
          break;
      }
      
      toast.success("Settings reset to defaults");
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading authentication settings...</span>
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Settings</CardTitle>
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
          <h1 className="text-2xl font-bold">Authentication Settings</h1>
          <p className="text-muted-foreground">
            Configure authentication methods, security policies, and user provisioning.
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general">
            <Shield className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <User className="mr-2 h-4 w-4" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Password Policy
              </CardTitle>
              <CardDescription>
                Configure password requirements for user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min_length">Minimum Password Length</Label>
                <Input
                  id="min_length"
                  type="number"
                  min="8"
                  max="32"
                  value={passwordPolicy.min_length}
                  onChange={(e) => setPasswordPolicy({
                    ...passwordPolicy,
                    min_length: parseInt(e.target.value) || 10
                  })}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Uppercase Letter</Label>
                    <p className="text-xs text-muted-foreground">Passwords must contain at least one uppercase letter</p>
                  </div>
                  <Switch 
                    checked={passwordPolicy.require_uppercase}
                    onCheckedChange={(checked) => setPasswordPolicy({
                      ...passwordPolicy,
                      require_uppercase: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Lowercase Letter</Label>
                    <p className="text-xs text-muted-foreground">Passwords must contain at least one lowercase letter</p>
                  </div>
                  <Switch 
                    checked={passwordPolicy.require_lowercase}
                    onCheckedChange={(checked) => setPasswordPolicy({
                      ...passwordPolicy,
                      require_lowercase: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Number</Label>
                    <p className="text-xs text-muted-foreground">Passwords must contain at least one number</p>
                  </div>
                  <Switch 
                    checked={passwordPolicy.require_number}
                    onCheckedChange={(checked) => setPasswordPolicy({
                      ...passwordPolicy,
                      require_number: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Special Character</Label>
                    <p className="text-xs text-muted-foreground">Passwords must contain at least one special character</p>
                  </div>
                  <Switch 
                    checked={passwordPolicy.require_special}
                    onCheckedChange={(checked) => setPasswordPolicy({
                      ...passwordPolicy,
                      require_special: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5" />
                Session Settings
              </CardTitle>
              <CardDescription>
                Configure user session duration and token refresh policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session_duration">Session Duration (seconds)</Label>
                <Input
                  id="session_duration"
                  type="number"
                  min="300"
                  max="86400"
                  value={sessionSettings.session_duration_seconds}
                  onChange={(e) => setSessionSettings({
                    ...sessionSettings,
                    session_duration_seconds: parseInt(e.target.value) || 3600
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  How long a user session remains active before requiring re-authentication.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Refresh Token Rotation</Label>
                  <p className="text-xs text-muted-foreground">Issue a new refresh token with each use</p>
                </div>
                <Switch 
                  checked={sessionSettings.refresh_token_rotation}
                  onCheckedChange={(checked) => setSessionSettings({
                    ...sessionSettings,
                    refresh_token_rotation: checked
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh_token_expiry">Refresh Token Expiry (days)</Label>
                <Input
                  id="refresh_token_expiry"
                  type="number"
                  min="1"
                  max="90"
                  value={sessionSettings.refresh_token_expiry_days}
                  onChange={(e) => setSessionSettings({
                    ...sessionSettings,
                    refresh_token_expiry_days: parseInt(e.target.value) || 7
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  How long refresh tokens are valid before requiring re-authentication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="oauth" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Authentication</CardTitle>
              <CardDescription>
                Configure Google OAuth for single sign-on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="google_enabled">Enable Google Authentication</Label>
                <Switch 
                  id="google_enabled"
                  checked={oauthProviders.google.enabled}
                  onCheckedChange={(checked) => setOauthProviders({
                    ...oauthProviders,
                    google: {
                      ...oauthProviders.google,
                      enabled: checked
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google_client_id">Client ID</Label>
                <Input
                  id="google_client_id"
                  value={oauthProviders.google.client_id}
                  onChange={(e) => setOauthProviders({
                    ...oauthProviders,
                    google: {
                      ...oauthProviders.google,
                      client_id: e.target.value
                    }
                  })}
                  placeholder="Google OAuth Client ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google_client_secret">Client Secret</Label>
                <Input
                  id="google_client_secret"
                  type="password"
                  value={oauthProviders.google.client_secret}
                  onChange={(e) => setOauthProviders({
                    ...oauthProviders,
                    google: {
                      ...oauthProviders.google,
                      client_secret: e.target.value
                    }
                  })}
                  placeholder="Google OAuth Client Secret"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Microsoft Authentication</CardTitle>
              <CardDescription>
                Configure Microsoft OAuth for single sign-on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="microsoft_enabled">Enable Microsoft Authentication</Label>
                <Switch 
                  id="microsoft_enabled"
                  checked={oauthProviders.microsoft.enabled}
                  onCheckedChange={(checked) => setOauthProviders({
                    ...oauthProviders,
                    microsoft: {
                      ...oauthProviders.microsoft,
                      enabled: checked
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="microsoft_client_id">Client ID</Label>
                <Input
                  id="microsoft_client_id"
                  value={oauthProviders.microsoft.client_id}
                  onChange={(e) => setOauthProviders({
                    ...oauthProviders,
                    microsoft: {
                      ...oauthProviders.microsoft,
                      client_id: e.target.value
                    }
                  })}
                  placeholder="Microsoft OAuth Application ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="microsoft_client_secret">Client Secret</Label>
                <Input
                  id="microsoft_client_secret"
                  type="password"
                  value={oauthProviders.microsoft.client_secret}
                  onChange={(e) => setOauthProviders({
                    ...oauthProviders,
                    microsoft: {
                      ...oauthProviders.microsoft,
                      client_secret: e.target.value
                    }
                  })}
                  placeholder="Microsoft OAuth Client Secret"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="microsoft_tenant_id">Tenant ID (Optional)</Label>
                <Input
                  id="microsoft_tenant_id"
                  value={oauthProviders.microsoft.tenant_id || ''}
                  onChange={(e) => setOauthProviders({
                    ...oauthProviders,
                    microsoft: {
                      ...oauthProviders.microsoft,
                      tenant_id: e.target.value
                    }
                  })}
                  placeholder="Microsoft Azure AD Tenant ID"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to allow any Microsoft account, or specify a tenant ID to restrict to a specific organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification Template</CardTitle>
              <CardDescription>
                Configure the email sent when users need to verify their email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification_subject">Email Subject</Label>
                <Input
                  id="verification_subject"
                  value={emailTemplates.verification.subject}
                  onChange={(e) => setEmailTemplates({
                    ...emailTemplates,
                    verification: {
                      ...emailTemplates.verification,
                      subject: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="verification_custom">Use Custom Template</Label>
                <Switch 
                  id="verification_custom"
                  checked={emailTemplates.verification.custom_template}
                  onCheckedChange={(checked) => setEmailTemplates({
                    ...emailTemplates,
                    verification: {
                      ...emailTemplates.verification,
                      custom_template: checked
                    }
                  })}
                />
              </div>
              
              {emailTemplates.verification.custom_template && (
                <div className="space-y-2">
                  <Label htmlFor="verification_html">Email HTML Content</Label>
                  <textarea
                    id="verification_html"
                    className="w-full min-h-32 p-2 border rounded-md"
                    value={emailTemplates.verification.html_content || ''}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      verification: {
                        ...emailTemplates.verification,
                        html_content: e.target.value
                      }
                    })}
                    placeholder="<html><body><h1>Verify your email</h1><p>Click the link below to verify your email address:</p><p>{{ .ConfirmationURL }}</p></body></html>"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {{ .ConfirmationURL }} to insert the verification link.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password Reset Template</CardTitle>
              <CardDescription>
                Configure the email sent when users request a password reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset_subject">Email Subject</Label>
                <Input
                  id="reset_subject"
                  value={emailTemplates.password_reset.subject}
                  onChange={(e) => setEmailTemplates({
                    ...emailTemplates,
                    password_reset: {
                      ...emailTemplates.password_reset,
                      subject: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reset_custom">Use Custom Template</Label>
                <Switch 
                  id="reset_custom"
                  checked={emailTemplates.password_reset.custom_template}
                  onCheckedChange={(checked) => setEmailTemplates({
                    ...emailTemplates,
                    password_reset: {
                      ...emailTemplates.password_reset,
                      custom_template: checked
                    }
                  })}
                />
              </div>
              
              {emailTemplates.password_reset.custom_template && (
                <div className="space-y-2">
                  <Label htmlFor="reset_html">Email HTML Content</Label>
                  <textarea
                    id="reset_html"
                    className="w-full min-h-32 p-2 border rounded-md"
                    value={emailTemplates.password_reset.html_content || ''}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      password_reset: {
                        ...emailTemplates.password_reset,
                        html_content: e.target.value
                      }
                    })}
                    placeholder="<html><body><h1>Reset your password</h1><p>Click the link below to reset your password:</p><p>{{ .ConfirmationURL }}</p></body></html>"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {{ .ConfirmationURL }} to insert the password reset link.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Magic Link Template</CardTitle>
              <CardDescription>
                Configure the email sent when users sign in with a magic link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic_subject">Email Subject</Label>
                <Input
                  id="magic_subject"
                  value={emailTemplates.magic_link.subject}
                  onChange={(e) => setEmailTemplates({
                    ...emailTemplates,
                    magic_link: {
                      ...emailTemplates.magic_link,
                      subject: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="magic_custom">Use Custom Template</Label>
                <Switch 
                  id="magic_custom"
                  checked={emailTemplates.magic_link.custom_template}
                  onCheckedChange={(checked) => setEmailTemplates({
                    ...emailTemplates,
                    magic_link: {
                      ...emailTemplates.magic_link,
                      custom_template: checked
                    }
                  })}
                />
              </div>
              
              {emailTemplates.magic_link.custom_template && (
                <div className="space-y-2">
                  <Label htmlFor="magic_html">Email HTML Content</Label>
                  <textarea
                    id="magic_html"
                    className="w-full min-h-32 p-2 border rounded-md"
                    value={emailTemplates.magic_link.html_content || ''}
                    onChange={(e) => setEmailTemplates({
                      ...emailTemplates,
                      magic_link: {
                        ...emailTemplates.magic_link,
                        html_content: e.target.value
                      }
                    })}
                    placeholder="<html><body><h1>Sign in to your account</h1><p>Click the link below to sign in to your account:</p><p>{{ .ConfirmationURL }}</p></body></html>"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {{ .ConfirmationURL }} to insert the magic link.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
