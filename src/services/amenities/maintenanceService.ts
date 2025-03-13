
import { Amenity, MaintenanceRecord } from "./types";
import { getAmenityById, updateAmenity } from "./amenityService";

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

// Helper to get upcoming maintenance
export const getUpcomingMaintenance = async (): Promise<Array<Amenity & { maintenanceDate: string }>> => {
  const { getAmenities } = await import('./amenityService');
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
