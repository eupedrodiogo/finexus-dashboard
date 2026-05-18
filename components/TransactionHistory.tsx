
import React, { useState, useMemo } from 'react';
import { Search, ArrowUpCircle, ArrowDownCircle, TrendingUp, Pencil, X, ChevronDown, ChevronUp, ReceiptText } from 'lucide-react';

export interface Transaction {
  id: string;
  name: string;
  value: number;
  category: string;
  type: 'income' | 'expense' | 'investment';
  date?: string;
  catKey?: string;
  subId?: string;
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  accountId?: string;
  isRecurring?: boolean;
  recurrenceLimit?: number;
  installments?: { current: number; total: number };
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  onEditTransaction?: (tx: Transaction) => void;
  selectedTransactionId?: string | null;
  onSelectTransaction?: (tx: Transaction | null) => void;
  initialBalance?: number;
  finalBalance?: number;
  onUpdateInitialBalance?: (value: number) => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d?: string) => {
  if (!d) return '';
  const [, month, day] = d.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${day} ${months[parseInt(month, 10) - 1]}`;
};

const TYPE_CONFIG = {
  income: {
    label: 'Receita',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    icon: <ArrowUpCircle size={15} className="text-emerald-500" />,
    sign: '+',
    summaryBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30',
    summaryLabel: 'text-emerald-600 dark:text-emerald-400',
  },
  expense: {
    label: 'Despesa',
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    icon: <ArrowDownCircle size={15} className="text-rose-500" />,
    sign: '-',
    summaryBg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200/50 dark:border-rose-800/30',
    summaryLabel: 'text-rose-600 dark:text-rose-400',
  },
  investment: {
    label: 'Investimento',
    color: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    icon: <TrendingUp size={15} className="text-indigo-500" />,
    sign: '-',
    summaryBg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200/50 dark:border-indigo-800/30',
    summaryLabel: 'text-indigo-600 dark:text-indigo-400',
  },
};

type FilterType = 'all' | 'income' | 'expense' | 'investment';
type SortType = 'date' | 'value';

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onEditTransaction,
  selectedTransactionId,
  onSelectTransaction,
  initialBalance = 0,
  finalBalance = 0,
  onUpdateInitialBalance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [collapsed, setCollapsed] = useState(false);
  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [tempInitial, setTempInitial] = useState(initialBalance);

  // Sincronizar tempInitial quando initialBalance mudar (ex: troca de mês)
  React.useEffect(() => {
    setTempInitial(initialBalance);
  }, [initialBalance]);

  const totals = useMemo(() => {
    const t = { income: 0, expense: 0, investment: 0 };
    transactions.forEach(tx => { t[tx.type] += tx.value; });
    return t;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return transactions
      .filter(tx => filterType === 'all' || tx.type === filterType)
      .filter(tx =>
        term === '' ||
        tx.name.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (sortBy === 'date') {
          const da = a.date ?? '0000-00-00';
          const db = b.date ?? '0000-00-00';
          return db.localeCompare(da);
        }
        return b.value - a.value;
      });
  }, [transactions, searchTerm, filterType, sortBy]);

  const grouped = useMemo(() => {
    if (sortBy !== 'date') return null;
    const map = new Map<string, Transaction[]>();
    filteredTransactions.forEach(tx => {
      const key = tx.date ?? 'Sem data';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });
    return Array.from(map.entries());
  }, [filteredTransactions, sortBy]);

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: transactions.length },
    { key: 'income', label: 'Receitas', count: transactions.filter(t => t.type === 'income').length },
    { key: 'expense', label: 'Despesas', count: transactions.filter(t => t.type === 'expense').length },
    { key: 'investment', label: 'Invest.', count: transactions.filter(t => t.type === 'investment').length },
  ];

  const canEdit = !!(onSelectTransaction || onEditTransaction);

  const handleSelect = (tx: Transaction) => {
    if (onSelectTransaction) {
      onSelectTransaction(selectedTransactionId === tx.id ? null : tx);
    } else if (onEditTransaction) {
      onEditTransaction(tx);
    }
  };

  const renderTxItem = (tx: Transaction) => {
    const cfg = TYPE_CONFIG[tx.type];
    const isSelected = selectedTransactionId === tx.id;

    return (
      <div
        key={tx.id}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isSelected
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/40 shadow-sm shadow-amber-100 dark:shadow-amber-900/20'
            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold truncate leading-tight ${
            isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'
          }`}>
            {tx.name}
          </p>
          <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{tx.category}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="text-right">
            <p className={`text-xs font-black ${cfg.color}`}>
              {cfg.sign} {fmt(tx.value)}
            </p>
            {tx.date && (
              <p className="text-[10px] text-slate-400 font-medium">{fmtDate(tx.date)}</p>
            )}
          </div>
          {isSelected && onSelectTransaction && (
            <button
              onClick={e => { e.stopPropagation(); onSelectTransaction(null); }}
              className="p-1 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
            >
              <X size={12} />
            </button>
          )}
          {!isSelected && canEdit && (
            <button
              onClick={() => handleSelect(tx)}
              className="p-1 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Pencil size={12} />
            </button>
          )}
          {!isSelected && !canEdit && <div className="w-6" />}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col relative">
      
      {/* ── SEÇÃO STICKY: MÁSCARA + CABEÇALHO ── */}
      <div className="sticky top-[72px] z-30 transition-all duration-300 bg-slate-50 dark:bg-slate-950">
        
        {/* Máscara de Conteúdo (Esconde os dados que sobem) */}
        <div className="h-3 w-full" />
        
        {/* Cabeçalho do Card */}
        <div className="bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 rounded-t-2xl shadow-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-4 pt-3 pb-2 cursor-pointer select-none"
            onClick={() => setCollapsed(c => !c)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shadow-inner flex-shrink-0">
                <ReceiptText size={14} className="text-indigo-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none truncate">
                  Lançamentos
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                    {transactions.length} registros
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-2">
               <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="animate-fadeIn">
              {/* Balances Row - Strategic Position for Space */}
              <div className="px-4 pb-3 flex items-center gap-4">
                <div 
                  className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  onClick={(e) => { e.stopPropagation(); if (!isEditingInitial) setIsEditingInitial(true); }}
                >
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Saldo Inicial</p>
                  {isEditingInitial ? (
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      value={tempInitial}
                      onChange={(e) => setTempInitial(parseFloat(e.target.value) || 0)}
                      onBlur={() => {
                        setIsEditingInitial(false);
                        if (onUpdateInitialBalance && tempInitial !== initialBalance) {
                          onUpdateInitialBalance(tempInitial);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-b border-indigo-500 font-black text-slate-800 dark:text-white focus:outline-none text-xs"
                    />
                  ) : (
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                      {fmt(initialBalance)}
                    </p>
                  )}
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Saldo Final</p>
                  <p className={`text-xs font-black ${finalBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {fmt(finalBalance)}
                  </p>
                </div>
              </div>

              {/* ── Totais (Cards compactos) ── */}
              {transactions.length > 0 && (
                <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                  {(['income', 'expense', 'investment'] as const).map(type => {
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setFilterType(prev => prev === type ? 'all' : type)}
                        className={`rounded-xl p-2 border text-center transition-all ${cfg.summaryBg} ${
                          filterType === type ? 'ring-2 ring-indigo-400 ring-offset-1 scale-[1.02]' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        <p className={`text-[9px] font-black uppercase tracking-widest ${cfg.summaryLabel}`}>
                          {type === 'income' ? 'Entradas' : type === 'expense' ? 'Saídas' : 'Invest.'}
                        </p>
                        <p className={`text-[11px] font-black ${cfg.color} mt-0.5`}>
                          {fmt(totals[type])}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Busca + Ordenação ── */}
              <div className="flex gap-2 px-4 pb-3">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar movimentos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-slate-100 dark:border-slate-800"
                  />
                </div>
                <button
                  onClick={() => setSortBy(s => s === 'date' ? 'value' : 'date')}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
                >
                  {sortBy === 'date' ? '📅 Data' : '💰 Valor'}
                </button>
              </div>

              {/* ── Chips de Filtro ── */}
              <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto scrollbar-none">
                {filterButtons.map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setFilterType(btn.key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      filterType === btn.key
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {btn.label}
                    <span className={`px-1.5 py-0.5 rounded-md ${
                      filterType === btn.key ? 'bg-indigo-500/50 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {btn.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTEÚDO DA LISTA ── */}
      <div className="bg-white dark:bg-slate-900/70 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-2xl shadow-sm -mt-px">
        {!collapsed && (
          <div className="px-3 pb-3 pt-4">
            {selectedTransactionId && (
              <div className="mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600"><Pencil size={12} /></div>
                   <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-tight">Lançamento em edição</p>
                </div>
                <button onClick={() => onSelectTransaction?.(null)} className="text-amber-600 hover:text-amber-800"><X size={14}/></button>
              </div>
            )}

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700">
                <ReceiptText size={48} strokeWidth={1} className="mb-3 opacity-20" />
                <p className="text-[11px] font-black uppercase tracking-widest">Nenhum movimento</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700">
                <Search size={48} strokeWidth={1} className="mb-3 opacity-20" />
                <p className="text-[11px] font-black uppercase tracking-widest">Nada encontrado</p>
              </div>
            ) : sortBy === 'date' && grouped ? (
              <div className="space-y-6">
                {grouped.map(([dateKey, txs]) => (
                  <div key={dateKey} className="animate-fadeIn">
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest whitespace-nowrap">
                        {dateKey !== 'Sem data' ? fmtDate(dateKey) : 'Sem data'}
                      </p>
                      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/50" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/30 px-2 py-0.5 rounded-md">
                        {txs.length} {txs.length === 1 ? 'it' : 'its'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {txs.map(tx => renderTxItem(tx))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 animate-fadeIn">
                {filteredTransactions.map(tx => renderTxItem(tx))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
