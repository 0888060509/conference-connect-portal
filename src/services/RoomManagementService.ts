
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAction } from "./AuditService";

export interface Room {
  id: string;
  name: string;
  number?: string;
  location?: string;
  capacity?: number;
  available: boolean;
  floor?: string;
  building?: string;
  description?: string;
  image_url?: string;
  status: 'active' | 'maintenance' | 'inactive';
  created_at?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(room => ({
      ...room,
      available: room.status === 'active'
    }));
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    toast.error('Failed to load rooms');
    throw error;
  }
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return {
      ...data,
      available: data.status === 'active'
    };
  } catch (error) {
    console.error(`Failed to fetch room ${id}:`, error);
    toast.error('Failed to load room details');
    throw error;
  }
};

export const createRoom = async (room: Omit<Room, 'id' | 'created_at'>): Promise<Room> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: room.name,
        number: room.number,
        floor: room.floor,
        building: room.building,
        capacity: room.capacity,
        description: room.description,
        image_url: room.image_url,
        status: room.status
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'room_create',
      resourceType: 'room',
      resourceId: data.id,
      details: { name: room.name }
    });
    
    toast.success('Room created successfully');
    
    return {
      ...data,
      available: data.status === 'active'
    };
  } catch (error) {
    console.error('Failed to create room:', error);
    toast.error('Failed to create room');
    throw error;
  }
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  try {
    // Remove computed fields
    const { available, ...roomData } = updates;
    
    // If available is explicitly set, translate to status
    if (available !== undefined && roomData.status === undefined) {
      roomData.status = available ? 'active' : 'inactive';
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .update(roomData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'room_update',
      resourceType: 'room',
      resourceId: id,
      details: { updates: Object.keys(updates) }
    });
    
    toast.success('Room updated successfully');
    
    return {
      ...data,
      available: data.status === 'active'
    };
  } catch (error) {
    console.error(`Failed to update room ${id}:`, error);
    toast.error('Failed to update room');
    throw error;
  }
};

export const deleteRoom = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Log the action
    await logAction({
      action: 'room_delete',
      resourceType: 'room',
      resourceId: id
    });
    
    toast.success('Room deleted successfully');
  } catch (error) {
    console.error(`Failed to delete room ${id}:`, error);
    toast.error('Failed to delete room');
    throw error;
  }
};

// Room Types Management
export const getRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Failed to fetch room types:', error);
    toast.error('Failed to load room types');
    throw error;
  }
};

export const createRoomType = async (roomType: Omit<RoomType, 'id' | 'created_at'>): Promise<RoomType> => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .insert({
        name: roomType.name,
        description: roomType.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Room type created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create room type:', error);
    toast.error('Failed to create room type');
    throw error;
  }
};

export const updateRoomType = async (id: string, updates: Partial<RoomType>): Promise<RoomType> => {
  try {
    const { data, error } = await supabase
      .from('room_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Room type updated successfully');
    return data;
  } catch (error) {
    console.error(`Failed to update room type ${id}:`, error);
    toast.error('Failed to update room type');
    throw error;
  }
};

export const deleteRoomType = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Room type deleted successfully');
  } catch (error) {
    console.error(`Failed to delete room type ${id}:`, error);
    toast.error('Failed to delete room type');
    throw error;
  }
};
