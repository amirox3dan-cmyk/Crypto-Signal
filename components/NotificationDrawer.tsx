
import React from 'react';
import { MarketSignal, SignalType, Language } from '../types';
import { X, Bell, Clock } from 'lucide-react';
import { translations } from '../utils/translations';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  signals: MarketSignal[];
  language: Language;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, signals, language }) => {
  const sortedSignals = [...signals].sort((a, b) => b.timestamp - a.timestamp);
  const t = translations[language];

  const formatDate = (timestamp: number) => {
    if (language === 'en') {
      return new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(timestamp).toLocaleString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel (Sliding from Left) */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-[100] w-80 bg-dark-900 border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-dark-800">
            <div className="flex items-center gap-2 text-white font-bold">
              <Bell className="text-brand-500" size={20} />
              <span>{t.notificationsTitle}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {sortedSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                <Bell size={32} className="mb-2 opacity-20" />
                <p>{t.noNotifications}</p>
              </div>
            ) : (
              sortedSignals.map((signal) => (
                <div 
                  key={signal.id} 
                  className="relative overflow-hidden rounded-xl border border-white/5 bg-dark-800 p-3 transition-all hover:bg-dark-700"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${signal.type === SignalType.BUY ? 'bg-success' : 'bg-danger'}`}></div>
                  
                  <div className="flex justify-between items-start mb-1 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{signal.symbol}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                         signal.type === SignalType.BUY 
                         ? 'bg-success/10 text-success' 
                         : 'bg-danger/10 text-danger'
                      }`}>
                        {signal.type === SignalType.BUY ? (language === 'fa' ? 'خرید' : 'BUY') : (language === 'fa' ? 'فروش' : 'SELL')}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(signal.timestamp)}
                    </span>
                  </div>

                  <div className="pl-2 mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">{t.entry}:</span>
                       <span className="text-white font-mono">${signal.entryPrices[0]?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-gray-500">{t.target}:</span>
                       <span className="text-success font-mono">${signal.targetPrices[0]?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-white/5 pl-2">
                      <p className="text-[10px] text-gray-400 line-clamp-2">
                          {signal.reasoning}
                      </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-dark-800 text-[10px] text-gray-500 text-center">
            {t.enableNotificationsHint}
          </div>
        </div>
      </div>
    </>
  );
};
