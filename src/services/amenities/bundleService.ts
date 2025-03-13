
import { AmenityBundle } from "./types";
import { amenityBundles } from "./mockData";

// Bundles
export const getAmenityBundles = async (): Promise<AmenityBundle[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenityBundles];
};

export const createAmenityBundle = async (bundle: Omit<AmenityBundle, "id">): Promise<AmenityBundle> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newBundle: AmenityBundle = {
    ...bundle,
    id: Math.random().toString(36).substring(2, 9)
  };
  
  amenityBundles.push(newBundle);
  return newBundle;
};

export const updateAmenityBundle = async (id: string, bundle: Partial<AmenityBundle>): Promise<AmenityBundle> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityBundles.findIndex(b => b.id === id);
  if (index === -1) throw new Error("Bundle not found");
  
  amenityBundles[index] = { ...amenityBundles[index], ...bundle };
  return amenityBundles[index];
};

export const deleteAmenityBundle = async (id: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityBundles.findIndex(b => b.id === id);
  if (index === -1) return false;
  
  amenityBundles.splice(index, 1);
  return true;
};
