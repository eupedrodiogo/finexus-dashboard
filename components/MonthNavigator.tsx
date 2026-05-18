
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthNavigatorProps {
  currentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
  compact?: boolean;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onPrevious, onNext, compact = false }) => {
  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long' });
  const year = currentMonth.getFullYear();

  return (
    <div className={`flex items-center gap-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm transition-all duration-300 ${compact ? 'p-0.5' : 'p-1'}`}>
      <button
        onClick={onPrevious}
        className={`flex items-center justify-center text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-90 group ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}
        aria-label="Mês anterior"
      >
        <ChevronLeft size={compact ? 18 : 22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <div className={`flex items-center gap-1.5 justify-center bg-white dark:bg-slate-800/50 rounded-xl shadow-inner-sm transition-all duration-300 ${compact ? 'px-3 py-1 min-w-[130px]' : 'px-2 py-1.5 min-w-[140px]'}`}>
        <Calendar size={compact ? 12 : 14} className={`text-indigo-500 ${compact ? 'hidden' : 'hidden sm:block'}`} />
        <div className="flex items-center gap-2 leading-none">
          <span className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-black text-slate-800 dark:text-white capitalize tracking-tight`}>
            {monthName}
          </span>
          <span className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} font-bold text-slate-400 dark:text-slate-400 tracking-wider opacity-80`}>
            {year}
          </span>
        </div>
      </div>

      <button
        onClick={onNext}
        className={`flex items-center justify-center text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-90 group ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}
        aria-label="Próximo mês"
      >
        <ChevronRight size={compact ? 18 : 22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};