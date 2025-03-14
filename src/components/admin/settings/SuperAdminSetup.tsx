
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Key, Shield, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";

export function SuperAdminSetup() {
  const [superadminEmail, setSuperadminEmail] = useState("");
  const [superadminEmails, setSuperadminEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuperadminEmails();
  }, []);

  const loadSuperadminEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('auth/superadmin-setup');
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuperadminEmails(data.superadmin_emails || []);
    } catch (err) {
      console.error("Error loading superadmin emails:", err);
      setError(err instanceof Error ? err.message : "Failed to load superadmin emails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuperadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!superadminEmail || !superadminEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('auth/superadmin-setup', {
        method: 'POST',
        body: { email: superadminEmail }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuperadminEmails(data.superadmin_emails || []);
      setSuperadminEmail("");
      toast.success(`Added ${superadminEmail} as a superadmin`);
    } catch (err) {
      console.error("Error adding superadmin:", err);
      setError(err instanceof Error ? err.message : "Failed to add superadmin");
      toast.error(err instanceof Error ? err.message : "Failed to add superadmin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSuperadmin = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('auth/superadmin-setup', {
        method: 'DELETE',
        body: { email }  // Use body instead of query for DELETE
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuperadminEmails(data.superadmin_emails || []);
      toast.success(`Removed ${email} from superadmins`);
    } catch (err) {
      console.error("Error removing superadmin:", err);
      setError(err instanceof Error ? err.message : "Failed to remove superadmin");
      toast.error(err instanceof Error ? err.message : "Failed to remove superadmin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Superadmin Accounts</CardTitle>
        </div>
        <CardDescription>
          Manage superadmin access for special accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleAddSuperadmin} className="flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <label htmlFor="superadminEmail" className="text-sm font-medium">
              Add Superadmin Email
            </label>
            <Input
              id="superadminEmail"
              type="email"
              placeholder="admin@example.com"
              value={superadminEmail}
              onChange={(e) => setSuperadminEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Superadmin
          </Button>
        </form>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Current Superadmins
          </h3>
          
          {superadminEmails.length === 0 ? (
            <p className="text-sm text-muted-foreground">No superadmins configured</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {superadminEmails.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveSuperadmin(email)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Superadmins have full access to all features and settings of the application. 
            When a user with one of these email addresses signs in using Google Authentication, 
            they will automatically be granted admin privileges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
