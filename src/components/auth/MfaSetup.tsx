
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mfaService, MfaMethod } from "@/services/MfaService";
import { Loader2, QrCode, ShieldCheck, ShieldAlert, ClipboardCopy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MfaSetup() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [methods, setMethods] = useState<MfaMethod[]>([]);
  const [recoveryCodesVisible, setRecoveryCodesVisible] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  
  // TOTP setup state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [totpMethod, setTotpMethod] = useState<MfaMethod | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  
  // Load MFA settings
  useEffect(() => {
    const loadMfaSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const mfaSettings = await mfaService.getUserMfaSettings(user.id);
        
        if (mfaSettings) {
          setMfaEnabled(mfaSettings.is_enabled);
          setMethods(mfaSettings.methods || []);
        }
      } catch (error) {
        console.error("Error loading MFA settings:", error);
        toast.error("Failed to load MFA settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMfaSettings();
  }, [user]);
  
  // Setup TOTP
  const setupTotp = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await mfaService.setupTotp(user.id);
      
      if (response) {
        setQrCode(response.qr_code);
        setSecret(response.secret);
        
        // Get the latest MFA settings
        const mfaSettings = await mfaService.getUserMfaSettings(user.id);
        
        if (mfaSettings?.methods) {
          // Find the new TOTP method (should be the last one)
          const newTotp = mfaSettings.methods.find(
            m => m.type === 'totp' && !m.verified
          );
          
          if (newTotp) {
            setTotpMethod(newTotp);
            setMethods(mfaSettings.methods);
          }
        }
      }
    } catch (error) {
      console.error("Error setting up TOTP:", error);
      toast.error("Failed to set up authenticator app");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify TOTP
  const verifyTotp = async () => {
    if (!user || !totpMethod) return;
    
    setIsLoading(true);
    try {
      const success = await mfaService.verifyTotp(
        user.id,
        totpMethod.id,
        verificationCode
      );
      
      if (success) {
        // Reset TOTP setup state
        setQrCode(null);
        setSecret(null);
        setTotpMethod(null);
        setVerificationCode("");
        
        // Get the latest MFA settings
        const mfaSettings = await mfaService.getUserMfaSettings(user.id);
        
        if (mfaSettings?.methods) {
          setMethods(mfaSettings.methods);
        }
      }
    } catch (error) {
      console.error("Error verifying TOTP:", error);
      toast.error("Failed to verify authenticator app");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enable MFA
  const enableMfa = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await mfaService.enableMfa(user.id);
      
      if (success) {
        setMfaEnabled(true);
        
        // Get recovery codes
        const codes = await mfaService.getRecoveryCodes(user.id);
        setRecoveryCodes(codes);
        setRecoveryCodesVisible(true);
      }
    } catch (error) {
      console.error("Error enabling MFA:", error);
      toast.error("Failed to enable MFA");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disable MFA
  const disableMfa = async () => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to disable multi-factor authentication? This will make your account less secure.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await mfaService.disableMfa(user.id);
      
      if (success) {
        setMfaEnabled(false);
        setRecoveryCodesVisible(false);
      }
    } catch (error) {
      console.error("Error disabling MFA:", error);
      toast.error("Failed to disable MFA");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show recovery codes
  const showRecoveryCodes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const codes = await mfaService.getRecoveryCodes(user.id);
      setRecoveryCodes(codes);
      setRecoveryCodesVisible(true);
    } catch (error) {
      console.error("Error getting recovery codes:", error);
      toast.error("Failed to get recovery codes");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Regenerate recovery codes
  const regenerateRecoveryCodes = async () => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to regenerate recovery codes? Your existing codes will no longer work.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const codes = await mfaService.regenerateRecoveryCodes(user.id);
      setRecoveryCodes(codes);
    } catch (error) {
      console.error("Error regenerating recovery codes:", error);
      toast.error("Failed to regenerate recovery codes");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy all recovery codes
  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
      .then(() => toast.success("Recovery codes copied to clipboard"))
      .catch(() => toast.error("Failed to copy recovery codes"));
  };
  
  if (isLoading && !qrCode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading MFA settings...</span>
      </div>
    );
  }
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>
            You need to be logged in to manage MFA settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            {mfaEnabled ? (
              <ShieldCheck className="h-6 w-6 text-success mr-2" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-warning mr-2" />
            )}
            <CardTitle>Multi-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account with multi-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={mfaEnabled ? "bg-success/20" : "bg-warning/20"}>
            <AlertDescription>
              {mfaEnabled 
                ? "MFA is enabled. Your account has an additional layer of security." 
                : "MFA is not enabled. Enable MFA to make your account more secure."}
            </AlertDescription>
          </Alert>
          
          {mfaEnabled ? (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Verification Methods</h3>
                {methods.length > 0 ? (
                  <div className="space-y-2">
                    {methods.map((method) => (
                      <div 
                        key={method.id} 
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Added on {new Date(method.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-sm ${method.verified ? 'text-success' : 'text-warning'}`}>
                          {method.verified ? 'Verified' : 'Not Verified'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No verification methods configured.</div>
                )}
              </div>
              
              {recoveryCodesVisible && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recovery Codes</h3>
                    <Button variant="outline" size="sm" onClick={copyRecoveryCodes}>
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Store these recovery codes in a secure location. Each code can only be used once to sign in if you lose access to your verification methods.
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={regenerateRecoveryCodes}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Recovery Codes
                  </Button>
                </div>
              )}
            </>
          ) : qrCode && secret && totpMethod ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Set Up Authenticator App</h3>
              <div className="flex flex-col items-center p-4 border rounded-md">
                <div className="mb-4">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Scan this QR code with your authenticator app, or enter the code manually:
                  </p>
                  <div className="font-mono bg-muted p-2 rounded">{secret}</div>
                </div>
                <div className="w-full space-y-2">
                  <Label htmlFor="verification_code">Enter the 6-digit code from your app</Label>
                  <Input
                    id="verification_code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    placeholder="000000"
                    className="text-center tracking-widest"
                  />
                  <Button 
                    onClick={verifyTotp}
                    disabled={verificationCode.length !== 6 || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Methods</h3>
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-muted-foreground">
                      Use an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                    </div>
                  </div>
                  <Button onClick={setupTotp} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Set Up'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {mfaEnabled ? (
            <>
              <Button variant="outline" onClick={showRecoveryCodes} disabled={isLoading}>
                Show Recovery Codes
              </Button>
              <Button variant="destructive" onClick={disableMfa} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable MFA'
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={enableMfa} 
              disabled={isLoading || methods.filter(m => m.verified).length === 0}
              className="ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                'Enable MFA'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
