import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import DemoCredentials from "./DemoCredentials";
import { LoginErrorAlert } from "./components/LoginErrorAlert";
import { LoginFormFields } from "./components/LoginFormFields";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { useOAuthRedirect } from "./hooks/useOAuthRedirect";

interface LoginFormProps {
  from: string;
  error: string | null;
  clearError: () => void;
}

export default function LoginForm({ from, error, clearError }: LoginFormProps) {
  const { login, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use the OAuth redirect hook
  const { 
    isGoogleSigningIn, 
    setIsGoogleSigningIn, 
    localError, 
    setLocalError 
  } = useOAuthRedirect({ location, navigate, from, clearError });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      console.log("Attempting login with email:", email);
      await login(email, password, remember);
      toast.success("Successfully logged in!");
      navigate("/", { replace: true }); // Redirect to homepage after successful login
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
          <LoginErrorAlert error={displayError} />

          <LoginFormFields
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            remember={remember}
            setRemember={setRemember}
            isSubmitting={isSubmitting}
            isGoogleSigningIn={isGoogleSigningIn}
            clearError={clearError}
            setLocalError={setLocalError}
          />

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn || isSubmitting}
            isSigningIn={isGoogleSigningIn}
          />
        </form>

        <DemoCredentials />
      </CardContent>
    </Card>
  );
}