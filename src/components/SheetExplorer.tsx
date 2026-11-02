import React, { useState, useMemo } from 'react';
import { ExcelData } from '../types';
import { getSheetSummary } from '../utils/dataAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SheetExplorerProps {
  data: ExcelData;
}

const SheetExplorer: React.FC<SheetExplorerProps> = ({ data }) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const sheet = data.sheets[activeSheet];
  const summary = useMemo(() => sheet ? getSheetSummary(sheet) : null, [sheet]);

  if (!sheet || !summary) return null;

  // Prepare chart data
  const chartData = summary.categories.map(cat => {
    const catRows = sheet.rows.filter(r => String(r[sheet.textColumns[0]]) === cat);
    const result: any = { name: cat };
    
    sheet.numericColumns.slice(0, 4).forEach(col => {
      const values = catRows.map(r => Number(r[col])).filter(v => !isNaN(v));
      result[col] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    });
    
    return result;
  });

  return (
    <div className="rounded-[24px] bg-white border border-[#99D1FF] overflow-hidden shadow-[0_4px_20px_rgba(0,140,255,0.08)]">
      {/* Sheet tabs */}
      <div className="flex border-b border-[#E7F1FE] overflow-x-auto">
        {data.sheets.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSheet(idx)}
            className={`px-4 py-3 text-[12px] font-bold whitespace-nowrap transition-all ${
              idx === activeSheet
                ? 'text-[#008CFF] border-b-2 border-[#008CFF] bg-[#E7F1FE]/50'
                : 'text-[#595959] hover:text-[#008CFF] hover:bg-[#F2F2F2]'
            }`}
          >
            📊 {s.name}
          </button>
        ))}
      </div>

      {/* Multi-level headers display */}
      {sheet.multiLevelHeaders.length > 1 && (
        <div className="px-4 py-2 bg-[#F2F2F2]/50 border-b border-[#E7F1FE]">
          <div className="flex gap-2 flex-wrap">
            {sheet.multiLevelHeaders[0]?.filter(h => h.trim()).map((h, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-[#E7F1FE] text-[10px] font-bold text-[#008CFF]">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Chart */}
        <div className="h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
              <YAxis tick={{ fontSize: 11, fill: '#595959' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #99D1FF', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {sheet.numericColumns.slice(0, 4).map((col, idx) => (
                <Bar
                  key={col}
                  dataKey={col}
                  fill={['#008CFF', '#00CC99', '#FF7900', '#1890FA'][idx]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data table */}
        <div className="rounded-[16px] border border-[#E7F1FE] overflow-auto max-h-[300px]">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0">
              <tr className="bg-[#E7F1FE]">
                {sheet.headers.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-bold text-[#39505E] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-[#F2F2F2] hover:bg-[#E7F1FE]/30">
                  {sheet.headers.map((h, hidx) => (
                    <td key={hidx} className={`px-3 py-1.5 ${
                      sheet.textColumns.includes(h) ? 'font-medium text-[#39505E]' : 'text-[#595959]'
                    }`}>
                      {typeof row[h] === 'number' ? row[h].toLocaleString('ru-RU') : String(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {summary.metrics.slice(0, 4).map((m, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-[#F2F2F2]/50 text-center">
              <div className="text-[10px] text-[#595959] uppercase tracking-wide truncate">{m.name}</div>
              <div className="text-[16px] font-bold text-[#008CFF]">{m.avg.toFixed(1)}</div>
              <div className="text-[9px] text-[#595959]">среднее</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SheetExplorer;
