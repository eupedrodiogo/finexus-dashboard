
import React from 'react';
import { Zap, Target, ArrowRight } from 'lucide-react';

interface SpendingEfficiencyCardProps {
  efficiency: number; // 0 to 100
  onShowImpactAnalysis?: () => void;
}

export const SpendingEfficiencyCard: React.FC<SpendingEfficiencyCardProps> = ({
  efficiency = 85,
  onShowImpactAnalysis
}) => {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Eficiência de Gasto</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Score de Otimização</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-6xl font-black tracking-tighter">{efficiency}</span>
          <span className="text-xl font-bold opacity-40">/100</span>
        </div>

        <button 
          onClick={onShowImpactAnalysis}
          className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center gap-2 transition-all group border border-white/5"
        >
          <span className="text-xs font-black uppercase tracking-widest">Análise de Impacto</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
