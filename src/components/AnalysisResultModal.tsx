import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Copy,
  Check,
  MessageSquare,
  Share2,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from 'lucide-react';
import { TradeAnalysis } from '../types';

interface AnalysisResultModalProps {
  isOpen?: boolean;
  analysis: TradeAnalysis | null;
  onClose: () => void;
  onOpenChatWithQuery?: (query: string) => void;
}

export const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
  isOpen = true,
  analysis,
  onClose,
  onOpenChatWithQuery,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSmcDetails, setShowSmcDetails] = useState(true);

  if (!isOpen || !analysis) return null;

  const isLong = analysis.direcao.toLowerCase().includes('long') || analysis.direcao.toLowerCase().includes('compra');

  const headerDisplay = analysis.headerInfo || `Ativo: ${analysis.detectedAsset || analysis.assetName || 'WINQ26'} | ${analysis.detectedTimeframe || analysis.timeframe || '5Min'}`;

  const formattedText = `
*MY TRADE AI - PRO ANALYSES*
━━━━━━━━━━━━━━━━━━━━
${headerDisplay}
Direção: ${analysis.direcao}
Entrada (Entry): ${analysis.entrada}
Stop Loss: ${analysis.stopLoss}
TP1 / TP2 (Alvos): ${analysis.tp1} | ${analysis.tp2}
Confiança do Modelo: ${analysis.confianca}%

Market Snapshot / Estrutura:
${analysis.marketSnapshot}
━━━━━━━━━━━━━━━━━━━━
SMC Engine v3.6 - Quant & Price Action
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#131722] border border-[#21262d] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d1117]/80 sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Resultado da Análise Quant & SMC
              </h3>
              <p className="text-[10px] text-slate-400">
                Engine SMC v3.6
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#161b22] text-slate-400 hover:text-white border border-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 scrollbar-none">
          {/* Header Info Banner (Ativo e Tempo Gráfico Extraídos do Gráfico) */}
          <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-cyan-500/40 flex items-center justify-between shadow-md shadow-cyan-950/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Ativo & Timeframe Detectados
                </span>
                <p className="text-sm font-black text-cyan-300 font-mono tracking-tight">
                  {headerDisplay}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 font-mono shrink-0">
              Verificado
            </span>
          </div>

          {/* Main Direction Banner */}
          <div
            className={`p-4 rounded-2xl border ${
              isLong
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                : 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30'
            } flex items-center justify-between`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isLong ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'
                }`}
              >
                {isLong ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Direção Recomendada
                </span>
                <h2
                  className={`text-2xl font-black tracking-tight ${
                    isLong ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {analysis.direcao}
                </h2>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Confiança
              </span>
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-base font-extrabold text-white">{analysis.confianca}%</span>
              </div>
            </div>
          </div>

          {/* Key Price Levels Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Entrada */}
            <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#1e2330]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Entrada (Entry)
              </span>
              <span className="text-base font-extrabold text-cyan-400 tracking-tight font-mono">
                {analysis.entrada}
              </span>
            </div>

            {/* Stop Loss */}
            <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#1e2330]">
              <span className="text-[10px] font-bold text-rose-400/90 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Stop Loss (Invalidação)
              </span>
              <span className="text-sm font-extrabold text-rose-400 tracking-tight font-mono">
                {analysis.stopLoss}
              </span>
            </div>

            {/* TP1 & TP2 Target */}
            <div className="col-span-2 p-3.5 rounded-xl bg-[#0d1117] border border-[#1e2330] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" />
                  TP1 / TP2 (Alvos de Saída)
                </span>
                <div className="flex items-center space-x-3 text-sm font-extrabold text-emerald-400 font-mono">
                  <span>TP1: {analysis.tp1}</span>
                  <span className="text-slate-600">|</span>
                  <span>TP2: {analysis.tp2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Snapshot / Estrutura */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#1e2330] space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              Market Snapshot / Estrutura
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed tracking-normal font-sans">
              {analysis.marketSnapshot}
            </p>
          </div>

          {/* Detailed SMC Metrics Breakdown Accordion */}
          {analysis.smcAnalysis && (
            <div className="rounded-xl bg-[#0d1117] border border-[#1e2330] overflow-hidden">
              <button
                onClick={() => setShowSmcDetails(!showSmcDetails)}
                className="w-full p-3.5 text-left flex items-center justify-between bg-[#131722]/60 hover:bg-[#131722] transition-colors"
              >
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Métricas Detalhadas de SMC & Price Action
                </span>
                {showSmcDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showSmcDetails && (
                <div className="p-3.5 space-y-2.5 text-xs border-t border-[#1e2330] bg-[#0d1117]">
                  <div className="flex items-start justify-between border-b border-[#181d28] pb-2">
                    <span className="text-slate-400 font-medium">Varredura de Liquidez:</span>
                    <span className="text-slate-200 font-bold text-right max-w-[60%] font-mono">
                      {analysis.smcAnalysis.liquiditySweep}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-[#181d28] pb-2">
                    <span className="text-slate-400 font-medium">Order Block:</span>
                    <span className="text-slate-200 font-bold text-right max-w-[60%] font-mono">
                      {analysis.smcAnalysis.orderBlock}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-[#181d28] pb-2">
                    <span className="text-slate-400 font-medium">Fair Value Gap (FVG):</span>
                    <span className="text-slate-200 font-bold text-right max-w-[60%] font-mono">
                      {analysis.smcAnalysis.fairValueGap}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-[#181d28] pb-2">
                    <span className="text-slate-400 font-medium">Mudança de Estrutura:</span>
                    <span className="text-slate-200 font-bold text-right max-w-[60%] font-mono">
                      {analysis.smcAnalysis.structureShift}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-0.5">
                    <span className="text-slate-400 font-medium">Relação Risco : Retorno:</span>
                    <span className="text-emerald-400 font-extrabold font-mono">
                      {analysis.smcAnalysis.riskReward}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[#1e2330] bg-[#0d1117]/90 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-3 rounded-xl bg-[#161b22] hover:bg-[#1f2633] border border-[#262c3a] text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Sinal</span>
              </>
            )}
          </button>

          {onOpenChatWithQuery && (
            <button
              onClick={() => {
                onClose();
                onOpenChatWithQuery(`Explique como gerenciar o lote e entrada para este sinal de ${analysis.direcao}`);
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Dúvidas no AI Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
