
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import PasswordResetForm from "./PasswordResetForm";

export default function LoginPage() {
  const { error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="text-primary text-4xl font-bold">RoomBooker</div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="reset">Reset Password</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm from={from} error={error} clearError={clearError} />
          </TabsContent>

          <TabsContent value="reset">
            <PasswordResetForm error={error} clearError={clearError} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
