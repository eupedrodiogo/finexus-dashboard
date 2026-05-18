
import React from 'react';

interface CompactKPIBarProps {
  totals: {
    netIncome: number;
    totalExpenses: number;
    investments: number;
    balance: number;
    monthlyBalance?: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const CompactKPIBar: React.FC<CompactKPIBarProps> = ({ totals }) => {
  const kpis = [
    { label: 'Receita', value: totals.netIncome, icon: 'account_balance', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Despesa', value: totals.totalExpenses, icon: 'shopping_bag', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Investido', value: totals.investments, icon: 'rocket_launch', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Saldo', value: totals.balance, icon: 'wallet', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm min-w-fit shrink-0">
          <div className={`w-6 h-6 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
            <span className="material-symbols-rounded notranslate text-sm icon-filled">{kpi.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
            <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight">{formatCurrency(kpi.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
