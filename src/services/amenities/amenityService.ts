
import { Amenity, AmenityStatus, AmenityUsage } from "./types";
import { amenities } from "./mockData";

// Amenities
export const getAmenities = async (): Promise<Amenity[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenities];
};

export const getAmenityById = async (id: string): Promise<Amenity | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const amenity = amenities.find(a => a.id === id);
  return amenity ? { ...amenity } : null;
};

export const createAmenity = async (amenity: Omit<Amenity, "id" | "lastUpdated" | "createdAt">): Promise<Amenity> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date().toISOString();
  const newAmenity: Amenity = {
    ...amenity,
    id: Math.random().toString(36).substring(2, 9),
    lastUpdated: now,
    createdAt: now
  };
  
  amenities.push(newAmenity);
  return newAmenity;
};

export const updateAmenity = async (id: string, amenity: Partial<Amenity>): Promise<Amenity> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenities.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Amenity not found");
  
  amenities[index] = { 
    ...amenities[index], 
    ...amenity, 
    lastUpdated: new Date().toISOString() 
  };
  
  return amenities[index];
};

export const deleteAmenity = async (id: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenities.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  amenities.splice(index, 1);
  return true;
};

export const updateAmenityStatus = async (id: string, status: AmenityStatus): Promise<Amenity> => {
  return updateAmenity(id, { status });
};

export const assignAmenityToRoom = async (amenityId: string, roomId: string): Promise<Amenity> => {
  const amenity = await getAmenityById(amenityId);
  if (!amenity) throw new Error("Amenity not found");
  
  const roomIds = [...amenity.roomIds];
  if (!roomIds.includes(roomId)) {
    roomIds.push(roomId);
  }
  
  return updateAmenity(amenityId, { roomIds });
};

export const removeAmenityFromRoom = async (amenityId: string, roomId: string): Promise<Amenity> => {
  const amenity = await getAmenityById(amenityId);
  if (!amenity) throw new Error("Amenity not found");
  
  const roomIds = amenity.roomIds.filter(id => id !== roomId);
  
  return updateAmenity(amenityId, { roomIds });
};

// QR Code generation (mock)
export const generateQRCode = async (amenityId: string, content: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would call a QR code generation service
  const qrCodeUrl = `https://example.com/qr/${amenityId}-${Date.now()}`;
  
  // Update the amenity with the QR code URL
  const amenity = await getAmenityById(amenityId);
  if (amenity) {
    await updateAmenity(amenityId, { qrCodeUrl });
  }
  
  return qrCodeUrl;
};

// Usage statistics
export const getAmenityUsageStats = async (amenityId: string): Promise<AmenityUsage | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const amenity = await getAmenityById(amenityId);
  return amenity?.usageStats || null;
};

export const updateAmenityUsage = async (amenityId: string, usage: Partial<AmenityUsage>): Promise<AmenityUsage | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const amenity = await getAmenityById(amenityId);
  if (!amenity) return null;
  
  const currentUsage = amenity.usageStats || {
    amenityId,
    usageCount: 0,
    lastUsed: new Date().toISOString(),
    popularTimes: []
  };
  
  const updatedUsage = { ...currentUsage, ...usage };
  await updateAmenity(amenityId, { usageStats: updatedUsage });
  
  return updatedUsage;
};

// Helper to get amenities for a specific room
export const getAmenitiesForRoom = async (roomId: string): Promise<Amenity[]> => {
  const allAmenities = await getAmenities();
  return allAmenities.filter(amenity => amenity.roomIds.includes(roomId));
};
