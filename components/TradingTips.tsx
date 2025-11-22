
import React from 'react';
import { X, Lightbulb, ShieldCheck, Target, Scale, AlertOctagon } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface TradingTipsProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const TradingTips: React.FC<TradingTipsProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-dark-800 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-dark-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-inner">
                <Lightbulb size={24} className="fill-yellow-500/20" />
             </div>
             <div>
                <h2 className="text-xl font-black text-white">{t.tipsTitle}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t.tipsSubtitle}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
            
            {/* Tip 1: Management */}
            <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <Scale size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white mb-2 text-sm">{t.tip_management}</h3>
                    <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0"></div>
                            {t.lowVol} (BTC/ETH): <span className="text-white font-bold">1%</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></div>
                            {t.highVol} (Altcoins): <span className="text-white font-bold">0.5%</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-danger shrink-0"></div>
                            {t.memeCoins}: <span className="text-white font-bold">0.33%</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            {/* Tip 2: Martingale */}
            <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white mb-1 text-sm">{t.tip_martingale}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                       {t.martingaleDesc}
                    </p>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            {/* Tip 3: TP Psychology */}
            <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 rounded-lg bg-success/10 text-success border border-success/20 shrink-0">
                    <Target size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white mb-1 text-sm">{t.tip_tp}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        {t.tpDesc}
                    </p>
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

            {/* Tip 4: Emotional Control */}
            <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 rounded-lg bg-danger/10 text-danger border border-danger/20 shrink-0">
                    <AlertOctagon size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white mb-1 text-sm">{t.tip_psychology}</h3>
                    <p className={`text-xs text-gray-400 leading-relaxed ${language === 'fa' ? 'border-r-2 pr-2 mr-1' : 'border-l-2 pl-2 ml-1'} border-danger/50`}>
                        {t.psychoDesc}
                    </p>
                </div>
            </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-dark-900/80 border-t border-white/5 text-center">
             <button 
                onClick={onClose}
                className="w-full rounded-xl bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
             >
                {t.gotIt}
             </button>
        </div>

      </div>
    </div>
  );
};
