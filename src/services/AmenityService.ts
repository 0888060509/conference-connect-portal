
import { 
  Amenity, 
  AmenityType, 
  AmenityBundle, 
  AmenityRequest, 
  AmenityIssue,
  MaintenanceRecord,
  AmenityStatus
} from "@/types/amenities";

// Mock data for amenity types
const amenityTypes: AmenityType[] = [
  { id: "1", name: "Projector", icon: "projector", description: "Projection equipment" },
  { id: "2", name: "TV Screen", icon: "tv", description: "Large display screens" },
  { id: "3", name: "Video Conference", icon: "video", description: "Video conferencing equipment" },
  { id: "4", name: "Whiteboard", icon: "pen-tool", description: "Writing and brainstorming" },
  { id: "5", name: "Coffee Machine", icon: "coffee", description: "Coffee and hot beverage service" },
  { id: "6", name: "Water Dispenser", icon: "droplet", description: "Water service" },
  { id: "7", name: "Sound System", icon: "speaker", description: "Audio equipment" },
  { id: "8", name: "WiFi", icon: "wifi", description: "Wireless internet" },
  { id: "9", name: "Power Outlets", icon: "plug", description: "Electrical connections" },
  { id: "10", name: "Air Conditioning", icon: "thermometer", description: "Temperature control" },
];

// Mock data for amenities
const amenities: Amenity[] = [
  {
    id: "1",
    name: "Projector XD-3000",
    description: "4K Ultra HD projector with 5000 lumens",
    type: "1",
    icon: "projector",
    status: "available",
    roomIds: ["1", "3"],
    maintenanceRecords: [
      {
        id: "m1",
        date: "2023-12-10",
        performedBy: "John Technician",
        notes: "Replaced bulb, general cleaning",
        nextScheduledDate: "2024-06-10"
      }
    ],
    maintenanceSchedule: {
      frequency: "quarterly",
      nextDate: "2024-06-10"
    },
    qrCodeUrl: "https://example.com/qr/projector-xd3000",
    manualUrl: "https://example.com/manuals/projector-xd3000.pdf",
    usageStats: {
      amenityId: "1",
      usageCount: 45,
      lastUsed: "2024-04-05",
      popularTimes: [
        { day: "Monday", count: 10 },
        { day: "Wednesday", count: 15 },
        { day: "Friday", count: 20 }
      ]
    },
    lastUpdated: "2024-04-05",
    createdAt: "2023-06-01"
  },
  {
    id: "2",
    name: "Conference TV 55\"",
    description: "55-inch 4K smart TV with wireless connectivity",
    type: "2",
    icon: "tv",
    status: "available",
    roomIds: ["2", "5"],
    maintenanceRecords: [],
    maintenanceSchedule: {
      frequency: "yearly",
      nextDate: "2025-01-15"
    },
    qrCodeUrl: "https://example.com/qr/tv-55",
    lastUpdated: "2024-03-20",
    createdAt: "2023-01-15"
  },
  {
    id: "3",
    name: "Premium Video Conferencing System",
    description: "Complete video conferencing setup with camera, mic, and speakers",
    type: "3",
    icon: "video",
    status: "maintenance",
    roomIds: ["1"],
    maintenanceRecords: [
      {
        id: "m2",
        date: "2024-04-01",
        performedBy: "Tech Support Team",
        notes: "Firmware update, camera calibration",
        nextScheduledDate: "2024-10-01"
      }
    ],
    maintenanceSchedule: {
      frequency: "quarterly",
      nextDate: "2024-07-01"
    },
    qrCodeUrl: "https://example.com/qr/vidconf-premium",
    manualUrl: "https://example.com/manuals/vidconf-premium.pdf",
    lastUpdated: "2024-04-01",
    createdAt: "2022-11-30"
  }
];

