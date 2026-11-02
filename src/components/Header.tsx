import React from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  fileName: string;
  autoRefresh: number;
  onFileUpload: () => void;
  onLoadDemo: () => void;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, fileName, autoRefresh, onFileUpload, onLoadDemo }) => {
  return (
    <header className="relative bg-white border-b border-[#99D1FF] px-6 py-4">
      {/* Tech ornament strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008CFF] via-[#00CC99] to-[#008CFF] opacity-60"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Emblem */}
          <div className="w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-10 h-10">
              <circle cx="32" cy="32" r="30" fill="#008CFF" />
              <text x="32" y="38" textAnchor="middle" fill="white" fontSize="16" fontFamily="Arial" fontWeight="bold">РР</text>
            </svg>
          </div>
          
          <div>
            <h1 className="text-[20px] font-bold text-[#39505E] leading-tight">
              Дашборд руководителя
            </h1>
            <p className="text-[12px] text-[#595959] italic">
              Мониторинг ключевых процессов Росреестра
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status info */}
          <div className="text-right">
            {lastUpdated && (
              <div className="text-[11px] text-[#595959]">
                <span className="font-semibold">Обновлено:</span>{' '}
                {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {fileName && (
              <div className="text-[11px] text-[#595959]">
                <span className="font-semibold">Файл:</span> {fileName}
              </div>
            )}
            <div className="text-[11px] text-[#00CC99] font-semibold">
              Авто-обновление: {autoRefresh} мин
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onLoadDemo}
              className="px-3 py-2 rounded-xl text-[12px] font-bold bg-[#E7F1FE] text-[#008CFF] border border-[#99D1FF] hover:bg-[#008CFF] hover:text-white transition-all duration-200"
            >
              Демо-данные
            </button>
            <button
              onClick={onFileUpload}
              className="px-3 py-2 rounded-xl text-[12px] font-bold text-white border border-[#008CFF] transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #008CFF, #00CC99)' }}
            >
              📁 Загрузить Excel
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
