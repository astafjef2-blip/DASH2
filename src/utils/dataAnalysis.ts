import { SheetData, ExcelData, KPI, Alert, DataRow } from '../types';

export function computeKPIs(data: ExcelData): KPI[] {
  const kpis: KPI[] = [];
  
  // KPI 1: Обработка заявлений (%)
  const regSheet = data.sheets.find(s => s.name.includes('Регистрация'));
  if (regSheet) {
    const totalSubmitted = sumColumn(regSheet.rows, 'Заявления подано');
    const totalProcessed = sumColumn(regSheet.rows, 'Заявления обработано');
    const processingRate = totalSubmitted > 0 ? (totalProcessed / totalSubmitted) * 100 : 0;
    const prevRate = computePeriodChange(regSheet, 'Заявления подано', 'Заявления обработано');
    
    kpis.push({
      id: 'processing_rate',
      name: 'Обработка заявлений',
      value: Math.round(processingRate * 10) / 10,
      unit: '%',
      threshold: { green: 95, yellow: 85, red: 0, direction: 'higher_is_better' },
      trend: processingRate >= prevRate ? 'up' : 'down',
      changePercent: Math.round((processingRate - prevRate) * 10) / 10
    });
  }

  // KPI 2: Средний срок регистрации (дни)
  if (regSheet) {
    const avgTerm = averageColumn(regSheet.rows, 'Средний срок (дни)');
    const prevTerm = computePrevAverage(regSheet, 'Средний срок (дни)');
    
    kpis.push({
      id: 'avg_registration_term',
      name: 'Средний срок регистрации',
      value: Math.round(avgTerm * 10) / 10,
      unit: 'дн.',
      threshold: { green: 5, yellow: 7, red: 10, direction: 'lower_is_better' },
      trend: avgTerm <= prevTerm ? 'up' : 'down',
      changePercent: Math.round(((prevTerm - avgTerm) / prevTerm) * 100 * 10) / 10
    });
  }

  // KPI 3: Доля отказов (%)
  if (regSheet) {
    const totalSubmitted = sumColumn(regSheet.rows, 'Заявления подано');
    const totalRefusals = sumColumn(regSheet.rows, 'Отказов');
    const refusalRate = totalSubmitted > 0 ? (totalRefusals / totalSubmitted) * 100 : 0;
    const prevRate = computeRefusalChange(regSheet);
    
    kpis.push({
      id: 'refusal_rate',
      name: 'Доля отказов',
      value: Math.round(refusalRate * 100) / 100,
      unit: '%',
      threshold: { green: 2, yellow: 3, red: 5, direction: 'lower_is_better' },
      trend: refusalRate <= prevRate ? 'up' : 'down',
      changePercent: Math.round(((prevRate - refusalRate) / prevRate) * 100 * 10) / 10
    });
  }

  // KPI 4: Доля электронных заявлений (%)
  if (regSheet) {
    const avgDigital = averageColumn(regSheet.rows, 'Доля электронных заявлений (%)');
    const prevDigital = computePrevAverage(regSheet, 'Доля электронных заявлений (%)');
    
    kpis.push({
      id: 'digital_share',
      name: 'Доля эл. заявлений',
      value: Math.round(avgDigital * 10) / 10,
      unit: '%',
      threshold: { green: 80, yellow: 70, red: 50, direction: 'higher_is_better' },
      trend: avgDigital >= prevDigital ? 'up' : 'down',
      changePercent: Math.round((avgDigital - prevDigital) * 10) / 10
    });
  }

  // KPI 5: Актуальность данных ЕГРН (%)
  const egrnSheet = data.sheets.find(s => s.name.includes('ЕГРН'));
  if (egrnSheet) {
    const avgAccuracy = averageColumn(egrnSheet.rows, 'Актуальность данных (%)');
    const prevAccuracy = computePrevAverage(egrnSheet, 'Актуальность данных (%)');
    
    kpis.push({
      id: 'data_accuracy',
      name: 'Актуальность данных ЕГРН',
      value: Math.round(avgAccuracy * 10) / 10,
      unit: '%',
      threshold: { green: 85, yellow: 75, red: 60, direction: 'higher_is_better' },
      trend: avgAccuracy >= prevAccuracy ? 'up' : 'down',
      changePercent: Math.round((avgAccuracy - prevAccuracy) * 10) / 10
    });
  }

  // KPI 6: Доля оцифрованных записей (%)
  if (egrnSheet) {
    const avgDigitized = averageColumn(egrnSheet.rows, 'Доля оцифрованных (%)');
    const prevDigitized = computePrevAverage(egrnSheet, 'Доля оцифрованных (%)');
    
    kpis.push({
      id: 'digitized_share',
      name: 'Оцифровка записей ЕГРН',
      value: Math.round(avgDigitized * 10) / 10,
      unit: '%',
      threshold: { green: 90, yellow: 80, red: 70, direction: 'higher_is_better' },
      trend: avgDigitized >= prevDigitized ? 'up' : 'down',
      changePercent: Math.round((avgDigitized - prevDigitized) * 10) / 10
    });
  }

  // KPI 7: Исправление ошибок реестра (%)
  const cadastralSheet = data.sheets.find(s => s.name.includes('Кадастровый'));
  if (cadastralSheet) {
    const totalErrors = sumColumn(cadastralSheet.rows, 'Ошибок в реестре');
    const totalFixed = sumColumn(cadastralSheet.rows, 'Исправлено ошибок');
    const fixRate = totalErrors > 0 ? (totalFixed / totalErrors) * 100 : 0;
    
    kpis.push({
      id: 'error_fix_rate',
      name: 'Исправление ошибок реестра',
      value: Math.round(fixRate * 10) / 10,
      unit: '%',
      threshold: { green: 90, yellow: 75, red: 50, direction: 'higher_is_better' },
      trend: 'stable',
      changePercent: 0
    });
  }

  return kpis;
}

