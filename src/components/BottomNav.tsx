import React from 'react';
import { BarChart3, Clock, MessageSquare, User } from 'lucide-react';

export type TabType = 'analise' | 'historico' | 'chat' | 'perfil';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, historyCount }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d1117]/95 backdrop-blur-lg border-t border-[#1e2330] px-3 py-2 flex items-center justify-around max-w-lg mx-auto shadow-2xl">
      {/* Tab 1: Análise */}
      <button
        onClick={() => setActiveTab('analise')}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'analise'
            ? 'bg-[#162232] text-cyan-400 font-bold border border-cyan-800/40 shadow-md shadow-cyan-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        id="nav-tab-analise"
      >
        <BarChart3 className="w-5 h-5" />
        {activeTab === 'analise' && <span className="text-xs font-bold tracking-tight">Análise</span>}
      </button>

      {/* Tab 2: Histórico */}
      <button
        onClick={() => setActiveTab('historico')}
        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'historico'
            ? 'bg-[#162232] text-cyan-400 font-bold border border-cyan-800/40 shadow-md shadow-cyan-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        id="nav-tab-historico"
      >
        <div className="relative">
          <Clock className="w-5 h-5" />
          {historyCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </div>
        {activeTab === 'historico' && <span className="text-xs font-bold tracking-tight">Histórico</span>}
      </button>

      {/* Tab 3: AI Chat */}
      <button
        onClick={() => setActiveTab('chat')}
        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'chat'
            ? 'bg-[#162232] text-cyan-400 font-bold border border-cyan-800/40 shadow-md shadow-cyan-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        id="nav-tab-chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black uppercase">
            AI
          </span>
        </div>
        {activeTab === 'chat' && <span className="text-xs font-bold tracking-tight">AI Chat</span>}
      </button>

      {/* Tab 4: Perfil */}
      <button
        onClick={() => setActiveTab('perfil')}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'perfil'
            ? 'bg-[#162232] text-cyan-400 font-bold border border-cyan-800/40 shadow-md shadow-cyan-950/50'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        id="nav-tab-perfil"
      >
        <User className="w-5 h-5" />
        {activeTab === 'perfil' && <span className="text-xs font-bold tracking-tight">Perfil</span>}
      </button>
    </nav>
  );
};
