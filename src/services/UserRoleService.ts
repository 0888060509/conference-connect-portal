
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAction } from "./AuditService";

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  assigned_by?: string;
}

export interface UserWithRoles {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  roles: string[];
}

export const getUserRoles = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .select('role')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map(r => r.role);
  } catch (error) {
    console.error('Failed to fetch user roles:', error);
    return [];
  }
};

export const hasRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
};

export const assignRole = async (userId: string, role: string): Promise<void> => {
  try {
    // Check if role already assigned
    const { data: existingRole, error: checkError } = await supabase
      .from('user_role_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingRole) {
      toast.info(`User already has the ${role} role`);
      return;
    }
    
    // Assign role
    const { error } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: userId,
        role
      });
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'user_role_assign',
      resourceType: 'role',
      resourceId: userId,
      details: { role }
    });
    
    toast.success(`Role ${role} assigned successfully`);
  } catch (error) {
    console.error('Failed to assign role:', error);
    toast.error('Failed to assign role');
    throw error;
  }
};

export const revokeRole = async (userId: string, role: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_role_assignments')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'user_role_revoke',
      resourceType: 'role',
      resourceId: userId,
      details: { role }
    });
    
    toast.success(`Role ${role} revoked successfully`);
  } catch (error) {
    console.error('Failed to revoke role:', error);
    toast.error('Failed to revoke role');
    throw error;
  }
};

export const getUsersWithRoles = async (): Promise<UserWithRoles[]> => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name');
    
    if (usersError) throw usersError;
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_role_assignments')
      .select('user_id, role');
    
    if (rolesError) throw rolesError;
    
    // Map roles to users
    const userRolesMap = new Map<string, string[]>();
    roles.forEach(role => {
      const userRoles = userRolesMap.get(role.user_id) || [];
      userRolesMap.set(role.user_id, [...userRoles, role.role]);
    });
    
    return users.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: userRolesMap.get(user.id) || []
    }));
  } catch (error) {
    console.error('Failed to fetch users with roles:', error);
    toast.error('Failed to load users');
    throw error;
  }
};
