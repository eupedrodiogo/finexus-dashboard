
import React from 'react';
import { TrendingUp, Wallet } from 'lucide-react';

interface SavingsCapacityCardProps {
  grossIncome: number;
  totalOut: number;
}

export const SavingsCapacityCard: React.FC<SavingsCapacityCardProps> = ({
  grossIncome,
  totalOut
}) => {
  const capacity = grossIncome - totalOut;
  const capacityPercent = grossIncome > 0 ? (capacity / grossIncome) * 100 : 0;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Capacidade de Poupança
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Margem Líquida Mensal</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <TrendingUp size={24} />
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
          {formatCurrency(capacity)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-500">{capacityPercent.toFixed(1)}% da receita bruta</span>
        </div>
      </div>

      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${Math.max(0, Math.min(100, capacityPercent))}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-3">
        <span className="text-[9px] font-black text-slate-400 uppercase">Receita: {formatCurrency(grossIncome)}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase">Gastos: {formatCurrency(totalOut)}</span>
      </div>
    </div>
  );
};
