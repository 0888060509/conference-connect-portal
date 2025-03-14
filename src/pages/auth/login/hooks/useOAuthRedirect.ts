
import { useState, useEffect } from "react";
import { useNavigate, Location } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface UseOAuthRedirectParams {
  location: Location;
  navigate: ReturnType<typeof useNavigate>;
  from: string;
  clearError: () => void;
}

export const useOAuthRedirect = ({ 
  location, 
  navigate, 
  from, 
  clearError 
}: UseOAuthRedirectParams) => {
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  return {
    isGoogleSigningIn, 
    setIsGoogleSigningIn, 
    localError, 
    setLocalError
  };
};