// Mock data for bundles
const amenityBundles: AmenityBundle[] = [
  {
    id: "1",
    name: "Standard Presentation Setup",
    description: "Basic presentation equipment including projector and sound system",
    amenityIds: ["1", "7"],
    icon: "presentation"
  },
  {
    id: "2",
    name: "Premium Video Conference Setup",
    description: "Complete high-end video conferencing solution",
    amenityIds: ["2", "3", "7"],
    icon: "video"
  }
];

// Mock data for amenity requests
const amenityRequests: AmenityRequest[] = [
  {
    id: "1",
    requestedBy: "jane.doe@company.com",
    roomId: "3",
    amenityTypeId: "5",
    status: "pending",
    requestDate: "2024-04-01",
    notes: "Would be great to have coffee available for morning meetings"
  },
  {
    id: "2",
    requestedBy: "john.smith@company.com",
    roomId: "2",
    amenityTypeId: "4",
    status: "approved",
    requestDate: "2024-03-15",
    response: "Whiteboard will be installed by next week",
    responseDate: "2024-03-20"
  }
];

// Mock data for amenity issues
const amenityIssues: AmenityIssue[] = [
  {
    id: "1",
    amenityId: "3",
    reportedBy: "meeting-organizer@company.com",
    reportedDate: "2024-03-28",
    description: "Video conferencing camera not focusing properly",
    status: "in-progress",
    priority: "high"
  },
  {
    id: "2",
    amenityId: "1",
    reportedBy: "presenter@company.com",
    reportedDate: "2024-04-02",
    description: "Projector showing discoloration on the left side",
    status: "open",
    priority: "medium"
  }
];

// Service functions

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

// Maintenance records
export const addMaintenanceRecord = async (
  amenityId: string, 
  record: Omit<MaintenanceRecord, "id">
): Promise<Amenity> => {
  const amenity = await getAmenityById(amenityId);
  if (!amenity) throw new Error("Amenity not found");
  
  const maintenanceRecord: MaintenanceRecord = {
    ...record,
    id: Math.random().toString(36).substring(2, 9)
  };
  
  const maintenanceRecords = [...amenity.maintenanceRecords, maintenanceRecord];
  
  return updateAmenity(amenityId, { 
    maintenanceRecords,
    maintenanceSchedule: record.nextScheduledDate ? {
      ...amenity.maintenanceSchedule,
      nextDate: record.nextScheduledDate
    } : amenity.maintenanceSchedule
  });
};

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

// Issues
export const getAmenityIssues = async (): Promise<AmenityIssue[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...amenityIssues];
};

export const createAmenityIssue = async (issue: Omit<AmenityIssue, "id" | "status" | "reportedDate">): Promise<AmenityIssue> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newIssue: AmenityIssue = {
    ...issue,
    id: Math.random().toString(36).substring(2, 9),
    status: "open",
    reportedDate: new Date().toISOString()
  };
  
  amenityIssues.push(newIssue);
  return newIssue;
};

export const updateAmenityIssue = async (id: string, issue: Partial<AmenityIssue>): Promise<AmenityIssue> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = amenityIssues.findIndex(i => i.id === id);
  if (index === -1) throw new Error("Issue not found");
  
  amenityIssues[index] = { ...amenityIssues[index], ...issue };
  
  // If resolving the issue, set resolved date
  if (issue.status === "resolved" && !amenityIssues[index].resolvedDate) {
    amenityIssues[index].resolvedDate = new Date().toISOString();
  }
  
  return amenityIssues[index];
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

// Helper to get upcoming maintenance
export const getUpcomingMaintenance = async (): Promise<Array<Amenity & { maintenanceDate: string }>> => {
  const allAmenities = await getAmenities();
  const amenitiesWithMaintenance = allAmenities
    .filter(a => a.maintenanceSchedule?.nextDate)
    .map(a => ({
      ...a,
      maintenanceDate: a.maintenanceSchedule!.nextDate
    }))
    .sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime());
  
  return amenitiesWithMaintenance;
};
