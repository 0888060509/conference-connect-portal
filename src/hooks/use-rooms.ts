
import { useState } from 'react';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabaseClient } from '@/lib/supabase-client';
import { createQueryHook, createMutationHook, queryBuilderToQueryFn } from './use-query-factory';
import { toast } from 'sonner';
import { useRealtime } from './use-realtime';

export type Room = {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  image_url?: string;
  building?: string;
  floor?: string;
  number?: string;
  status: 'active' | 'maintenance' | 'inactive';
  created_at?: string;
};

/**
 * Hook for fetching all rooms with optional filtering
 */
export function useRooms(options: {
  status?: 'active' | 'maintenance' | 'inactive';
  capacity?: number;
  building?: string;
  floor?: string;
  search?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const buildQuery = () => {
    let query = supabaseClient
      .from('rooms')
      .select('*', { count: 'exact' });
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.capacity !== undefined) {
      query = query.gte('capacity', options.capacity);
    }
    
    if (options.building) {
      query = query.eq('building', options.building);
    }
    
    if (options.floor) {
      query = query.eq('floor', options.floor);
    }
    
    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    
    if (options.orderBy) {
      const [column, direction] = options.orderBy.split(':');
      query = query.order(column, { ascending: direction !== 'desc' });
    } else {
      query = query.order('name');
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    return query;
  };
  
  const queryFn = async () => {
    const query = buildQuery();
    const { data, error, count } = await query;
    
    if (error) throw error;
    if (count !== null) setTotalCount(count);
    
    return data as Room[];
  };

  const roomsQuery = createQueryHook<Room[]>(
    ['rooms', options],
    queryFn
  )();
  
  // Set up real-time subscription for rooms
  useRealtime<Room>((payload) => {
    roomsQuery.refetch();
  }, {
    table: 'rooms',
    onError: (error) => console.error('Realtime subscription error:', error)
  });
  
  return {
    ...roomsQuery,
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
 * Hook for fetching a single room by ID
 */
export function useRoom(id: string | undefined) {
  const queryFn = async () => {
    if (!id) throw new Error('Room ID is required');
    
    const { data, error } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Room;
  };
  
  return createQueryHook<Room>(
    ['room', id],
    queryFn,
    { enabled: !!id }
  )();
}

/**
 * Hook for creating a new room
 */
export function useCreateRoom() {
  const mutationFn = async (newRoom: Omit<Room, 'id' | 'created_at'>) => {
    const { data, error } = await supabaseClient
      .from('rooms')
      .insert(newRoom)
      .select()
      .single();
    
    if (error) throw error;
    return data as Room;
  };
  
  return createMutationHook<Room, Omit<Room, 'id' | 'created_at'>>(
    'rooms',
    mutationFn,
    {
      onSuccessMessage: 'Room created successfully',
      invalidateQueries: ['rooms']
    }
  )();
}

/**
 * Hook for updating an existing room
 */
export function useUpdateRoom() {
  const mutationFn = async ({ id, ...updates }: Partial<Room> & { id: string }) => {
    const { data, error } = await supabaseClient
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Room;
  };
  
  return createMutationHook<Room, Partial<Room> & { id: string }>(
    'rooms',
    mutationFn,
    {
      onSuccessMessage: 'Room updated successfully',
      invalidateQueries: ['rooms'],
      optimisticUpdate: (variables, oldData: Room[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(room => 
          room.id === variables.id ? { ...room, ...variables } : room
        );
      }
    }
  )();
}

/**
 * Hook for deleting a room
 */
export function useDeleteRoom() {
  const mutationFn = async (id: string) => {
    const { error } = await supabaseClient
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  };
  
  return createMutationHook<string, string>(
    'rooms',
    mutationFn,
    {
      onSuccessMessage: 'Room deleted successfully',
      invalidateQueries: ['rooms'],
      optimisticUpdate: (id, oldData: Room[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(room => room.id !== id);
      }
    }
  )();
}
