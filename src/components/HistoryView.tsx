import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, Clock, Search, Trash2, ArrowUpRight, Zap, Filter } from 'lucide-react';
import { TradeAnalysis } from '../types';

interface HistoryViewProps {
  historyItems: TradeAnalysis[];
  onSelectAnalysis: (item: TradeAnalysis) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onSelectAnalysis,
  onClearHistory,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'long' | 'short'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredHistory = historyItems.filter((item) => {
    const matchesSearch =
      item.direcao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.marketSnapshot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assetName && item.assetName.toLowerCase().includes(searchQuery.toLowerCase()));

    const isLong = item.direcao.toLowerCase().includes('long') || item.direcao.toLowerCase().includes('compra');
    const matchesDirection =
      filterDirection === 'all' ||
      (filterDirection === 'long' && isLong) ||
      (filterDirection === 'short' && !isLong);

    return matchesSearch && matchesDirection;
  });

  const handleConfirmClear = () => {
    onClearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-28 animate-in fade-in duration-200 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Histórico de Análises
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {historyItems.length} {historyItems.length === 1 ? 'análise salva' : 'análises salvas'} no modelo SMC
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Excluir todo o histórico"
            aria-label="Excluir todo o histórico"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Apagar Tudo</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal for Clearing All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-rose-900/50 rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/60">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Apagar Histórico?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja apagar permanentemente todas as <strong className="text-white">{historyItems.length} análises</strong> salvas?
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1e2330] hover:bg-[#282e3f] text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-colors shadow-lg shadow-rose-950/50"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por palavra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131722] border border-[#1e2330] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={filterDirection}
          onChange={(e: any) => setFilterDirection(e.target.value)}
          className="bg-[#131722] border border-[#1e2330] rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
        >
          <option value="all">Todas</option>
          <option value="long">Longs</option>
          <option value="short">Shorts</option>
        </select>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center bg-[#131722] rounded-2xl border border-[#1e2330] space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">Nenhuma análise encontrada</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Gere uma nova análise na aba principal para visualizar seu histórico técnico completo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isLong = item.direcao.toLowerCase().includes('long') || item.direcao.toLowerCase().includes('compra');

            return (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item)}
                className="p-4 rounded-2xl bg-[#131722] hover:bg-[#181e2b] border border-[#1e2330] hover:border-cyan-500/30 transition-all cursor-pointer group active:scale-[0.99] space-y-2.5"
              >
                {/* Item Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 ${
                        isLong
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {item.direcao}
                    </span>

                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-mono">
                      {item.headerInfo || `Ativo: ${item.detectedAsset || item.assetName || 'WINQ26'} | ${item.detectedTimeframe || item.timeframe || '5Min'}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-rose-950/80 border border-[#21262d] hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Excluir este histórico"
                      aria-label="Excluir item do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                {/* Entry & Targets Summary */}
                <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#0d1117] text-[11px] font-mono border border-[#1e2330]">
                  <div>
                    <span className="text-[9px] text-slate-500 block">ENTRADA</span>
                    <span className="text-cyan-400 font-bold">{item.entrada}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">STOP LOSS</span>
                    <span className="text-rose-400 font-bold">{item.stopLoss}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">ALVO TP1</span>
                    <span className="text-emerald-400 font-bold">{item.tp1}</span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.marketSnapshot}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
