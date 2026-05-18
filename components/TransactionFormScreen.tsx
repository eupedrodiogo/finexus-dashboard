
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Save, Calendar, Wallet, CreditCard, ArrowLeftRight, TrendingUp, TrendingDown, History, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TransactionType = 'expense' | 'income' | 'credit_card' | 'transfer' | 'investment';

interface TransactionFormScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialType?: TransactionType;
  accounts: any[];
  creditCards: any[];
}

export const TransactionFormScreen: React.FC<TransactionFormScreenProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'expense',
  accounts,
  creditCards
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('0,00');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState(''); // for transfers
  const [cardId, setCardId] = useState('');
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      if (accounts.length > 0) setAccountId(accounts[0].id);
      if (creditCards.length > 0) setCardId(creditCards[0].id);
    }
  }, [isOpen, initialType, accounts, creditCards]);

  if (!isOpen) return null;

  const handleNumpad = (val: string) => {
    let clean = amount.replace(',', '').replace(/\./g, '');
    if (val === 'back') {
      clean = clean.slice(0, -1);
    } else {
      if (clean.length >= 10) return;
      clean += val;
    }
    
    const num = parseInt(clean || '0');
    const formatted = (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setAmount(formatted);
  };

  const getThemeColor = () => {
    switch (type) {
      case 'income': return 'bg-emerald-500';
      case 'expense': return 'bg-rose-500';
      case 'credit_card': return 'bg-purple-500';
      case 'transfer': return 'bg-amber-500';
      case 'investment': return 'bg-indigo-500';
      default: return 'bg-slate-600';
    }
  };

  const types = [
    { id: 'expense', label: 'Despesa', icon: <TrendingDown size={18} />, color: 'bg-rose-500' },
    { id: 'income', label: 'Receita', icon: <TrendingUp size={18} />, color: 'bg-emerald-500' },
    { id: 'credit_card', label: 'Cartão', icon: <CreditCard size={18} />, color: 'bg-purple-500' },
    { id: 'transfer', label: 'Transf.', icon: <ArrowLeftRight size={18} />, color: 'bg-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-slideUp">
      {/* Header Area */}
      <div className={`${getThemeColor()} pt-8 pb-12 px-6 text-white relative transition-colors duration-500`}>
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md">
            <X size={24} />
          </button>
          <h2 className="font-black uppercase tracking-widest text-sm opacity-90">Nova {type === 'income' ? 'Receita' : 'Despesa'}</h2>
          <div className="w-10" />
        </div>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold opacity-70 mb-1 uppercase tracking-tighter">Valor do Lançamento</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-60">R$</span>
            <span className="text-6xl font-black tracking-tighter">{amount}</span>
          </div>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 -mt-6 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 overflow-y-auto">
        {/* Type Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                type === t.id 
                ? `${t.color} text-white shadow-lg shadow-${t.id === 'expense' ? 'rose' : t.id === 'income' ? 'emerald' : 'purple'}-500/20` 
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Description Input */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <History size={24} />
            </div>
            <input 
              type="text" 
              placeholder="O que você comprou?" 
              className="flex-1 bg-transparent border-none outline-none font-bold text-slate-800 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date and Account/Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</span>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                <Calendar size={16} className="text-slate-400" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {type === 'credit_card' ? 'Cartão' : 'Conta'}
              </span>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                {type === 'credit_card' ? <CreditCard size={16} className="text-slate-400" /> : <Wallet size={16} className="text-slate-400" />}
                <select 
                  className="bg-transparent text-sm outline-none w-full"
                  value={type === 'credit_card' ? cardId : accountId}
                  onChange={e => type === 'credit_card' ? setCardId(e.target.value) : setAccountId(e.target.value)}
                >
                  {type === 'credit_card' 
                    ? creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    : accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                  }
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="mt-8 grid grid-cols-3 gap-4 pb-20">
          {[1,2,3,4,5,6,7,8,9,'.',0,'back'].map((key) => (
            <button
              key={key}
              onClick={() => handleNumpad(key.toString())}
              className={`h-16 rounded-3xl flex items-center justify-center font-black text-xl transition-all ${
                key === 'back' 
                ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-100 dark:border-slate-800 active:scale-95'
              }`}
            >
              {key === 'back' ? <X size={24} /> : key}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="absolute bottom-8 left-6 right-6">
        <button 
          onClick={() => onSave({ type, amount: parseFloat(amount.replace(/\./g, '').replace(',', '.')), description, date, accountId, cardId })}
          className={`w-full py-5 rounded-[2rem] text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${getThemeColor()} shadow-${getThemeColor().split('-')[1]}-500/30`}
        >
          <Save size={24} />
          Salvar Lançamento
        </button>
      </div>
    </div>
  );
};
