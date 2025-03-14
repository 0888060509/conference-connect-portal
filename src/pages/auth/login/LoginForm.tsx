
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DemoCredentials from "./DemoCredentials";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface LoginFormProps {
  from: string;
  error: string | null;
  clearError: () => void;
}

export default function LoginForm({ from, error, clearError }: LoginFormProps) {
  const { login, signInWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth redirects
  useEffect(() => {
    const handleRedirect = async () => {
      // Check if we have a hash parameter from OAuth redirect
      const hashParams = location.hash;
      if (hashParams && (hashParams.includes('access_token') || hashParams.includes('error'))) {
        console.log('Auth redirect detected in LoginForm:', hashParams);
        setIsGoogleSigningIn(true);
        clearError();
        
        try {
          // Let Supabase handle the hash URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing auth redirect:', error);
            setLocalError(error.message);
            toast.error("Authentication failed: " + error.message);
          } else if (data.session) {
            console.log('Successfully authenticated after redirect');
            toast.success("Successfully signed in!");
            navigate(from, { replace: true });
          } else {
            console.log('No session found after redirect');
            setLocalError("Authentication failed: No session found");
            toast.error("Authentication failed: No session found");
          }
        } catch (err: any) {
          console.error("Error during OAuth redirect handling:", err);
          setLocalError(err?.message || "Authentication failed");
          toast.error("Authentication failed: " + (err?.message || "Unknown error"));
        } finally {
          setIsGoogleSigningIn(false);
        }
      }
    };
    
    handleRedirect();
  }, [location, navigate, from, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    
    try {
      console.log("Attempting login with email:", email);
      await login(email, password, remember);
      toast.success("Successfully logged in!");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setLocalError(err?.message || "Login failed");
      toast.error("Login failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      setLocalError(null);
      clearError();
      
      console.log("Starting Google sign-in flow");
      await signInWithGoogle();
      // The redirect will happen automatically via Supabase
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setLocalError(err?.message || "Google sign-in failed");
      toast.error("Google sign-in failed: " + (err?.message || "Unknown error"));
      setIsGoogleSigningIn(false);
    }
  };

  const displayError = error || localError;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
                clearError();
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError(null);
                clearError();
              }}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSigningIn}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
          
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={isGoogleSigningIn || isSubmitting}
            className="w-full"
          >
            {isGoogleSigningIn ? (
              "Connecting to Google..."
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </form>

        <DemoCredentials />
      </CardContent>
    </Card>
  );
