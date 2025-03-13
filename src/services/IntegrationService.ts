
import { Booking } from "@/components/bookings/PersonalBookings";

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export interface Webhook {
  id: string;
  url: string;
  name: string;
  events: string[];
  createdAt: string;
  secret: string;
  active: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeFields: string[];
  filters?: Record<string, any>;
}

// Export bookings to CSV
export const exportBookingsToCSV = async (
  bookings: Booking[],
  options?: Partial<ExportOptions>
): Promise<string> => {
  // In a real app, this would generate a CSV file
  console.log(`[EXPORT] Exporting ${bookings.length} bookings to CSV`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock CSV content
  const headers = "ID,Title,Room,Location,Start,End,Status\n";
  const rows = bookings.map(booking => 
    `${booking.id},"${booking.title}","${booking.roomName}","${booking.location}",${booking.start},${booking.end},${booking.status}`
  ).join("\n");
  
  return headers + rows;
};

// Export bookings to Excel
export const exportBookingsToExcel = async (
  bookings: Booking[],
  options?: Partial<ExportOptions>
): Promise<Blob> => {
  // In a real app, this would generate an Excel file
  console.log(`[EXPORT] Exporting ${bookings.length} bookings to Excel`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock Excel blob
  // In a real app, you would use a library like exceljs to create an actual Excel file
  return new Blob(["Mock Excel content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};

// Generate a download URL for the exported file
export const getExportDownloadUrl = (data: string | Blob, filename: string): string => {
  // In a real app, this might store the file on a server and return a URL
  // For client-side, we can create an object URL
  if (typeof data === 'string') {
    const blob = new Blob([data], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  } else {
    return URL.createObjectURL(data);
  }
};

// List API keys
export const listApiKeys = async (): Promise<ApiKey[]> => {
  // In a real app, this would fetch API keys from a database
  console.log("[API] Listing API keys");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock API keys
  return [
    {
      id: "apikey_1",
      key: "sk_live_f3c74185-6d8a-4a9e-9191-711d7e2b834d",
      name: "Production API Key",
      createdAt: new Date().toISOString(),
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      permissions: ["bookings:read", "bookings:write", "rooms:read", "users:read"],
    },
    {
      id: "apikey_2",
      key: "sk_test_a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
      name: "Test API Key",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastUsed: new Date(Date.now() - 86400000 * 2).toISOString(),
      permissions: ["bookings:read", "rooms:read"],
    },
  ];
};

// Create a new API key
export const createApiKey = async (name: string, permissions: string[]): Promise<ApiKey> => {
  // In a real app, this would create an API key in a database
  console.log(`[API] Creating API key: ${name}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate a mock key
  const key = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Return mock API key
  return {
    id: `apikey_${Date.now()}`,
    key,
    name,
    createdAt: new Date().toISOString(),
    permissions,
  };
};

// Revoke an API key
export const revokeApiKey = async (id: string): Promise<boolean> => {
  // In a real app, this would revoke an API key in a database
  console.log(`[API] Revoking API key: ${id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

// List webhooks
export const listWebhooks = async (): Promise<Webhook[]> => {
  // In a real app, this would fetch webhooks from a database
  console.log("[WEBHOOK] Listing webhooks");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock webhooks
  return [
    {
      id: "webhook_1",
      url: "https://example.com/webhook/booking-created",
      name: "Booking Created Handler",
      events: ["booking.created"],
      createdAt: new Date().toISOString(),
      secret: "whsec_8fb7824c90efc1f456e38001637d0451",
      active: true,
    },
    {
      id: "webhook_2",
      url: "https://example.com/webhook/booking-status",
      name: "Booking Status Handler",
      events: ["booking.updated", "booking.cancelled"],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      secret: "whsec_5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5",
      active: true,
    },
  ];
};

// Create a new webhook
export const createWebhook = async (
  url: string,
  name: string,
  events: string[]
): Promise<Webhook> => {
  // In a real app, this would create a webhook in a database
  console.log(`[WEBHOOK] Creating webhook: ${name} at ${url}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate a mock secret
  const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  // Return mock webhook
  return {
    id: `webhook_${Date.now()}`,
    url,
    name,
    events,
    createdAt: new Date().toISOString(),
    secret,
    active: true,
  };
};

// Update a webhook
export const updateWebhook = async (
  id: string,
  updates: Partial<Omit<Webhook, 'id' | 'createdAt'>>
): Promise<Webhook> => {
  // In a real app, this would update a webhook in a database
  console.log(`[WEBHOOK] Updating webhook: ${id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return updated mock webhook
  return {
    id,
    url: updates.url || "https://example.com/webhook/updated",
    name: updates.name || "Updated Webhook",
    events: updates.events || ["booking.created"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    secret: updates.secret || "whsec_updated123456789",
    active: updates.active !== undefined ? updates.active : true,
  };
};

// Delete a webhook
export const deleteWebhook = async (id: string): Promise<boolean> => {
  // In a real app, this would delete a webhook from a database
  console.log(`[WEBHOOK] Deleting webhook: ${id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

// Test a webhook
export const testWebhook = async (url: string, event: string): Promise<boolean> => {
  // In a real app, this would send a test event to the webhook URL
  console.log(`[WEBHOOK] Testing webhook at ${url} with event ${event}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate a successful test
  return true;
};
