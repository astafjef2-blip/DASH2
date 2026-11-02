import React, { useState, useMemo } from 'react';
import { ExcelData, KPI } from '../types';
import { getKPIStatus } from '../utils/dataAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, ChevronRight, X } from 'lucide-react';

interface DrillDownPanelProps {
  data: ExcelData;
  kpi: KPI;
  onClose: () => void;
}

const DrillDownPanel: React.FC<DrillDownPanelProps> = ({ data, kpi, onClose }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Determine which numeric column to show for this KPI
  const kpiColumnMap: Record<string, string[]> = {
    'processing_rate': ['Заявления подано', 'Заявления обработано'],
    'avg_registration_term': ['Средний срок (дни)'],
    'refusal_rate': ['Отказов', 'Заявления подано'],
    'digital_share': ['Доля электронных заявлений (%)'],
    'data_accuracy': ['Актуальность данных (%)'],
    'digitized_share': ['Доля оцифрованных (%)'],
    'error_fix_rate': ['Ошибок в реестре', 'Исправлено ошибок']
  };

  const columns = kpiColumnMap[kpi.id] || [];

  // Get the relevant sheet
  const relevantSheet = useMemo(() => {
    const sheetMap: Record<string, string> = {
      'processing_rate': 'Регистрация',
      'avg_registration_term': 'Регистрация',
      'refusal_rate': 'Регистрация',
      'digital_share': 'Регистрация',
      'data_accuracy': 'ЕГРН',
      'digitized_share': 'ЕГРН',
      'error_fix_rate': 'Кадастровый'
    };
    const sheetName = sheetMap[kpi.id];
    return data.sheets.find(s => s.name.includes(sheetName));
  }, [data, kpi.id]);

  // Level 1: By first text column (e.g., Region)
  const level1Data = useMemo(() => {
    if (!relevantSheet || relevantSheet.textColumns.length === 0) return [];
    const groupCol = relevantSheet.textColumns[0];
    const groups = [...new Set(relevantSheet.rows.map(r => String(r[groupCol])))];
    
    return groups.map(group => {
      const groupRows = relevantSheet.rows.filter(r => String(r[groupCol]) === group);
      const result: any = { name: group };
      
      columns.forEach(col => {
        if (col) {
          const values = groupRows.map(r => Number(r[col])).filter(v => !isNaN(v));
          result[col] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
      });
      
      // Calculate composite metric for special KPIs
      if (kpi.id === 'processing_rate') {
        const submitted = groupRows.reduce((s, r) => s + (Number(r['Заявления подано']) || 0), 0);
        const processed = groupRows.reduce((s, r) => s + (Number(r['Заявления обработано']) || 0), 0);
        result['Обработка (%)'] = submitted > 0 ? (processed / submitted) * 100 : 0;
      } else if (kpi.id === 'refusal_rate') {
        const submitted = groupRows.reduce((s, r) => s + (Number(r['Заявления подано']) || 0), 0);
        const refusals = groupRows.reduce((s, r) => s + (Number(r['Отказов']) || 0), 0);
        result['Доля отказов (%)'] = submitted > 0 ? (refusals / submitted) * 100 : 0;
      }
      
      return result;
    });
  }, [relevantSheet, kpi.id, columns]);

  // Level 2: By second text column (e.g., Month) within selected category
  const level2Data = useMemo(() => {
    if (!relevantSheet || relevantSheet.textColumns.length < 2 || !selectedCategory) return [];
    const groupCol = relevantSheet.textColumns[0];
    const subGroupCol = relevantSheet.textColumns[1];
    
    const filteredRows = relevantSheet.rows.filter(r => String(r[groupCol]) === selectedCategory);
    const subGroups = [...new Set(filteredRows.map(r => String(r[subGroupCol])))];
    
    return subGroups.map(sub => {
      const subRows = filteredRows.filter(r => String(r[subGroupCol]) === sub);
      const result: any = { name: sub };
      
      columns.forEach(col => {
        if (col) {
          const values = subRows.map(r => Number(r[col])).filter(v => !isNaN(v));
          result[col] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        }
      });
      
      if (kpi.id === 'processing_rate') {
        const submitted = subRows.reduce((s, r) => s + (Number(r['Заявления подано']) || 0), 0);
        const processed = subRows.reduce((s, r) => s + (Number(r['Заявления обработано']) || 0), 0);
        result['Обработка (%)'] = submitted > 0 ? (processed / submitted) * 100 : 0;
      } else if (kpi.id === 'refusal_rate') {
        const submitted = subRows.reduce((s, r) => s + (Number(r['Заявления подано']) || 0), 0);
        const refusals = subRows.reduce((s, r) => s + (Number(r['Отказов']) || 0), 0);
        result['Доля отказов (%)'] = submitted > 0 ? (refusals / submitted) * 100 : 0;
      }
      
      return result;
    });
  }, [relevantSheet, selectedCategory, kpi.id, columns]);

  // Get display column
  const displayColumn = useMemo(() => {
    if (kpi.id === 'processing_rate') return 'Обработка (%)';
    if (kpi.id === 'refusal_rate') return 'Доля отказов (%)';
    return columns[0] || '';
  }, [kpi.id, columns]);

  const getBarColor = (value: number) => {
    const status = getKPIStatus({ ...kpi, value });
    return status === 'green' ? '#00CC99' : status === 'yellow' ? '#FFB800' : '#FF4D4D';
  };

  const chartData = currentLevel === 0 ? level1Data : level2Data;
  const textColName = relevantSheet?.textColumns[currentLevel] || '';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[28px] w-full max-w-4xl max-h-[85vh] overflow-hidden border-2 border-[#99D1FF] shadow-[0_8px_40px_rgba(0,140,255,0.15)]">
        {/* Header */}
        <div className="p-5 border-b border-[#E7F1FE]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentLevel > 0 && (
                <button
                  onClick={() => {
                    if (currentLevel === 2) {
                      setCurrentLevel(1);
                      setSelectedSubcategory(null);
                    } else {
                      setCurrentLevel(0);
                      setSelectedCategory(null);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-[#E7F1FE] flex items-center justify-center hover:bg-[#99D1FF] transition-colors"
                >
                  <ArrowLeft size={14} className="text-[#008CFF]" />
                </button>
              )}
              <div>
                <h2 className="text-[18px] font-bold text-[#39505E]">{kpi.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[11px] text-[#008CFF] font-bold">Уровень {currentLevel + 1}</span>
                  <ChevronRight size={10} className="text-[#99D1FF]" />
                  <span className="text-[11px] text-[#595959]">
                    {currentLevel === 0 ? 'По регионам' : `По месяцам (${selectedCategory})`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center hover:bg-[#FFE8E8] transition-colors"
            >
              <X size={14} className="text-[#595959]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Chart */}
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#595959' }}
                  axisLine={{ stroke: '#99D1FF' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#595959' }}
                  axisLine={{ stroke: '#99D1FF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 12, 
                    border: '1px solid #99D1FF',
                    fontSize: 12
                  }}
                />
                <Bar 
                  dataKey={displayColumn} 
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (currentLevel === 0) {
                      setSelectedCategory(data.name);
                      setCurrentLevel(1);
                    }
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry[displayColumn])} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data table */}
          <div className="rounded-[16px] border border-[#E7F1FE] overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#E7F1FE]">
                  <th className="px-3 py-2 text-left font-bold text-[#39505E]">{textColName || 'Категория'}</th>
                  <th className="px-3 py-2 text-right font-bold text-[#39505E]">{displayColumn}</th>
                  <th className="px-3 py-2 text-center font-bold text-[#39505E]">Статус</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => {
                  const status = getKPIStatus({ ...kpi, value: row[displayColumn] });
                  return (
                    <tr
                      key={idx}
                      className={`border-t border-[#F2F2F2] ${currentLevel === 0 ? 'cursor-pointer hover:bg-[#E7F1FE]/50' : ''}`}
                      onClick={() => {
                        if (currentLevel === 0) {
                          setSelectedCategory(row.name);
                          setCurrentLevel(1);
                        }
                      }}
                    >
                      <td className="px-3 py-2 font-medium text-[#39505E]">{row.name}</td>
                      <td className="px-3 py-2 text-right font-bold">
                        {typeof row[displayColumn] === 'number' 
                          ? row[displayColumn].toFixed(1) 
                          : row[displayColumn]}
                        {kpi.unit && <span className="text-[#595959] ml-1">{kpi.unit}</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          status === 'green' ? 'bg-[#00CC99]' :
                          status === 'yellow' ? 'bg-[#FFB800]' : 'bg-[#FF4D4D]'
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownPanel;
