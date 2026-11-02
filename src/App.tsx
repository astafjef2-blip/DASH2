import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExcelData, KPI, Alert } from './types';
import { parseExcelFile, generateDemoData } from './utils/excelParser';
import { computeKPIs, generateAlerts } from './utils/dataAnalysis';
import Header from './components/Header';
import KPICard from './components/KPICard';
import GaugeChart from './components/GaugeChart';
import AlertsPanel from './components/AlertsPanel';
import DrillDownPanel from './components/DrillDownPanel';
import SheetExplorer from './components/SheetExplorer';
import TrendChart from './components/TrendChart';
import { RefreshCw, Clock, FileSpreadsheet, Settings } from 'lucide-react';

function App() {
  const [data, setData] = useState<ExcelData | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load demo data on mount
  useEffect(() => {
    const demoData = generateDemoData();
    setData(demoData);
    const computedKPIs = computeKPIs(demoData);
    setKpis(computedKPIs);
    setAlerts(generateAlerts(computedKPIs));
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (data) {
        handleRefresh();
      }
    }, autoRefreshInterval * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefreshInterval, data]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh with slight data variation
    setTimeout(() => {
      if (data) {
        const refreshedData = { ...data, lastUpdated: new Date() };
        setData(refreshedData);
        const newKPIs = computeKPIs(refreshedData);
        setKpis(newKPIs);
        setAlerts(generateAlerts(newKPIs));
      }
      setIsRefreshing(false);
    }, 800);
  }, [data]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      const computedKPIs = computeKPIs(parsedData);
      setKpis(computedKPIs);
      setAlerts(generateAlerts(computedKPIs));
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Ошибка при чтении файла. Убедитесь, что файл в формате Excel (.xlsx, .xls)');
    }
  };

  const handleLoadDemo = () => {
    const demoData = generateDemoData();
    setData(demoData);
    const computedKPIs = computeKPIs(demoData);
    setKpis(computedKPIs);
    setAlerts(generateAlerts(computedKPIs));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] relative overflow-hidden">
      {/* Background decoration - binary pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #008CFF 40px, #008CFF 41px),
                           repeating-linear-gradient(90deg, transparent, transparent 40px, #008CFF 40px, #008CFF 41px)`,
        }} />
      </div>

      {/* Circuit-like decoration */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle cx="100" cy="100" r="4" fill="#008CFF" />
          <circle cx="200" cy="50" r="3" fill="#00CC99" />
          <circle cx="300" cy="150" r="4" fill="#008CFF" />
          <circle cx="150" cy="250" r="3" fill="#00CC99" />
          <circle cx="350" cy="300" r="4" fill="#008CFF" />
          <line x1="100" y1="100" x2="200" y2="50" stroke="#008CFF" strokeWidth="1" />
          <line x1="200" y1="50" x2="300" y2="150" stroke="#008CFF" strokeWidth="1" />
          <line x1="300" y1="150" x2="350" y2="300" stroke="#00CC99" strokeWidth="1" />
          <line x1="100" y1="100" x2="150" y2="250" stroke="#00CC99" strokeWidth="1" />
        </svg>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <Header
        lastUpdated={data?.lastUpdated || null}
        fileName={data?.fileName || ''}
        autoRefresh={autoRefreshInterval}
        onFileUpload={handleFileUpload}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-6">
        {/* Top bar: refresh + settings */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#99D1FF] text-[#008CFF] text-[12px] font-bold hover:bg-[#E7F1FE] transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Обновление...' : 'Обновить'}
            </button>
            
            <div className="flex items-center gap-1 text-[11px] text-[#595959]">
              <Clock size={12} />
              <span>Авто-обновление каждые {autoRefreshInterval} мин</span>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#99D1FF] text-[#595959] text-[12px] hover:bg-[#E7F1FE] transition-all"
          >
            <Settings size={14} />
            Настройки
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-[20px] bg-white border border-[#99D1FF] shadow-[0_4px_20px_rgba(0,140,255,0.08)]">
            <h3 className="text-[14px] font-bold text-[#39505E] mb-3">Настройки авто-обновления</h3>
            <div className="flex items-center gap-4">
              <label className="text-[12px] text-[#595959]">Интервал обновления (минуты):</label>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-[#99D1FF] text-[12px] text-[#39505E] bg-white"
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
              <div className="flex-1" />
              <div className="text-[11px] text-[#595959] italic">
                💡 Для работы авто-обновления из локальной папки разместите файл Excel в папке мониторинга. 
                Приложение будет проверять изменения файла с заданным интервалом.
              </div>
            </div>
          </div>
        )}

        {!data ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#E7F1FE] flex items-center justify-center mb-6">
              <FileSpreadsheet size={40} className="text-[#008CFF]" />
            </div>
            <h2 className="text-[24px] font-bold text-[#39505E] mb-2">Загрузите данные</h2>
            <p className="text-[14px] text-[#595959] mb-6 text-center max-w-md">
              Загрузите файл Excel с данными Росреестра или используйте демо-данные для просмотра возможностей дашборда
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLoadDemo}
                className="px-6 py-3 rounded-xl text-[14px] font-bold bg-[#E7F1FE] text-[#008CFF] border border-[#99D1FF] hover:bg-[#008CFF] hover:text-white transition-all"
              >
                Демо-данные
              </button>
              <button
                onClick={handleFileUpload}
                className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #008CFF, #00CC99)' }}
              >
                📁 Выбрать файл Excel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <section className="mb-6">
              <h2 className="text-[16px] font-bold text-[#39505E] uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00CC99]"></span>
                Ключевые показатели
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {kpis.map(kpi => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    onClick={() => setSelectedKPI(kpi)}
                  />
                ))}
              </div>
            </section>

            {/* Trend chart */}
            <section className="mb-6">
              <TrendChart data={data} />
            </section>

            {/* Middle section: Gauges + Alerts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Gauges */}
              <div className="lg:col-span-2 rounded-[24px] bg-white border border-[#99D1FF] p-5 shadow-[0_4px_20px_rgba(0,140,255,0.08)]">
                <h3 className="text-[14px] font-bold text-[#39505E] uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#008CFF]"></span>
                  Индикаторы выполнения
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {kpis.slice(0, 6).map(kpi => (
                    <div key={kpi.id} className="flex flex-col items-center">
                      <GaugeChart kpi={kpi} />
                      <p className="text-[10px] text-[#595959] text-center mt-1 max-w-[120px]">{kpi.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <AlertsPanel alerts={alerts} onDismiss={handleDismissAlert} />
                
                {/* Quick stats */}
                <div className="mt-4 p-4 rounded-[20px] bg-white border border-[#99D1FF]">
                  <h4 className="text-[12px] font-bold text-[#39505E] uppercase mb-3">Сводка</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#595959]">Листов в файле:</span>
                      <span className="text-[12px] font-bold text-[#008CFF]">{data.sheets.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#595959]">Всего записей:</span>
                      <span className="text-[12px] font-bold text-[#008CFF]">
                        {data.sheets.reduce((sum, s) => sum + s.rows.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#595959]">KPI в зелёной зоне:</span>
                      <span className="text-[12px] font-bold text-[#00CC99]">
                        {kpis.filter(k => {
                          const s = k.threshold.direction === 'higher_is_better' 
                            ? k.value >= k.threshold.green 
                            : k.value <= k.threshold.green;
                          return s;
                        }).length} / {kpis.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sheet Explorer */}
            <section className="mb-6">
              <h2 className="text-[16px] font-bold text-[#39505E] uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF7900]"></span>
                Детализация по листам
              </h2>
              <SheetExplorer data={data} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E7F1FE] mt-8 py-4 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #008CFF, #00CC99)' }}></div>
            <span className="text-[10px] text-[#595959] italic">
              Росреестр • Система мониторинга ключевых процессов • {new Date().getFullYear()}
            </span>
          </div>
          <div className="text-[10px] text-[#99D1FF]">
            BI Dashboard v1.0
          </div>
        </div>
      </footer>

      {/* Drill-down modal */}
      {selectedKPI && data && (
        <DrillDownPanel
          data={data}
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}

export default App;
