import React from 'react';
import { TrendingUp, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onRestart?: () => void;
  onOpenNotifications?: () => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRestart }) => {
  const handleRestart = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing session storage:', e);
    }
    if (onRestart) {
      onRestart();
    }
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#1e2330] px-4 py-3 flex items-center justify-between">
      {/* Left Group: Brand Title */}
      <div className="flex items-center space-x-2.5">
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center p-[1px] shadow-lg shadow-cyan-950/40 shrink-0">
          <div className="w-full h-full bg-[#0d1117] rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-tight text-base">My Trade AI</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500 text-slate-950 rounded-full tracking-wider shadow-sm shadow-cyan-500/20">
              PRO
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              Quant & SMC Engine v3.6
            </span>
          </div>
        </div>
      </div>

      {/* Right Group: Reiniciar Button */}
      <button
        onClick={handleRestart}
        title="Reiniciar aplicativo e reconectar API"
        aria-label="Reiniciar aplicativo"
        className="w-9 h-9 rounded-xl bg-[#161b22] hover:bg-[#1f2633] active:bg-[#0d1117] border border-[#262c3a] hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all shadow-sm shrink-0"
      >
        <RotateCcw className="w-4 h-4 text-cyan-400" />
      </button>
    </header>
  );
};
