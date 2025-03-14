
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface SupabaseAuthUIProps {
  redirectTo?: string;
  view?: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password';
}

export function SupabaseAuthUI({ redirectTo = '/dashboard', view = 'sign_in' }: SupabaseAuthUIProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password'>(view);

  useEffect(() => {
    // Check if already authenticated
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(redirectTo);
      }
    };
    
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: 'Signed in successfully',
          description: 'Welcome back!',
        });
        navigate(redirectTo);
      } else if (event === 'PASSWORD_RECOVERY') {
        setAuthView('forgotten_password');
        toast({
          title: 'Password reset requested',
          description: 'Please check your email for reset instructions.',
        });
      } else if (event === 'USER_UPDATED') {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                }
              }
            },
            className: {
              button: 'bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md',
              input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              anchor: 'text-sm text-primary underline-offset-4 hover:underline',
            }
          }}
          view={authView}
          providers={['google']}
          redirectTo={`${window.location.origin}${redirectTo}`}
          magicLink={true}
          showLinks={true}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                link_text: 'Already have an account? Sign in',
                social_provider_text: 'Sign in with {{provider}}',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up...',
                link_text: 'Don\'t have an account? Sign up',
                social_provider_text: 'Sign up with {{provider}}',
              },
              forgotten_password: {
                email_label: 'Email address',
                password_label: 'New password',
                button_label: 'Send reset instructions',
                loading_button_label: 'Sending reset instructions...',
                link_text: 'Forgot your password?',
                confirmation_text: 'Check your email for the password reset link',
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
