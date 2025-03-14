
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginErrorAlertProps {
  error: string | null;
}

export const LoginErrorAlert: React.FC<LoginErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
