
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export type UserRole = 'admin' | 'support' | 'user';
export type Language = 'fa' | 'en';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: number;
}

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface MarketSignal {
  id: string;
  symbol: string;
  type: SignalType;
  entryPrices: number[]; // Array of 3 entry points
  targetPrices: number[]; // Array of 3 targets
  stopLoss: number;
  leverage: number; // Added leverage field
  reasoning: string;
  confidence: number; // 0-100 (Manual input or default)
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
}

export interface AIAnalysisResponse {
  signals: Array<{
    symbol: string;
    action: string;
    entry: number[];
    target: number[];
    stopLoss: number;
    reason: string;
    confidenceScore: number;
  }>;
}

export interface HistoryPoint {
  time: string;
  price: number;
  volume: number;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin' | 'system' | 'support';
  content: string;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  username: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  timestamp: number;
  messages: TicketMessage[];
}
