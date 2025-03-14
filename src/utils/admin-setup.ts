
import { supabaseClient } from '@/integrations/supabase/client';

export async function setupAdminUser(email: string, password: string) {
  try {
    // Create user account
    const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    // Set admin role in users table
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ role: 'admin' })
      .eq('id', authData.user?.id);

    if (updateError) throw updateError;

    return { success: true, message: 'Admin user created successfully' };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, message: 'Failed to create admin user' };
  }
}
