
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { createQueryHook, createMutationHook } from './use-query-factory';
import { useAuth } from '@/contexts/auth';

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  role: 'admin' | 'user';
  preferences?: Record<string, any>;
  last_login?: string;
  created_at?: string;
};

/**
 * Hook for fetching all users with optional filtering
 */
export function useUsers(options: {
  role?: 'admin' | 'user';
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [totalCount, setTotalCount] = useState<number>(0);
  const { user: currentUser } = useAuth();
  
  const queryFn = async () => {
    let query = supabaseClient
      .from('users')
      .select('*', { count: 'exact' });
    
    if (options.role) {
      query = query.eq('role', options.role);
    }
    
    if (options.department) {
      query = query.eq('department', options.department);
    }
    
    if (options.search) {
      query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }
    
    query = query.order('last_name');
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    if (count !== null) setTotalCount(count);
    
    return data as User[];
  };
  
  return {
    ...createQueryHook<User[]>(
      ['users', options],
      queryFn,
      { enabled: currentUser?.role === 'admin' } // Only admin can list all users
    )(),
    totalCount,
    pagination: {
      limit: options.limit || 10,
      offset: options.offset || 0,
      totalPages: Math.ceil(totalCount / (options.limit || 10)),
      currentPage: Math.floor((options.offset || 0) / (options.limit || 10)) + 1,
    }
  };
}

/**
 * Hook for fetching a single user by ID
 */
export function useUser(id: string | undefined) {
  const { user: currentUser } = useAuth();
  
  const queryFn = async () => {
    if (!id) throw new Error('User ID is required');
    
    // Only allow fetching the current user or if the current user is an admin
    if (currentUser?.id !== id && currentUser?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  };
  
  return createQueryHook<User>(
    ['user', id],
    queryFn,
    { enabled: !!id && !!currentUser }
  )();
}

/**
 * Hook for updating user profile
 */
export function useUpdateUserProfile() {
  const { user: currentUser } = useAuth();
  
  const mutationFn = async ({ id, ...updates }: Partial<User> & { id: string }) => {
    // Only allow updating the current user or if the current user is an admin
    if (currentUser?.id !== id && currentUser?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  };
  
  return createMutationHook<User, Partial<User> & { id: string }>(
    'users',
    mutationFn,
    {
      onSuccessMessage: 'Profile updated successfully',
      invalidateQueries: [['users'], ['user', (variables: any) => variables.id]]
    }
  )();
}

/**
 * Hook for updating user preferences
 */
export function useUpdateUserPreferences() {
  const { user: currentUser } = useAuth();
  
  const mutationFn = async ({ id, preferences }: { id: string; preferences: Record<string, any> }) => {
    // Only allow updating the current user's preferences
    if (currentUser?.id !== id) {
      throw new Error('Unauthorized access');
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .update({ preferences })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  };
  
  return createMutationHook<User, { id: string; preferences: Record<string, any> }>(
    'users',
    mutationFn,
    {
      onSuccessMessage: 'Preferences updated successfully',
      invalidateQueries: [['user', (variables: any) => variables.id]]
    }
  )();
}
