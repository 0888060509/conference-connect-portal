
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SystemHealthStatus {
  id: string;
  category: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  details?: any;
  last_check: string;
}

export const getSystemHealth = async (): Promise<SystemHealthStatus[]> => {
  try {
    const { data, error } = await supabase
      .from('system_health')
      .select('*')
      .order('category');
    
    if (error) throw error;
    
    // Cast the response to ensure it matches our expected type
    return data.map(item => ({
      id: item.id,
      category: item.category,
      status: item.status as 'healthy' | 'warning' | 'critical' | 'unknown',
      details: item.details,
      last_check: item.last_check
    }));
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    toast.error('Failed to load system health data');
    throw error;
  }
};

export const updateSystemHealthStatus = async (
  category: string,
  status: 'healthy' | 'warning' | 'critical' | 'unknown',
  details?: any
): Promise<void> => {
  try {
    // Check if entry exists
    const { data: existingEntry, error: checkError } = await supabase
      .from('system_health')
      .select('id')
      .eq('category', category)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingEntry) {
      // Update existing entry
      result = await supabase
        .from('system_health')
        .update({
          status,
          details,
          last_check: new Date().toISOString()
        })
        .eq('id', existingEntry.id);
    } else {
      // Insert new entry
      result = await supabase
        .from('system_health')
        .insert({
          category,
          status,
          details,
          last_check: new Date().toISOString()
        });
    }
    
    if (result.error) throw result.error;
  } catch (error) {
    console.error(`Failed to update system health for ${category}:`, error);
    throw error;
  }
};

// Function to check the health of the application
export const performHealthCheck = async (): Promise<void> => {
  try {
    // Check database connectivity
    const dbStart = performance.now();
    const { data: dbCheck, error: dbError } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1);
    const dbDuration = performance.now() - dbStart;
    
    const dbStatus = dbError ? 'critical' : (dbDuration > 1000 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical';
    
    // Update database health
    await updateSystemHealthStatus('database', dbStatus, {
      latency: Math.round(dbDuration),
      error: dbError ? dbError.message : null
    });
    
    // Check authentication service
    const authStart = performance.now();
    const { data: authCheck, error: authError } = await supabase.auth.getSession();
    const authDuration = performance.now() - authStart;
    
    const authStatus = authError ? 'critical' : (authDuration > 1000 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical';
    
    // Update auth health
    await updateSystemHealthStatus('authentication', authStatus, {
      latency: Math.round(authDuration),
      error: authError ? authError.message : null
    });
    
    // We could add more health checks here: storage, functions, third-party services, etc.
    
    // Update overall system status
    const allHealthy = dbStatus === 'healthy' && authStatus === 'healthy';
    const anyCritical = dbStatus === 'critical' || authStatus === 'critical';
    
    const overallStatus = anyCritical 
      ? 'critical' 
      : (allHealthy ? 'healthy' : 'warning') as 'healthy' | 'warning' | 'critical';
    
    await updateSystemHealthStatus('overall', overallStatus, {
      components: {
        database: dbStatus,
        authentication: authStatus
      },
      timestamp: new Date().toISOString()
    });
    
    if (!allHealthy) {
      console.warn('System health check detected issues:', {
        database: dbStatus,
        authentication: authStatus
      });
    }
  } catch (error) {
    console.error('Failed to perform health check:', error);
    
    // Update overall status as critical
    await updateSystemHealthStatus('overall', 'critical', {
      error: error.message,
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('Failed to update overall health status:', err);
    });
  }
};
