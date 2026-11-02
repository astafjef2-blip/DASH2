import React from 'react';
import { KPI } from '../types';
import { getKPIStatus } from '../utils/dataAnalysis';

interface GaugeChartProps {
  kpi: KPI;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ kpi }) => {
  const status = getKPIStatus(kpi);
  const statusColors = {
    green: '#00CC99',
    yellow: '#FFB800',
    red: '#FF4D4D'
  };
  
  const color = statusColors[status];
  const percentage = calculateGaugeValue(kpi);
  
  // SVG arc calculation
  const radius = 70;
  const strokeWidth = 12;
  const center = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + (totalAngle * percentage / 100);

  const createArc = (startA: number, endA: number) => {
    const startRad = (startA * Math.PI) / 180;
    const endRad = (endA * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArc = endA - startA > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="130" viewBox="0 0 180 130">
        {/* Background arc */}
        <path
          d={createArc(startAngle, endAngle)}
          fill="none"
          stroke="#F2F2F2"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Colored segments */}
        <path
          d={createArc(startAngle, startAngle + totalAngle * 0.33)}
          fill="none"
          stroke="#FF4D4D"
          strokeWidth={strokeWidth - 4}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d={createArc(startAngle + totalAngle * 0.33, startAngle + totalAngle * 0.66)}
          fill="none"
          stroke="#FFB800"
          strokeWidth={strokeWidth - 4}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d={createArc(startAngle + totalAngle * 0.66, endAngle)}
          fill="none"
          stroke="#00CC99"
          strokeWidth={strokeWidth - 4}
          strokeLinecap="round"
          opacity={0.3}
        />

        {/* Value arc */}
        <path
          d={createArc(startAngle, currentAngle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Center value */}
        <text x={center} y={center - 5} textAnchor="middle" className="text-[24px] font-bold" fill={color}>
          {kpi.value}
        </text>
        <text x={center} y={center + 15} textAnchor="middle" className="text-[12px]" fill="#595959">
          {kpi.unit}
        </text>
      </svg>
      
      {/* Threshold labels */}
      <div className="flex justify-between w-full px-4 mt-1">
        <span className="text-[10px] text-[#FF4D4D]">
          {kpi.threshold.direction === 'higher_is_better' ? `<${kpi.threshold.yellow}` : `>${kpi.threshold.red}`}
        </span>
        <span className="text-[10px] text-[#FFB800]">
          {kpi.threshold.yellow}
        </span>
        <span className="text-[10px] text-[#00CC99]">
          {kpi.threshold.direction === 'higher_is_better' ? `≥${kpi.threshold.green}` : `≤${kpi.threshold.green}`}
        </span>
      </div>
    </div>
  );
};

function calculateGaugeValue(kpi: KPI): number {
  const { value, threshold } = kpi;
  
  if (threshold.direction === 'higher_is_better') {
    if (value >= threshold.green) return 100;
    if (value <= 0) return 0;
    return Math.min(100, (value / threshold.green) * 100);
  } else {
    if (value <= threshold.green) return 100;
    if (value >= threshold.red * 2) return 0;
    return Math.max(0, (1 - (value - threshold.green) / (threshold.red * 2 - threshold.green)) * 100);
  }
}

export default GaugeChart;
