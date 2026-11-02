import React, { useMemo } from 'react';
import { ExcelData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  data: ExcelData;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const regSheet = data.sheets.find(s => s.name.includes('Регистрация'));
    if (!regSheet || regSheet.textColumns.length < 2) return [];

    const months = [...new Set(regSheet.rows.map(r => String(r[regSheet.textColumns[1]])))];
    
    return months.map(month => {
      const monthRows = regSheet.rows.filter(r => String(r[regSheet.textColumns[1]]) === month);
      const submitted = monthRows.reduce((s, r) => s + (Number(r['Заявления подано']) || 0), 0);
      const processed = monthRows.reduce((s, r) => s + (Number(r['Заявления обработано']) || 0), 0);
      const refusals = monthRows.reduce((s, r) => s + (Number(r['Отказов']) || 0), 0);
      
      return {
        name: month,
        'Подано': submitted,
        'Обработано': processed,
        'Отказы': refusals,
        'Обработка (%)': submitted > 0 ? Math.round((processed / submitted) * 1000) / 10 : 0
      };
    });
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="rounded-[24px] bg-white border border-[#99D1FF] p-5 shadow-[0_4px_20px_rgba(0,140,255,0.08)]">
      <h3 className="text-[14px] font-bold text-[#39505E] uppercase tracking-wide mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1890FA]"></span>
        Динамика процессов регистрации
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F2" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#595959' }} />
            <YAxis tick={{ fontSize: 11, fill: '#595959' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #99D1FF', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line 
              type="monotone" 
              dataKey="Подано" 
              stroke="#008CFF" 
              strokeWidth={2}
              dot={{ fill: '#008CFF', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Обработано" 
              stroke="#00CC99" 
              strokeWidth={2}
              dot={{ fill: '#00CC99', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Отказы" 
              stroke="#FF7900" 
              strokeWidth={2}
              dot={{ fill: '#FF7900', r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
