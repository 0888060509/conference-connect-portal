
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoginForm from "./LoginForm";
import PasswordResetForm from "./PasswordResetForm";
import DemoCredentials from "./DemoCredentials";
import { InitialSuperAdminSetup } from "@/components/admin/settings/InitialSuperAdminSetup";

export default function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSuperAdminSetup, setShowSuperAdminSetup] = useState(false);
  const navigate = useNavigate();

  const toggleSuperAdminSetup = () => {
    setShowSuperAdminSetup(!showSuperAdminSetup);
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="reset-password">Reset Password</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <LoginForm setError={setAuthError} />
          </TabsContent>
          <TabsContent value="reset-password">
            <PasswordResetForm setError={setAuthError} />
          </TabsContent>
        </Tabs>
        
        <DemoCredentials />
        
        <div className="text-center">
          <button 
            onClick={toggleSuperAdminSetup}
            className="text-xs text-muted-foreground hover:underline focus:outline-none"
          >
            {showSuperAdminSetup ? "Hide Superadmin Setup" : "Show Superadmin Setup"}
          </button>
        </div>
        
        {showSuperAdminSetup && (
          <InitialSuperAdminSetup email="cuong.huynh@eggstech.io" />
        )}
      </div>
    </div>
  );
}
