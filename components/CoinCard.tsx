import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CoinData } from '../types';

interface CoinCardProps {
  coin: CoinData;
  onSelect: (coin: CoinData) => void;
}

export const CoinCard: React.FC<CoinCardProps> = ({ coin, onSelect }) => {
  const isPositive = coin.change24h >= 0;

  return (
    <div 
      onClick={() => onSelect(coin)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-dark-800 p-4 transition-all hover:border-brand-500/50 hover:bg-dark-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
           {/* Placeholder for Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-900 font-bold text-gray-300">
            {coin.symbol[0]}
          </div>
          <div>
            <h3 className="font-bold text-white">{coin.name}</h3>
            <span className="text-xs font-medium text-gray-500">{coin.symbol}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(coin.change24h).toFixed(2)}%
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-lg font-mono font-medium text-white">${coin.price.toLocaleString()}</p>
      </div>
    </div>
  );
};