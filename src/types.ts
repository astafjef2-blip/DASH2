export interface KPIThreshold {
  green: number;
  yellow: number;
  red: number;
  direction: 'higher_is_better' | 'lower_is_better';
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: KPIThreshold;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface Alert {
  id: string;
  kpiId: string;
  kpiName: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
}

export interface DataRow {
  [key: string]: string | number;
}

export interface SheetData {
  name: string;
  headers: string[];
  multiLevelHeaders: string[][];
  rows: DataRow[];
  textColumns: string[];
  numericColumns: string[];
}

export interface ExcelData {
  sheets: SheetData[];
  lastUpdated: Date;
  fileName: string;
}

export interface DrillDownLevel {
  level: number;
  category: string;
  value: string;
  data: DataRow[];
}

export interface DashboardConfig {
  autoRefreshInterval: number; // minutes
  watchFolder: string;
  kpis: KPI[];
}
