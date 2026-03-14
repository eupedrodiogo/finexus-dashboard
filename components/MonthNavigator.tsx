import React from 'react';

interface MonthNavigatorProps {
  currentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onPrevious, onNext }) => {
  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long' });
  const year = currentMonth.getFullYear();

  return (
    <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <button
        onClick={onPrevious}
        className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 group"
        aria-label="Mês anterior"
      >
        <span className="material-symbols-rounded notranslate group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
      </button>
      
      <div className="px-6 flex flex-col items-center min-w-[180px]">
        <span className="text-base font-black text-slate-800 dark:text-white capitalize leading-tight">
          {monthName}
        </span>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">
          {year}
        </span>
      </div>

      <button
        onClick={onNext}
        className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 group"
        aria-label="Próximo mês"
      >
        <span className="material-symbols-rounded notranslate group-hover:translate-x-0.5 transition-transform">chevron_right</span>
      </button>
    </div>
  );
};