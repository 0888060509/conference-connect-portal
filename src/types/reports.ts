
export type ReportVisualization = 'bar' | 'line' | 'pie' | 'table' | 'area' | 'scatter';
export type ReportExportFormat = 'pdf' | 'excel' | 'csv';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type ReportCategory = 'utilization' | 'cost' | 'department' | 'custom';
export type ReportType = 'predefined' | 'custom';
export type AccessLevel = 'view' | 'edit';

export interface ReportMetric {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  calculation?: string;
}

export interface ReportDimension {
  id: string;
  name: string;
  description?: string;
  type: 'date' | 'category' | 'numeric';
}

export interface ReportConfig {
  visualizations: ReportVisualization[];
  metrics: string[];
  dimensions: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  config: ReportConfig;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Report {
  id: string;
  template_id?: string;
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ScheduledReport {
  id: string;
  report_id: string;
  frequency: ReportFrequency;
  time_of_day?: string;
  day_of_week?: number;
  day_of_month?: number;
  recipients: string[];
  export_format: ReportExportFormat;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sent_at?: string;
  created_by?: string;
}

export interface ReportFavorite {
  id: string;
  user_id: string;
  report_id: string;
  created_at: string;
}

export interface ReportHistory {
  id: string;
  user_id: string;
  report_id: string;
  viewed_at: string;
}

export interface ReportShare {
  id: string;
  report_id: string;
  shared_by: string;
  shared_with: string;
  shared_at: string;
  access_level: AccessLevel;
}

export interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface AnomalyDetection {
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  timestamp: string;
}
