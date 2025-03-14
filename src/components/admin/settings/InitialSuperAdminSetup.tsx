
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InitialSuperAdminSetupProps {
  email: string;
}

export function InitialSuperAdminSetup({ email }: InitialSuperAdminSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupSuperAdmin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, check if we need to create the system setting
      const { data: existingSetting, error: checkError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'superadmin_emails')
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }
      
      // If setting exists, check if email is already in the list
      let currentEmails: string[] = [];
      if (existingSetting?.setting_value) {
        currentEmails = existingSetting.setting_value as string[];
        if (currentEmails.includes(email.toLowerCase())) {
          setIsComplete(true);
          toast.success(`${email} is already configured as a superadmin`);
          return;
        }
      }
      
      // Add email to the list
      currentEmails.push(email.toLowerCase());
      
      // Update or insert the setting
      const { error: updateError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'superadmin_emails',
          setting_value: currentEmails,
          description: 'List of email addresses that should automatically be granted admin role'
        }, {
          onConflict: 'setting_key'
        });
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      setIsComplete(true);
      toast.success(`${email} has been added as a superadmin`);
    } catch (err) {
      console.error("Error setting up superadmin:", err);
      setError(err instanceof Error ? err.message : "Failed to set up superadmin");
      toast.error("Failed to set up superadmin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Initial Superadmin Setup</CardTitle>
        </div>
        <CardDescription>
          Set up {email} as the initial superadmin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isComplete ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <p>{email} has been configured as a superadmin</p>
          </div>
        ) : (
          <Button 
            onClick={setupSuperAdmin} 
            disabled={isLoading} 
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Set as Superadmin
          </Button>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            After setting up the superadmin, log in with this email address using Google Authentication 
            to access all administrative features of the application.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
