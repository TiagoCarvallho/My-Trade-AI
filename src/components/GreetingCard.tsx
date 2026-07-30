import React from 'react';
import { Award } from 'lucide-react';

interface GreetingCardProps {
  userName?: string;
  stats?: {
    today: number;
    week: number;
    total: number;
  };
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  userName = 'Tiago',
  stats = { today: 1, week: 1, total: 1 },
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="px-4 pt-5 pb-2">
      {/* Top Main Card */}
      <div className="p-4 rounded-2xl bg-[#131722] border border-[#1e2330] shadow-xl relative overflow-hidden space-y-3.5">
        {/* Subtle background glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between px-0.5">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {getGreeting()}, <span className="text-white">{userName}</span>
          </h1>
        </div>

        {/* Statistics Box - expanded closer to outer balloon edges */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-[#1e2330] space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 px-0.5">
            <Award className="w-4 h-4 text-cyan-400" />
            Histórico de Análises
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="py-3 px-2 rounded-xl bg-[#131722] border border-[#1e2330] transition-all hover:border-slate-700">
              <span className="text-sm font-black text-white block">{stats.today}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block tracking-wider">HOJE</span>
            </div>
            <div className="py-3 px-2 rounded-xl bg-[#131722] border border-[#1e2330] transition-all hover:border-slate-700">
              <span className="text-sm font-black text-white block">{stats.week}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block tracking-wider">SEMANA</span>
            </div>
            <div className="py-3 px-2 rounded-xl bg-[#131722] border border-[#1e2330] transition-all hover:border-slate-700">
              <span className="text-sm font-black text-cyan-400 block">{stats.total}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block tracking-wider">TOTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Subtitle */}
      <div className="mt-6 mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400/90 pl-1">
          INICIAR ANÁLISE
        </h3>
      </div>
    </div>
  );
};
