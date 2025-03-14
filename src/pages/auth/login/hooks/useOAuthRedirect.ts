
import { useState, useEffect } from "react";
import { useNavigate, Location } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { processGoogleAuthUserData } from "@/contexts/auth/actions/googleAuthActions";

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Flag to prevent multiple executions
    let isHandling = false;

    const handleRedirect = async () => {
      if (isHandling || isProcessing) return;
      
      const hashParams = location.hash;
      const queryParams = new URLSearchParams(location.search);

      if ((hashParams && (hashParams.includes('access_token') || hashParams.includes('error'))) || 
          queryParams.has('error_description')) {

        console.log('Auth redirect detected. Hash:', hashParams, 'Query:', location.search);
        setIsGoogleSigningIn(true);
        setIsProcessing(true);
        isHandling = true;
        clearError();

        try {
          // Process Google auth metadata
          await processGoogleAuthUserData();
          
          // Get the current session after the redirect
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error processing auth redirect:', error);
            setLocalError(error.message);
            toast.error("Authentication failed: " + error.message);
            setIsProcessing(false);
          } else if (data.session) {
            console.log('Successfully authenticated after redirect, session found');
            toast.success("Successfully signed in!");
            
            // Redirect to the dashboard or original destination
            const destination = from || '/dashboard';
            console.log(`Redirecting to ${destination}`);
            
            // Use a short timeout to allow the auth state to settle
            setTimeout(() => {
              navigate(destination, { replace: true });
              setIsProcessing(false);
            }, 100);
          } else {
            console.log('No session found after redirect');

            if (queryParams.has('error_description')) {
              const errorDesc = queryParams.get('error_description');
              setLocalError(`Authentication failed: ${errorDesc}`);
              toast.error(`Authentication failed: ${errorDesc}`);
            } else {
              setLocalError("Authentication failed: No session found");
              toast.error("Authentication failed: No session found");
            }
            setIsProcessing(false);
          }
        } catch (err: any) {
          console.error("Error during OAuth redirect handling:", err);
          setLocalError(err?.message || "Authentication failed");
          toast.error("Authentication failed: " + (err?.message || "Unknown error"));
          setIsProcessing(false);
        } finally {
          setIsGoogleSigningIn(false);
          isHandling = false;
        }
      }
    };

    handleRedirect();
    
    // Cleanup function
    return () => {
      // No need for additional cleanup
    };
  }, [location, navigate, from, clearError, isProcessing]);

  return {
    isGoogleSigningIn, 
    setIsGoogleSigningIn, 
    localError, 
    setLocalError
  };
};
