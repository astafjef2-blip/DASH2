import React from 'react';
import { KPI } from '../types';
import { getKPIStatus } from '../utils/dataAnalysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  kpi: KPI;
  onClick: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, onClick }) => {
  const status = getKPIStatus(kpi);
  
  const statusColors = {
    green: { bg: '#E0F9EA', border: '#00CC99', text: '#00CC99', label: 'Норма' },
    yellow: { bg: '#FFF8E0', border: '#FFB800', text: '#FFB800', label: 'Внимание' },
    red: { bg: '#FFE8E8', border: '#FF4D4D', text: '#FF4D4D', label: 'Критично' }
  };

  const colors = statusColors[status];

  // Gauge calculation
  const gaugePercent = calculateGaugePercent(kpi);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Card */}
      <div
        className="rounded-[24px] p-5 bg-white border-2 transition-all duration-300"
        style={{
          borderColor: colors.border,
          boxShadow: `0 4px 20px ${colors.border}30`
        }}
      >
        {/* Tab label */}
        <div
          className="absolute -top-3 left-5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: `linear-gradient(135deg, #008CFF, #00CC99)` }}
        >
          {colors.label}
        </div>

        {/* KPI Name */}
        <h3 className="text-[13px] font-bold text-[#39505E] uppercase tracking-wide mt-1 mb-3">
          {kpi.name}
        </h3>

        {/* Value */}
        <div className="flex items-end gap-2 mb-3">
          <span className="text-[32px] font-bold" style={{ color: colors.text }}>
            {kpi.value.toLocaleString('ru-RU')}
          </span>
          <span className="text-[14px] text-[#595959] mb-1">{kpi.unit}</span>
        </div>

        {/* Mini gauge */}
        <div className="w-full h-3 bg-[#F2F2F2] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${gaugePercent}%`,
              background: `linear-gradient(90deg, ${colors.border}, ${colors.border}CC)`
            }}
          />
        </div>

        {/* Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {kpi.trend === 'up' && <TrendingUp size={14} className="text-[#00CC99]" />}
            {kpi.trend === 'down' && <TrendingDown size={14} className="text-[#FF4D4D]" />}
            {kpi.trend === 'stable' && <Minus size={14} className="text-[#595959]" />}
            <span className={`text-[12px] font-bold ${
              kpi.trend === 'up' ? 'text-[#00CC99]' : 
              kpi.trend === 'down' ? 'text-[#FF4D4D]' : 'text-[#595959]'
            }`}>
              {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent}%
            </span>
          </div>
          <span className="text-[10px] text-[#595959] italic">
            к пред. периоду
          </span>
        </div>

        {/* Threshold indicators */}
        <div className="flex gap-1 mt-3">
          <div className="flex-1 h-1 rounded-full bg-[#00CC99] opacity-80"></div>
          <div className="flex-1 h-1 rounded-full bg-[#FFB800] opacity-80"></div>
          <div className="flex-1 h-1 rounded-full bg-[#FF4D4D] opacity-80"></div>
        </div>
      </div>

      {/* Hover hint */}
      <div className="absolute bottom-2 right-3 text-[10px] text-[#99D1FF] opacity-0 group-hover:opacity-100 transition-opacity">
        Детализация →
      </div>
    </div>
  );
};

function calculateGaugePercent(kpi: KPI): number {
  const { value, threshold } = kpi;
  
  if (threshold.direction === 'higher_is_better') {
    // Higher is better: 0 at red, 100 at/above green
    if (value >= threshold.green) return 100;
    if (value <= threshold.red) return 5;
    const range = threshold.green - threshold.red;
    return Math.max(5, Math.min(100, ((value - threshold.red) / range) * 100));
  } else {
    // Lower is better: 100 at/below green, 0 at/above red
    if (value <= threshold.green) return 100;
    if (value >= threshold.red) return 5;
    const range = threshold.red - threshold.green;
    return Math.max(5, Math.min(100, ((threshold.red - value) / range) * 100));
  }
}

export default KPICard;
