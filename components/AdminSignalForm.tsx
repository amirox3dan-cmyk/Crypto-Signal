
import React, { useState, useEffect } from 'react';
import { SignalType, MarketSignal, Language } from '../types';
import { X, Plus, Save, ShieldAlert, Target, ArrowDownToLine, Percent, Calculator, Zap, Trash2, AlertTriangle, Wand2, Layers, ArrowDown, ArrowUp } from 'lucide-react';
import { translations } from '../utils/translations';

interface AdminSignalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signal: MarketSignal) => void;
  onDelete?: (id: string) => void;
  initialData?: MarketSignal | null;
  language: Language;
}

export const AdminSignalForm: React.FC<AdminSignalFormProps> = ({ isOpen, onClose, onSave, onDelete, initialData, language }) => {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<SignalType>(SignalType.BUY);
  const [leverage, setLeverage] = useState<number>(10);
  
  // 3 Entry Points
  const [entry1, setEntry1] = useState('');
  const [entry2, setEntry2] = useState('');
  const [entry3, setEntry3] = useState('');

  // Martingale Settings
  const [martingalePercent, setMartingalePercent] = useState('20');

  // 3 Targets (Percentages)
  const [targetPercent1, setTargetPercent1] = useState('');
  const [targetPercent2, setTargetPercent2] = useState('');
  const [targetPercent3, setTargetPercent3] = useState('');

  const [stopLoss, setStopLoss] = useState('');
  const [reasoning, setReasoning] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const leverageOptions = [5, 10, 15, 20, 25, 50, 100];
  const t = translations[language];

  // Helper to calculate price based on percentage
  const calculatePrice = (basePrice: number, percent: number, isTarget: boolean = true) => {
    if (!basePrice || isNaN(basePrice) || !percent || isNaN(percent)) return 0;
    
    // For Targets: BUY = Price goes UP (+), SELL = Price goes DOWN (-)
    // For Martingale Entries: BUY = Price goes DOWN (-), SELL = Price goes UP (+)
    
    let isAdding = true;
    
    if (isTarget) {
        isAdding = type === SignalType.BUY;
    } else {
        // Martingale logic: Average down (Buy Lower) or Average up (Sell Higher)
        isAdding = type === SignalType.SELL;
    }

    const change = basePrice * (percent / 100);
    return isAdding ? basePrice + change : basePrice - change;
  };

  // Reset or Populate form
  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (initialData) {
        setSymbol(initialData.symbol);
        setType(initialData.type);
        setLeverage(initialData.leverage || 10);
        
        setEntry1(initialData.entryPrices[0]?.toString() || '');
        setEntry2(initialData.entryPrices[1]?.toString() || '');
        setEntry3(initialData.entryPrices[2]?.toString() || '');

        const base = initialData.entryPrices[0];
        if (base) {
           const getPercent = (target: number) => {
             if (!target) return '';
             const diff = Math.abs(target - base);
             const pct = (diff / base) * 100;
             return (Math.round(pct * 100) / 100).toString();
           };
           setTargetPercent1(getPercent(initialData.targetPrices[0]));
           setTargetPercent2(getPercent(initialData.targetPrices[1]));
           setTargetPercent3(getPercent(initialData.targetPrices[2]));
        }

        setStopLoss(initialData.stopLoss.toString());
        setReasoning(initialData.reasoning);
      } else {
        setSymbol('');
        setType(SignalType.BUY);
        setLeverage(10);
        setEntry1(''); setEntry2(''); setEntry3('');
        setMartingalePercent('20');
        setTargetPercent1(''); setTargetPercent2(''); setTargetPercent3('');
        setStopLoss('');
        setReasoning('');
      }
    }
  }, [isOpen, initialData]);

  // Auto-Calculate Martingale Entries based on Entry 1
  useEffect(() => {
    // Always auto-calculate if we have Entry 1 and Martingale Percent, unless specifically editing an existing signal where values might differ
    // But user requested "auto calc", so we enforce it.
    const p1 = parseFloat(entry1);
    const mPercent = parseFloat(martingalePercent);

    if (!isNaN(p1) && !isNaN(mPercent) && p1 > 0) {
        // Calculate Entry 2 based on Entry 1
        const p2 = calculatePrice(p1, mPercent, false); // false = martingale logic
        
        // Calculate Entry 3 based on Entry 2 (Compounding the step)
        const p3 = calculatePrice(p2, mPercent, false);

        // Format appropriately
        const formatPrice = (price: number) => {
            if (price > 1000) return price.toFixed(0);
            if (price > 10) return price.toFixed(2);
            if (price > 0.1) return price.toFixed(4);
            return price.toFixed(6);
        };

        setEntry2(formatPrice(p2));
        setEntry3(formatPrice(p3));
    }
  }, [entry1, martingalePercent, type]);

  // Auto-Calculate Stop Loss (10% margin from the 3rd entry)
  useEffect(() => {
    const p3 = parseFloat(entry3);
    
    if (!isNaN(p3) && p3 > 0) {
        // Stop Loss Logic:
        // If BUY: SL is Below Entry 3 (-10%)
        // If SELL: SL is Above Entry 3 (+10%)
        
        const isLong = type === SignalType.BUY;
        const slPercent = 10; // Fixed 10% margin as requested
        
        const calculatedSL = isLong 
            ? p3 * (1 - slPercent / 100) 
            : p3 * (1 + slPercent / 100);

        // Format precision
        let formatted = '';
        if (calculatedSL > 1000) formatted = calculatedSL.toFixed(0);
        else if (calculatedSL > 10) formatted = calculatedSL.toFixed(2);
        else if (calculatedSL > 0.1) formatted = calculatedSL.toFixed(4);
        else formatted = calculatedSL.toFixed(6);

        setStopLoss(formatted);
    }
  }, [entry3, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const e1 = parseFloat(entry1);
    const entries = [e1, parseFloat(entry2), parseFloat(entry3)].filter(n => !isNaN(n));
    
    const t1Percent = parseFloat(targetPercent1);
    const t2Percent = parseFloat(targetPercent2);
    const t3Percent = parseFloat(targetPercent3);

    const targets = [];
    if (!isNaN(t1Percent)) targets.push(calculatePrice(e1, t1Percent, true));
    if (!isNaN(t2Percent)) targets.push(calculatePrice(e1, t2Percent, true));
    if (!isNaN(t3Percent)) targets.push(calculatePrice(e1, t3Percent, true));

    if (!symbol || entries.length === 0 || targets.length === 0 || !stopLoss) {
      alert(t.validationError);
      return;
    }

    const newSignal: MarketSignal = {
      id: initialData ? initialData.id : Date.now().toString(),
      symbol: symbol.toUpperCase(),
      type,
      leverage,
      entryPrices: entries,
      targetPrices: targets.map(t => parseFloat(t.toFixed(6))), 
      stopLoss: parseFloat(stopLoss),
      reasoning: reasoning || `استراتژی مارتینگل (${martingalePercent}٪ پله‌ای)`,
      confidence: initialData ? initialData.confidence : 100,
      timestamp: initialData ? initialData.timestamp : Date.now(),
    };

    onSave(newSignal);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (initialData && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
    }
  };

  const baseEntry = parseFloat(entry1) || 0;
  
  // Calculate preview values for targets
  const t1Price = calculatePrice(baseEntry, parseFloat(targetPercent1), true);
  const t2Price = calculatePrice(baseEntry, parseFloat(targetPercent2), true);
  const t3Price = calculatePrice(baseEntry, parseFloat(targetPercent3), true);

  const martingaleDesc = type === SignalType.BUY 
    ? t.martingaleBuyDesc.replace('{percent}', martingalePercent)
    : t.martingaleSellDesc.replace('{percent}', martingalePercent);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-dark-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 relative">
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
             <div className="absolute inset-0 z-[110] flex items-center justify-center bg-dark-900/95 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-dark-800 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-200 border-t-4 border-t-danger">
                    <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 text-danger ring-4 ring-danger/5">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{t.deleteSignal}</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        {t.deleteConfirm} <span className="text-white font-bold mx-1">{initialData?.symbol}</span>
                        <br/>
                        {/* Irreversible note can be added if needed */}
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-3 rounded-xl bg-dark-700 text-gray-300 font-bold hover:bg-dark-600 hover:text-white transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3 rounded-xl bg-danger text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-danger/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            {t.confirmDelete}
                        </button>
                    </div>
                </div>
             </div>
        )}

        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="text-brand-500" />
            {initialData ? t.editSignal : t.registerSignal}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs text-gray-400">{t.symbolName}</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC..."
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none font-mono uppercase"
              />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs text-gray-400">{t.positionType}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType(SignalType.BUY)}
                  className={`flex-1 rounded-lg py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${type === SignalType.BUY ? 'bg-success text-dark-900' : 'bg-dark-900 text-gray-400 border border-white/10'}`}
                >
                  {type === SignalType.BUY && <ArrowUp size={16} />}
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setType(SignalType.SELL)}
                  className={`flex-1 rounded-lg py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${type === SignalType.SELL ? 'bg-danger text-white' : 'bg-dark-900 text-gray-400 border border-white/10'}`}
                >
                   {type === SignalType.SELL && <ArrowDown size={16} />}
                  Short
                </button>
              </div>
            </div>
            <div className="md:col-span-4">
               <label className="mb-1 block text-xs text-gray-400">{t.leverage}</label>
               <div className="flex rounded-lg bg-dark-900 p-1 border border-white/10 overflow-hidden relative">
                  <select 
                     value={leverage}
                     onChange={(e) => setLeverage(Number(e.target.value))}
                     className="w-full bg-transparent text-white text-sm font-bold p-2 focus:outline-none text-center appearance-none cursor-pointer z-10"
                  >
                     {leverageOptions.map(lev => (
                        <option key={lev} value={lev} className="bg-dark-800 text-white">{lev}x</option>
                     ))}
                  </select>
                  <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3 pointer-events-none text-brand-500">
                    <Zap size={14} className="fill-brand-500/20" />
                  </div>
               </div>
            </div>
          </div>

          {/* Entry Points Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             {/* Main Entry */}
             <div className="md:col-span-5">
                <div className="bg-dark-900/80 p-4 rounded-xl border border-brand-500/30 h-full">
                    <label className="text-xs font-bold text-brand-400 mb-2 flex items-center gap-1">
                        <ArrowDownToLine size={14} />
                        {t.entryPoint1}
                    </label>
                    <input 
                        type="number" 
                        placeholder="Entry Price" 
                        value={entry1} 
                        onChange={e => setEntry1(e.target.value)} 
                        className="w-full rounded-lg border border-white/10 bg-dark-800 p-3 text-lg font-bold text-white focus:border-brand-500 focus:outline-none font-mono" 
                    />
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{t.stepDistance}</span>
                        <div className="relative w-20">
                            <input 
                                type="number" 
                                value={martingalePercent} 
                                onChange={(e) => setMartingalePercent(e.target.value)} 
                                className="w-full bg-dark-800 text-white text-xs font-bold text-center rounded py-1 focus:outline-none border border-white/10 focus:border-brand-500" 
                            />
                            <span className="absolute right-1 top-1 text-[10px] text-gray-500">%</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Martingale Steps */}
             <div className="md:col-span-7">
                <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 h-full relative overflow-hidden">
                    <div className="absolute -right-5 -top-5 text-white/5">
                        <Layers size={80} />
                    </div>
                    <label className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 relative z-10">
                        <Calculator size={14} />
                        {t.martingaleSteps}
                    </label>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">{t.step2}</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={entry2} 
                                    readOnly
                                    className="w-full rounded-lg border border-white/5 bg-dark-800/50 p-2 pl-8 text-sm text-gray-300 font-mono cursor-not-allowed" 
                                />
                                <Wand2 size={12} className="absolute left-2 top-2.5 text-brand-500/50" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">{t.step3}</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={entry3} 
                                    readOnly
                                    className="w-full rounded-lg border border-white/5 bg-dark-800/50 p-2 pl-8 text-sm text-gray-300 font-mono cursor-not-allowed" 
                                />
                                <Wand2 size={12} className="absolute left-2 top-2.5 text-brand-500/50" />
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2 text-center">
                        {martingaleDesc}
                    </p>
                </div>
             </div>
          </div>

          {/* Targets (Percentage) */}
          <div className="rounded-xl bg-dark-900/50 p-4 border border-white/5">
            <h3 className="text-sm font-bold text-success mb-3 flex items-center gap-2">
              <Target size={16} />
              {t.targetsPercent}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <input type="number" placeholder="TP 1" value={targetPercent1} onChange={e => setTargetPercent1(e.target.value)} className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono pl-8" />
                <Percent className="absolute left-2 top-2.5 text-gray-500" size={14} />
              </div>
              <div className="relative">
                <input type="number" placeholder="TP 2" value={targetPercent2} onChange={e => setTargetPercent2(e.target.value)} className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono pl-8" />
                <Percent className="absolute left-2 top-2.5 text-gray-500" size={14} />
              </div>
              <div className="relative">
                <input type="number" placeholder="TP 3" value={targetPercent3} onChange={e => setTargetPercent3(e.target.value)} className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono pl-8" />
                <Percent className="absolute left-2 top-2.5 text-gray-500" size={14} />
              </div>
            </div>
          </div>

          {/* Stop Loss & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-danger flex items-center gap-1">
                <ShieldAlert size={12} />
                {t.stopLossDesc}
              </label>
              <div className="relative">
                <input
                    type="number"
                    value={stopLoss}
                    readOnly
                    className="w-full rounded-lg border border-danger/30 bg-danger/5 p-3 pl-9 text-danger font-bold focus:border-danger focus:outline-none font-mono cursor-not-allowed"
                />
                <div className="absolute left-3 top-3.5 text-danger/50 pointer-events-none">
                    <Calculator size={14} />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-gray-400">{t.descriptionOptional}</label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={1}
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Confirmation Preview */}
          {baseEntry > 0 && (
             <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Calculator size={16} className="text-brand-400" />
                  {t.previewTargets}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                   {(t1Price > 0) && (
                     <div className="bg-dark-900/50 p-2 rounded border border-white/5">
                        <span className="text-gray-500 block mb-1">{t.target1} ({targetPercent1}%)</span>
                        <span className="text-success text-sm font-bold">${t1Price.toLocaleString()}</span>
                     </div>
                   )}
                   {(t2Price > 0) && (
                     <div className="bg-dark-900/50 p-2 rounded border border-white/5">
                        <span className="text-gray-500 block mb-1">{t.target2} ({targetPercent2}%)</span>
                        <span className="text-success text-sm font-bold">${t2Price.toLocaleString()}</span>
                     </div>
                   )}
                   {(t3Price > 0) && (
                     <div className="bg-dark-900/50 p-2 rounded border border-white/5">
                        <span className="text-gray-500 block mb-1">{t.target3} ({targetPercent3}%)</span>
                        <span className="text-success text-sm font-bold">${t3Price.toLocaleString()}</span>
                     </div>
                   )}
                </div>
             </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {initialData && onDelete ? (
                <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 font-bold text-danger transition-all hover:bg-danger hover:text-white border border-danger/20 cursor-pointer z-50"
                >
                    <Trash2 size={18} />
                    {t.delete}
                </button>
            ) : <div></div>}
            
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 font-bold text-white transition-all hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/20"
            >
              <Save size={18} />
              {initialData ? t.saveChanges : t.register}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
