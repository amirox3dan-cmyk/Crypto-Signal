
import React, { useMemo, useState } from 'react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart, 
  Bar 
} from 'recharts';
import { CoinData, MarketSignal, SignalType } from '../types';
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Activity, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  coins: CoinData[];
  signals: MarketSignal[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ coins, signals }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(coins[0]?.symbol || 'BTC');

  const selectedCoin = coins.find(c => c.symbol === selectedSymbol) || coins[0];
  const coinSignals = signals.filter(s => s.symbol === selectedSymbol);

  // Generate mock historical data based on current price
  const chartData = useMemo(() => {
    const data = [];
    let currentPrice = selectedCoin?.price || 100;
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const volatility = currentPrice * 0.02; 
      const randomChange = (Math.random() * volatility * 2) - volatility;
      const trend = (selectedCoin.change24h / 24) * (currentPrice / 100);
      const priceAtTime = currentPrice - (randomChange + trend * (24 - i)); 
      
      data.push({
        time: time.getHours() + ':00',
        price: Math.abs(priceAtTime),
        volume: Math.floor(Math.random() * 1000) + 500,
      });
    }
    return data;
  }, [selectedCoin]);

  const high24h = Math.max(...chartData.map(d => d.price));
  const low24h = Math.min(...chartData.map(d => d.price));
  const volume24h = chartData.reduce((acc, curr) => acc + curr.volume, 0);
  const rsi = 45 + Math.random() * 30; 

  return (
    <div className="rounded-2xl border border-white/5 bg-dark-800 p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-brand-400" />
            داشبورد تحلیل تکنیکال
          </h2>
          <p className="text-xs text-gray-400 mt-1">بررسی عمق بازار و تاریخچه قیمت</p>
        </div>
        
        {/* Coin Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
          {coins.map(coin => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedSymbol(coin.symbol)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                selectedSymbol === coin.symbol 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                  : 'bg-dark-900 text-gray-400 hover:bg-dark-700 hover:text-gray-200'
              }`}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-dark-900/50 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-500 block mb-1">سقف ۲۴ ساعته</span>
              <span className="text-sm font-mono font-bold text-success">${high24h.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div className="bg-dark-900/50 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-500 block mb-1">کف ۲۴ ساعته</span>
              <span className="text-sm font-mono font-bold text-danger">${low24h.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
             <div className="bg-dark-900/50 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-500 block mb-1">حجم کل</span>
              <span className="text-sm font-mono font-bold text-white">{(volume24h / 1000).toFixed(1)}M</span>
            </div>
             <div className="bg-dark-900/50 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-500 block mb-1">شاخص RSI</span>
              <span className={`text-sm font-mono font-bold ${rsi > 70 ? 'text-danger' : rsi < 30 ? 'text-success' : 'text-yellow-400'}`}>
                {rsi.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[350px] w-full rounded-xl bg-dark-900/30 border border-white/5 pt-4 relative group">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  tick={{fill: '#6b7280', fontSize: 10}} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="right" 
                  domain={['auto', 'auto']} 
                  tick={{fill: '#6b7280', fontSize: 10}} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="left" 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#13131f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="volume" 
                  barSize={10} 
                  fill="#ffffff10" 
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <span className="text-6xl font-black text-white">{selectedSymbol}</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Coin Stats & Signals */}
        <div className="bg-dark-900/30 rounded-xl p-4 border border-white/5 flex flex-col h-full">
          <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Activity size={14} className="text-brand-500"/>
            وضعیت سیگنال {selectedSymbol}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {coinSignals.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs border border-dashed border-white/10 rounded-lg">
                سیگنال فعالی برای {selectedSymbol} موجود نیست.
              </div>
            ) : (
              coinSignals.map((sig, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  sig.type === SignalType.BUY 
                    ? 'border-success/20 bg-success/5' 
                    : sig.type === SignalType.SELL 
                    ? 'border-danger/20 bg-danger/5' 
                    : 'border-yellow-400/20 bg-yellow-400/5'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      sig.type === SignalType.BUY ? 'bg-success/20 text-success' : sig.type === SignalType.SELL ? 'bg-danger/20 text-danger' : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {sig.type === SignalType.BUY ? 'خرید' : sig.type === SignalType.SELL ? 'فروش' : 'هولد'}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(sig.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mb-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-500">ورود اول</span>
                      <span className="text-xs font-mono text-white">${sig.entryPrices[0]?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-500">هدف اول</span>
                      <span className="text-xs font-mono text-success">${sig.targetPrices[0]?.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-1 border-t border-white/5 pt-2">
                    {sig.reasoning}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
