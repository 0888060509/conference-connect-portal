
import { LucideIcon } from "lucide-react";

export type AmenityStatus = "available" | "unavailable" | "maintenance" | "scheduled";

export interface MaintenanceRecord {
  id: string;
  date: string;
  performedBy: string;
  notes: string;
  nextScheduledDate?: string;
}

export interface AmenityIssue {
  id: string;
  amenityId: string;
  reportedBy: string;
  reportedDate: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  resolution?: string;
  resolvedDate?: string;
}

export interface AmenityUsage {
  amenityId: string;
  usageCount: number;
  lastUsed: string;
  popularTimes: { day: string; count: number }[];
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  status: AmenityStatus;
  roomIds: string[];
  maintenanceRecords: MaintenanceRecord[];
  maintenanceSchedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    nextDate: string;
  };
  qrCodeUrl?: string;
  manualUrl?: string;
  usageStats?: AmenityUsage;
  lastUpdated: string;
  createdAt: string;
}

export interface AmenityType {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface AmenityBundle {
  id: string;
  name: string;
  description: string;
  amenityIds: string[];
  icon: string;
}

export interface AmenityRequest {
  id: string;
  requestedBy: string;
  roomId: string;
  amenityTypeId: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  notes?: string;
  response?: string;
  responseDate?: string;
}
