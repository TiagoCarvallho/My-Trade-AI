export type TradeDirection = 'Long (Compra)' | 'Short (Venda)';

export interface SMCDetails {
  liquiditySweep: string;
  orderBlock: string;
  fairValueGap: string;
  structureShift: string;
  riskReward: string;
}

export interface TradeAnalysis {
  id: string;
  timestamp: string;
  direcao: TradeDirection;
  entrada: string;
  stopLoss: string;
  tp1: string;
  tp2: string;
  confianca: number; // e.g. 82%
  marketSnapshot: string;
  smcAnalysis?: SMCDetails;
  imageUrl?: string;
  assetName?: string;
  timeframe?: string;
  detectedAsset?: string;
  detectedTimeframe?: string;
  headerInfo?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface SampleChart {
  id: string;
  title: string;
  asset: string;
  timeframe: string;
  description: string;
  dataUrl: string;
}
