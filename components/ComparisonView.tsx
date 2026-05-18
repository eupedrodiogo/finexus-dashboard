
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ComparisonViewProps {
  currentMonth: string;
  previousMonth: string;
  currentData: { income: number; expenses: number; investments: number };
  previousData: { income: number; expenses: number; investments: number };
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentMonth,
  previousMonth,
  currentData,
  previousData
}) => {
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  
  const calculateVar = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const metrics = [
    { label: 'Receita Líquida', curr: currentData.income, prev: previousData.income, inverse: false },
    { label: 'Despesas Totais', curr: currentData.expenses, prev: previousData.expenses, inverse: true },
    { label: 'Investimentos', curr: currentData.investments, prev: previousData.investments, inverse: false },
  ];

  return (
    <div className="glass-card rounded-[2.5rem] p-8">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span className="w-1.5 h-8 bg-amber-500 rounded-full"></span>
          Comparativo Mensal
        </h3>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{previousMonth}</span>
          <ArrowUpRight size={14} className="text-slate-300" />
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{currentMonth}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {metrics.map((m, i) => {
          const variance = calculateVar(m.curr, m.prev);
          const isPositive = variance > 0;
          const isGood = m.inverse ? !isPositive : isPositive;

          return (
            <div key={i} className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{m.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(m.curr)}</span>
                <div className={`flex items-center gap-0.5 text-[10px] font-black ${variance === 0 ? 'text-slate-400' : isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {variance === 0 ? <Minus size={10} /> : isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(variance).toFixed(1)}%
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-1000`}
                  style={{ width: `${Math.min(100, Math.max(10, (m.curr / (m.curr + m.prev)) * 100))}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400">Anterior: {formatCurrency(m.prev)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
