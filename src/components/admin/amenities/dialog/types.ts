
import { Amenity, AmenityType } from "@/services/amenities";

export interface AmenityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: Amenity | null;
  amenityTypes: AmenityType[];
  onSuccess: () => void;
}

export interface FormValues {
  name: string;
  description: string;
  type: string;
  status: "available" | "unavailable" | "maintenance" | "scheduled";
  maintenanceFrequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  nextMaintenanceDate?: string;
  manualUrl?: string;
}

// Available status options
export const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "scheduled", label: "Scheduled Maintenance" },
];

// Maintenance frequency options
export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];
