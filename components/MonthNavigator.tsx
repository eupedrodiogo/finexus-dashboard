import React from 'react';

interface MonthNavigatorProps {
  currentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onPrevious, onNext }) => {
  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={onPrevious}
        className="h-10 w-10 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-light-subtle dark:text-dark-subtle rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Mês anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </button>
      <span className="text-xl font-semibold text-light-text dark:text-dark-text w-48 text-center capitalize">
        {monthName}
      </span>
      <button
        onClick={onNext}
        className="h-10 w-10 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-light-subtle dark:text-dark-subtle rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Próximo mês"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
};