export function generateAlerts(kpis: KPI[]): Alert[] {
  const alerts: Alert[] = [];

  kpis.forEach(kpi => {
    const status = getKPIStatus(kpi);
    
    if (status === 'red') {
      alerts.push({
        id: `alert_${kpi.id}_critical`,
        kpiId: kpi.id,
        kpiName: kpi.name,
        level: 'critical',
        message: `Критическое отклонение: ${kpi.value}${kpi.unit} (порог: ${getThresholdText(kpi)})`,
        timestamp: new Date(),
        value: kpi.value,
        threshold: kpi.threshold.direction === 'higher_is_better' ? kpi.threshold.red : kpi.threshold.red
      });
    } else if (status === 'yellow') {
      alerts.push({
        id: `alert_${kpi.id}_warning`,
        kpiId: kpi.id,
        kpiName: kpi.name,
        level: 'warning',
        message: `Предупреждение: ${kpi.value}${kpi.unit} (порог: ${getThresholdText(kpi)})`,
        timestamp: new Date(),
        value: kpi.value,
        threshold: kpi.threshold.direction === 'higher_is_better' ? kpi.threshold.yellow : kpi.threshold.yellow
      });
    }
  });

  return alerts;
}

export function getKPIStatus(kpi: KPI): 'green' | 'yellow' | 'red' {
  const { value, threshold } = kpi;
  
  if (threshold.direction === 'higher_is_better') {
    if (value >= threshold.green) return 'green';
    if (value >= threshold.yellow) return 'yellow';
    return 'red';
  } else {
    if (value <= threshold.green) return 'green';
    if (value <= threshold.yellow) return 'yellow';
    return 'red';
  }
}

function getThresholdText(kpi: KPI): string {
  if (kpi.threshold.direction === 'higher_is_better') {
    return `≥${kpi.threshold.green}${kpi.unit} (зел.), ≥${kpi.threshold.yellow}${kpi.unit} (жел.)`;
  }
  return `≤${kpi.threshold.green}${kpi.unit} (зел.), ≤${kpi.threshold.yellow}${kpi.unit} (жел.)`;
}

export function getDrillDownData(data: ExcelData, kpiId: string, category: string, value: string): DataRow[] {
  const sheetMap: Record<string, string> = {
    'processing_rate': 'Регистрация',
    'avg_registration_term': 'Регистрация',
    'refusal_rate': 'Регистрация',
    'digital_share': 'Регистрация',
    'data_accuracy': 'ЕГРН',
    'digitized_share': 'ЕГРН',
    'error_fix_rate': 'Кадастровый'
  };

  const sheetName = sheetMap[kpiId];
  const sheet = data.sheets.find(s => s.name.includes(sheetName));
  
  if (!sheet) return [];

  if (category === 'root') {
    return sheet.rows;
  }

  return sheet.rows.filter(row => {
    const textCols = sheet.textColumns;
    if (textCols.length > 0) {
      return String(row[textCols[0]]) === value;
    }
    return false;
  });
}

export function getSheetSummary(sheet: SheetData): { categories: string[]; metrics: { name: string; total: number; avg: number }[] } {
  const categories = sheet.textColumns.length > 0
    ? [...new Set(sheet.rows.map(r => String(r[sheet.textColumns[0]])))]
    : [];

  const metrics = sheet.numericColumns.map(col => ({
    name: col,
    total: sumColumn(sheet.rows, col),
    avg: averageColumn(sheet.rows, col)
  }));

  return { categories, metrics };
}

// Helper functions
function sumColumn(rows: DataRow[], column: string): number {
  return rows.reduce((sum, row) => {
    const val = Number(row[column]);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}

function averageColumn(rows: DataRow[], column: string): number {
  const values = rows.map(row => Number(row[column])).filter(v => !isNaN(v));
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computePeriodChange(sheet: SheetData, submittedCol: string, processedCol: string): number {
  const months = [...new Set(sheet.rows.map(r => String(r[sheet.textColumns[1]])))];
  if (months.length < 2) return 0;
  
  const prevMonth = months[months.length - 2];
  const prevRows = sheet.rows.filter(r => String(r[sheet.textColumns[1]]) === prevMonth);
  const submitted = sumColumn(prevRows, submittedCol);
  const processed = sumColumn(prevRows, processedCol);
  return submitted > 0 ? (processed / submitted) * 100 : 0;
}

function computeRefusalChange(sheet: SheetData): number {
  const months = [...new Set(sheet.rows.map(r => String(r[sheet.textColumns[1]])))];
  if (months.length < 2) return 0;
  
  const prevMonth = months[months.length - 2];
  const prevRows = sheet.rows.filter(r => String(r[sheet.textColumns[1]]) === prevMonth);
  const submitted = sumColumn(prevRows, 'Заявления подано');
  const refusals = sumColumn(prevRows, 'Отказов');
  return submitted > 0 ? (refusals / submitted) * 100 : 0;
}

function computePrevAverage(sheet: SheetData, column: string): number {
  const months = [...new Set(sheet.rows.map(r => String(r[sheet.textColumns[1]])))];
  if (months.length < 2) return averageColumn(sheet.rows, column);
  
  const prevMonth = months[months.length - 2];
  const prevRows = sheet.rows.filter(r => String(r[sheet.textColumns[1]]) === prevMonth);
  return averageColumn(prevRows, column);
}
