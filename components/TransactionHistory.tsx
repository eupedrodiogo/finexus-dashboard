
import React, { useState, useMemo } from 'react';

export interface Transaction {
  id: string;
  name: string;
  value: number;
  category: string;
  type: 'income' | 'expense' | 'investment';
  date?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'investment'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (filterType === 'all') return true;
        return tx.type === filterType;
      })
      .filter(tx => {
        const term = searchTerm.toLowerCase();
        if (term === '') return true;
        return (
          tx.name.toLowerCase().includes(term) ||
          tx.category.toLowerCase().includes(term)
        );
      });
  }, [transactions, searchTerm, filterType]);

  const getFilterButtonClass = (type: 'all' | 'income' | 'expense' | 'investment') => {
    const baseClass = "px-4 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-700 focus:ring-indigo-500";
    if (filterType === type) {
      return `${baseClass} bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm`;
    }
    return `${baseClass} text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60`;
  }

  const typeConfig = {
    income: {
      sign: '+ ',
      color: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
    },
    expense: {
      sign: '- ',
      color: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
    },
    investment: {
      sign: '- ',
      color: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
    }
  }

  return (
    <div className="p-4 rounded-xl shadow-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border">
      <h2 className="text-lg font-bold text-center text-light-text dark:text-dark-text">
        Histórico de Transações do Mês
      </h2>

      <div className="mt-4 sticky top-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm py-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-slate-50 dark:bg-slate-900/50 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Buscar transações"
            />
          </div>
          <div className="flex-shrink-0 flex items-center justify-center flex-wrap bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full gap-1">
            <button onClick={() => setFilterType('all')} className={getFilterButtonClass('all')}>Todos</button>
            <button onClick={() => setFilterType('income')} className={getFilterButtonClass('income')}>Receitas</button>
            <button onClick={() => setFilterType('expense')} className={getFilterButtonClass('expense')}>Despesas</button>
            <button onClick={() => setFilterType('investment')} className={getFilterButtonClass('investment')}>Investim.</button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-light-subtle dark:text-dark-subtle">
            <p>Nenhuma transação registrada neste mês.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-light-subtle dark:text-dark-subtle">
            <p>Nenhuma transação encontrada com os filtros atuais.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredTransactions.map(tx => {
              const config = typeConfig[tx.type];
              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-all hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${config.iconBg}`}>
                      {config.icon}
                    </span>
                    <div>
                      <p className="font-medium capitalize text-light-text dark:text-dark-text">{tx.name}</p>
                      <div className="flex items-center gap-2 text-xs text-light-subtle dark:text-dark-subtle">
                        <span>{tx.category}</span>
                        {tx.date && (
                          <>
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold text-md ${config.color}`}>
                    {config.sign}
                    {formatCurrency(tx.value)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};
