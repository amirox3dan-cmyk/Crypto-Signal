
import React from 'react';
import { MarketSignal, SignalType, Language } from '../types';
import { translations } from '../utils/translations';
import { Zap, Target, ShieldAlert, Clock, Edit, Trash2, Layers } from 'lucide-react';

interface SignalCardProps {
  signal: MarketSignal;
  isAdmin?: boolean;
  onEdit?: (signal: MarketSignal) => void;
  onDelete?: (id: string) => void;
  language: Language;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, isAdmin, onEdit, onDelete, language }) => {
  const t = translations[language];
  
  const getTypeColor = (type: SignalType) => {
    switch (type) {
      case SignalType.BUY: return 'text-success border-success/20 bg-success/5';
      case SignalType.SELL: return 'text-danger border-danger/20 bg-danger/5';
      default: return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
    }
  };

  const getTypeLabel = (type: SignalType) => {
    if (language === 'en') return type;
    switch (type) {
      case SignalType.BUY: return 'خرید (Long)';
      case SignalType.SELL: return 'فروش (Short)';
      default: return 'نگهداری (Hold)';
    }
  };

  const formatDate = (timestamp: number) => {
    if (language === 'en') {
      return new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });
    }
    return new Date(timestamp).toLocaleString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
        onDelete(signal.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
        onEdit(signal);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-dark-800 p-5 shadow-lg transition-all hover:shadow-xl hover:border-white/20 group" dir="ltr">
      {/* Always LTR for numbers/crypto cards to keep layout consistent, or handle internal text alignment */}
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 ${signal.type === SignalType.BUY ? 'bg-success' : 'bg-danger'}`}></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-700 font-bold text-white border border-white/5 shadow-inner">
              {signal.symbol.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-none">{signal.symbol}</h3>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                <Clock size={10} />
                {formatDate(signal.timestamp)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${getTypeColor(signal.type)}`}>
              {getTypeLabel(signal.type)}
            </span>
            {signal.leverage && (
              <span className="rounded-lg border border-white/10 bg-dark-900/50 px-2 py-1 text-xs font-bold text-gray-300 flex items-center gap-1">
                 <Zap size={10} className="text-brand-500 fill-brand-500" />
                 {signal.leverage}x
              </span>
            )}
            
            {isAdmin && (
                <div className="flex items-center gap-1 mr-2 relative z-[20]">
                    {onEdit && (
                        <button 
                            type="button"
                            onClick={handleEditClick}
                            className="flex items-center justify-center p-2 rounded-lg bg-dark-700 text-brand-400 hover:bg-brand-500 hover:text-white transition-all border border-white/5 cursor-pointer shadow-sm"
                        >
                            <Edit size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            type="button"
                            onClick={handleDeleteClick}
                            className="flex items-center justify-center p-2 rounded-lg bg-dark-700 text-gray-400 hover:bg-danger hover:text-white transition-all border border-white/5 cursor-pointer shadow-sm hover:shadow-danger/30 active:scale-95"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Grid Layout for Entry/Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Entry Points */}
          <div className="rounded-xl bg-dark-900/50 p-3 border border-white/5">
            <div className={`flex items-center gap-2 mb-2 text-brand-400 text-xs font-bold border-b border-white/5 pb-1 ${language === 'fa' ? 'flex-row-reverse justify-end' : ''}`}>
              <Layers size={14} />
              {t.entry}
            </div>
            <div className="flex flex-wrap gap-2">
              {signal.entryPrices.map((price, idx) => (
                <div key={idx} className={`flex flex-col items-center justify-center rounded border px-3 py-1 ${idx === 0 ? 'bg-brand-500/10 border-brand-500/30 text-white' : 'bg-dark-800 border-white/10 text-gray-400'}`}>
                   <span className="text-[8px] uppercase font-bold opacity-60 mb-0.5">
                     {idx === 0 ? 'Entry' : `M-${idx}`}
                   </span>
                   <span className="font-mono text-sm font-bold">${price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Targets */}
          <div className="rounded-xl bg-dark-900/50 p-3 border border-white/5">
             <div className={`flex items-center gap-2 mb-2 text-success text-xs font-bold border-b border-white/5 pb-1 ${language === 'fa' ? 'flex-row-reverse justify-end' : ''}`}>
              <Target size={14} />
              {t.targets} (TP)
            </div>
             <div className="flex flex-wrap gap-2">
              {signal.targetPrices.map((price, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center rounded border border-success/20 bg-success/5 px-3 py-1 text-success">
                   <span className="text-[8px] uppercase font-bold opacity-60 mb-0.5">TP-{idx + 1}</span>
                   <span className="font-mono text-sm font-bold">${price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Stop Loss & Note */}
        <div className="flex flex-col gap-3">
           <div className="flex items-center justify-between rounded-lg bg-danger/10 border border-danger/20 p-2 px-3">
             <span className="text-xs text-danger font-bold flex items-center gap-1">
               <ShieldAlert size={14} />
               {t.stopLoss}
             </span>
             <span className="font-mono text-sm font-bold text-danger">
               ${signal.stopLoss.toLocaleString()}
             </span>
           </div>
           
           {signal.reasoning && (
             <p className={`text-xs text-gray-400 leading-relaxed pr-2 mr-1 ${language === 'fa' ? 'border-r-2 border-brand-500/50 text-right' : 'border-l-2 border-brand-500/50 text-left pl-2 ml-1 border-r-0 mr-0'}`}>
               {signal.reasoning}
             </p>
           )}
        </div>
      </div>
    </div>
  );
};
