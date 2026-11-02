import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return (
      <div className="rounded-[20px] bg-white border border-[#99D1FF] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E0F9EA] flex items-center justify-center">
            <span className="text-[14px]">✓</span>
          </div>
          <h3 className="text-[14px] font-bold text-[#39505E]">Система в норме</h3>
        </div>
        <p className="text-[12px] text-[#595959]">Критических отклонений не обнаружено</p>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  const warningAlerts = alerts.filter(a => a.level === 'warning');

  return (
    <div className="rounded-[20px] bg-white border border-[#99D1FF] p-4 shadow-[0_4px_20px_rgba(0,140,255,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-[#39505E] uppercase tracking-wide">
          ⚡ Алерты ({alerts.length})
        </h3>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFE8E8] text-[10px] font-bold text-[#FF4D4D]">
              Критичных: {criticalAlerts.length}
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFF8E0] text-[10px] font-bold text-[#FFB800]">
              Предупреждений: {warningAlerts.length}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start gap-2 p-2 rounded-xl border ${
              alert.level === 'critical' 
                ? 'bg-[#FFE8E8]/50 border-[#FF4D4D]/30' 
                : 'bg-[#FFF8E0]/50 border-[#FFB800]/30'
            }`}
          >
            <div className="mt-0.5">
              {alert.level === 'critical' ? (
                <AlertCircle size={14} className="text-[#FF4D4D]" />
              ) : (
                <AlertTriangle size={14} className="text-[#FFB800]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#39505E]">{alert.kpiName}</p>
              <p className="text-[11px] text-[#595959] truncate">{alert.message}</p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-[#595959] hover:text-[#39505E] transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
