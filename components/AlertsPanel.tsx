import React, { useState } from 'react';
import { PriceAlert, CoinData } from '../types';
import { Bell, Trash2, Plus, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: PriceAlert[];
  availableCoins: CoinData[];
  onAddAlert: (symbol: string, price: number, condition: 'ABOVE' | 'BELOW') => void;
  onDeleteAlert: (id: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, availableCoins, onAddAlert, onDeleteAlert }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(availableCoins[0]?.symbol || '');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymbol && targetPrice) {
      onAddAlert(selectedSymbol, parseFloat(targetPrice), condition);
      setTargetPrice('');
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-dark-800 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Bell className="text-brand-400" size={20} />
          هشدارهای قیمت
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-400"
        >
          {isAdding ? <X size={14} /> : <Plus size={14} />}
          {isAdding ? 'انصراف' : 'جدید'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl bg-dark-900 p-4 border border-white/5 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">انتخاب ارز</label>
              <select 
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {availableCoins.map(coin => (
                  <option key={coin.symbol} value={coin.symbol}>{coin.name} ({coin.symbol})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">شرط</label>
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                  className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="ABOVE">بیشتر از</option>
                  <option value="BELOW">کمتر از</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">قیمت ($)</label>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-white/10 bg-dark-800 p-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <button type="submit" className="mt-2 w-full rounded-lg bg-brand-500 p-2 text-sm font-bold text-white hover:bg-brand-400">
              ثبت هشدار
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            هیچ هشداری ثبت نشده است.
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="group flex items-center justify-between rounded-xl border border-white/5 bg-dark-900/50 p-3 hover:border-white/10">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${alert.isActive ? 'bg-success animate-pulse' : 'bg-gray-600'}`}></div>
                <div>
                  <div className="font-bold text-white text-sm">{alert.symbol}</div>
                  <div className="text-xs text-gray-400">
                    {alert.condition === 'ABOVE' ? 'بالای' : 'پایین'} ${alert.targetPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDeleteAlert(alert.id)}
                className="rounded-lg p-2 text-gray-500 opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};