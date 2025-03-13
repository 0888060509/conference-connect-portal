
import { AmenityType } from "./types";
import { amenityTypes } from "./mockData";

// Amenity Types
export const getAmenityTypes = async (): Promise<AmenityType[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenityTypes];
};

export const createAmenityType = async (type: Omit<AmenityType, "id">): Promise<AmenityType> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newType: AmenityType = {
    ...type,
    id: Math.random().toString(36).substring(2, 9)
  };
  
  amenityTypes.push(newType);
  return newType;
};

export const updateAmenityType = async (id: string, type: Partial<AmenityType>): Promise<AmenityType> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityTypes.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Amenity type not found");
  
  amenityTypes[index] = { ...amenityTypes[index], ...type };
  return amenityTypes[index];
};

export const deleteAmenityType = async (id: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityTypes.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  amenityTypes.splice(index, 1);
  return true;
};
