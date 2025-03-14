
import { supabase } from "@/integrations/supabase/client";
import { 
  Report, 
  ReportTemplate, 
  ScheduledReport, 
  ReportFavorite,
  ReportShare,
  ReportExportFormat,
  ReportData,
  AnomalyDetection
} from "@/types/reports";

// Templates
export async function getReportTemplates() {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*');
    
  if (error) throw error;
  return data as ReportTemplate[];
}

export async function getReportTemplateById(id: string) {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data as ReportTemplate;
}

export async function createReportTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('report_templates')
    .insert(template)
    .select()
    .single();
    
  if (error) throw error;
  return data as ReportTemplate;
}

export async function updateReportTemplate(id: string, template: Partial<ReportTemplate>) {
  const { data, error } = await supabase
    .from('report_templates')
    .update(template)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as ReportTemplate;
}

export async function deleteReportTemplate(id: string) {
  const { error } = await supabase
    .from('report_templates')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// Reports
export async function getReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*');
    
  if (error) throw error;
  return data as Report[];
}

export async function getReportById(id: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data as Report;
}

export async function createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();
    
  if (error) throw error;
  return data as Report;
}

export async function updateReport(id: string, report: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .update(report)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as Report;
}

export async function deleteReport(id: string) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// Scheduled Reports
export async function getScheduledReports() {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select('*');
    
  if (error) throw error;
  return data as ScheduledReport[];
}

export async function getScheduledReportById(id: string) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data as ScheduledReport;
}

export async function createScheduledReport(scheduledReport: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert(scheduledReport)
    .select()
    .single();
    
  if (error) throw error;
  return data as ScheduledReport;
}

export async function updateScheduledReport(id: string, scheduledReport: Partial<ScheduledReport>) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .update(scheduledReport)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as ScheduledReport;
}

export async function deleteScheduledReport(id: string) {
  const { error } = await supabase
    .from('scheduled_reports')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// Favorites
export async function getFavoriteReports() {
  const { data, error } = await supabase
    .from('report_favorites')
    .select(`
      id,
      user_id,
      report_id,
      created_at,
      reports:report_id (*)
    `);
    
  if (error) throw error;
  return data;
}

export async function addReportToFavorites(reportId: string) {
  const { data, error } = await supabase
    .from('report_favorites')
    .insert({
      report_id: reportId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as ReportFavorite;
}

export async function removeReportFromFavorites(reportId: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  const { error } = await supabase
    .from('report_favorites')
    .delete()
    .eq('report_id', reportId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return true;
}

// Report History
export async function getReportHistory() {
  const { data, error } = await supabase
    .from('report_history')
    .select(`
      id,
      user_id,
      report_id,
      viewed_at,
      reports:report_id (*)
    `)
    .order('viewed_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function addToReportHistory(reportId: string) {
  const { error } = await supabase
    .from('report_history')
    .insert({
      report_id: reportId,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
  if (error) throw error;
  return true;
}

// Report Sharing
export async function shareReport(reportId: string, sharedWithUserId: string, accessLevel: 'view' | 'edit' = 'view') {
  const { data, error } = await supabase
    .from('report_shares')
    .insert({
      report_id: reportId,
      shared_with: sharedWithUserId,
      shared_by: (await supabase.auth.getUser()).data.user?.id,
      access_level: accessLevel
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as ReportShare;
}

export async function getSharedReports() {
  const { data, error } = await supabase
    .from('report_shares')
    .select(`
      id,
      report_id,
      shared_by,
      shared_with,
      shared_at,
      access_level,
      reports:report_id (*)
    `);
    
  if (error) throw error;
  return data;
}

export async function removeReportShare(shareId: string) {
  const { error } = await supabase
    .from('report_shares')
    .delete()
    .eq('id', shareId);
    
  if (error) throw error;
  return true;
}

// Export
export async function exportReport(reportId: string, format: ReportExportFormat) {
  // In a real application, this would call an edge function to generate the file
  // For this demo, we'll simulate a download
  console.log(`Exporting report ${reportId} in ${format} format`);
  
  // Mockup for demo purposes
  setTimeout(() => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Report data would go here'));
    element.setAttribute('download', `report_${reportId}.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, 1000);
  
  return true;
}

// Mock data for visualization
export async function getReportData(reportId: string, parameters?: Record<string, any>): Promise<ReportData> {
  // In a real application, this would fetch data from the database based on the report configuration
  console.log(`Fetching data for report ${reportId} with parameters:`, parameters);
  
  // Mock data for demonstration
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Room Utilization',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
}

// Mock comparative data
export async function getComparativeData(reportId: string, period1: string, period2: string): Promise<ReportData> {
  console.log(`Comparing data for report ${reportId} between ${period1} and ${period2}`);
  
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: period1,
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: period2,
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };
}

// Mock anomaly detection
export async function detectAnomalies(reportId: string): Promise<AnomalyDetection[]> {
  console.log(`Detecting anomalies for report ${reportId}`);
  
  return [
    {
      metric: 'Room Utilization',
      value: 15,
      expected: 60,
      deviation: -75,
      timestamp: new Date().toISOString()
    },
    {
      metric: 'Booking Duration',
      value: 180,
      expected: 60,
      deviation: 200,
      timestamp: new Date().toISOString()
    }
  ];
}
