
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { user, login, resetPassword, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
      setShowForgotPassword(false);
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-secondary mr-2" />
            <div className="font-bold text-2xl">MeetingMaster</div>
          </div>
        </div>

        {showForgotPassword ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address below and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Send Reset Link"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="link"
                onClick={() => {
                  setShowForgotPassword(false);
                  clearError();
                }}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your MeetingMaster account to access the room booking system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => {
                        setShowForgotPassword(true);
                        clearError();
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full text-muted-foreground">
                <p>Demo credentials:</p>
                <p>Admin: admin@example.com / password</p>
                <p>User: user@example.com / password</p>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
      <div className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} MeetingMaster. All rights reserved.
      </div>
    </div>
  );
}
