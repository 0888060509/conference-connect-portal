
import { 
  Amenity, 
  AmenityType, 
  AmenityBundle, 
  AmenityRequest, 
  AmenityIssue 
} from "./types";

// Mock data for amenity types
export const amenityTypes: AmenityType[] = [
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
export const amenities: Amenity[] = [
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
export const amenityBundles: AmenityBundle[] = [
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
export const amenityRequests: AmenityRequest[] = [
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
export const amenityIssues: AmenityIssue[] = [
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
