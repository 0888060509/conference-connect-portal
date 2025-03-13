
import { AmenityRequest } from "./types";
import { amenityRequests } from "./mockData";

// Requests
export const getAmenityRequests = async (): Promise<AmenityRequest[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenityRequests];
};

export const createAmenityRequest = async (request: Omit<AmenityRequest, "id" | "status" | "requestDate">): Promise<AmenityRequest> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newRequest: AmenityRequest = {
    ...request,
    id: Math.random().toString(36).substring(2, 9),
    status: "pending",
    requestDate: new Date().toISOString()
  };
  
  amenityRequests.push(newRequest);
  return newRequest;
};

export const updateAmenityRequest = async (id: string, request: Partial<AmenityRequest>): Promise<AmenityRequest> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityRequests.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Request not found");
  
  amenityRequests[index] = { ...amenityRequests[index], ...request };
  return amenityRequests[index];
};
