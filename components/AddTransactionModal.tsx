import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, CreditCard, Wallet, Calendar, Hash, Repeat, Save, Plus,
  TrendingDown, TrendingUp, ArrowLeftRight, LineChart, ChevronDown
} from 'lucide-react';
import { FinancialData } from '../types';
import { Transaction } from './TransactionHistory';
import { getOwnerLabel } from '../utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: FinancialData;
  onAddTransaction: (transaction: NewTransactionData) => void;
  dataToEdit?: Transaction | null;
  onEditTransaction?: (updated: { id: string } & NewTransactionData) => void;
  initialType?: TransactionType;
}

export interface NewTransactionData {
  description: string;
  amount: number;
  categoryId: string;
  subCategoryId: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  accountId?: string;
  toAccountId?: string;
  installments?: number;
  date: Date;
  isRecurring?: boolean;
  frequency?: 'monthly';
  recurrenceLimit?: number;
  transactionType?: TransactionType;
}

type TransactionType = 'expense' | 'income' | 'credit_card' | 'transfer' | 'investment';

interface TypeOption {
  id: TransactionType;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  categoryId: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  { id: 'expense',     label: 'Despesa',      icon: TrendingDown,   gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', glow: 'rgba(244,63,94,0.4)',   categoryId: 'additionalVariableCosts' },
  { id: 'income',      label: 'Receita',       icon: TrendingUp,     gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.4)',  categoryId: 'payslipIncome' },
  { id: 'credit_card', label: 'Cartão',        icon: CreditCard,     gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', glow: 'rgba(99,102,241,0.4)',  categoryId: 'additionalVariableCosts' },
  { id: 'transfer',    label: 'Transferência', icon: ArrowLeftRight, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.4)',  categoryId: 'payslipIncome' },
  { id: 'investment',  label: 'Investimento',  icon: LineChart,      gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow: 'rgba(139,92,246,0.4)',  categoryId: 'investments' },
];

const LABELS: Record<TransactionType, { question: string; sub: string }> = {
  expense:     { question: 'Quanto você gastou?',     sub: 'Despesa' },
  income:      { question: 'Quanto você recebeu?',    sub: 'Receita' },
  credit_card: { question: 'Valor da compra?',        sub: 'Cartão de Crédito' },
  transfer:    { question: 'Valor da transferência?', sub: 'Entre Contas' },
  investment:  { question: 'Valor do aporte?',        sub: 'Investimento' },
};

const inputClasses = "w-full outline-none px-4 py-2.5 text-[13px] font-bold rounded-[14px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all";

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen, onClose, currentData, onAddTransaction, dataToEdit, onEditTransaction, initialType
}) => {
  const [txType, setTxType]           = useState<TransactionType>(initialType || 'expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit'|'debit'|'pix'|'cash'>('debit');
  const [cardId, setCardId]           = useState('');
  const [accountId, setAccountId]     = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceLimit, setRecurrenceLimit] = useState<number | ''>('');

  const currentType = TYPE_OPTIONS.find(t => t.id === txType)!;
  const categoryId  = currentType.categoryId;
  const label       = LABELS[txType];

  useEffect(() => {
    if (!isOpen) return;
    const cat = currentData[categoryId as keyof FinancialData] as any;
    if (cat?.subCategories?.length > 0) setSubCategoryId(cat.subCategories[0].id);
  }, [txType, isOpen, categoryId, currentData]);

  useEffect(() => {
    if (isOpen && dataToEdit) {
      setDescription(dataToEdit.name);
      setAmount(String(dataToEdit.value));
      if (dataToEdit.date) setDate(dataToEdit.date);
      if (dataToEdit.catKey) {
        const match = TYPE_OPTIONS.find(t => t.categoryId === dataToEdit.catKey);
        if (match) setTxType(match.id);
      }
      if (dataToEdit.subId) setSubCategoryId(dataToEdit.subId);
      if (dataToEdit.paymentMethod) setPaymentMethod(dataToEdit.paymentMethod as any);
      if (dataToEdit.cardId) { setCardId(dataToEdit.cardId); setTxType('credit_card'); }
      if (dataToEdit.accountId) setAccountId(dataToEdit.accountId);
      if (dataToEdit.isRecurring !== undefined) setIsRecurring(dataToEdit.isRecurring);
      if (dataToEdit.recurrenceLimit) setRecurrenceLimit(dataToEdit.recurrenceLimit);
    } else if (isOpen && initialType && !dataToEdit) {
      setTxType(initialType);
    }
  }, [isOpen, dataToEdit, initialType]);

  useEffect(() => {
    if (!isOpen) {
      setDescription(''); setAmount(''); setPaymentMethod('debit');
      setAccountId(''); setToAccountId(''); setCardId('');
      setInstallments(1); setIsRecurring(false); setRecurrenceLimit('');
      setDate(new Date().toISOString().split('T')[0]);
      if (!dataToEdit && !initialType) setTxType('expense');
    }
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, dataToEdit]);

  const handleSubmit = () => {
    if (!description || !amount) return;
    let finalSubId = subCategoryId;
    if (!finalSubId) {
      const cat = currentData[categoryId as keyof FinancialData] as any;
      if (cat?.subCategories?.length > 0) finalSubId = cat.subCategories[0].id;
    }
    if (!finalSubId && txType !== 'transfer') return;

    const localDate = new Date(date + 'T12:00:00');
    const isCredit  = txType === 'credit_card';

    const payload: NewTransactionData = {
      description,
      amount: parseFloat(amount.replace(',', '.')),
      categoryId,
      subCategoryId: finalSubId,
      paymentMethod: isCredit ? 'credit' : paymentMethod,
      cardId:        isCredit ? cardId : undefined,
      accountId:     !isCredit ? accountId : undefined,
      toAccountId:   txType === 'transfer' ? toAccountId : undefined,
      installments:  isCredit ? installments : undefined,
      date:          localDate,
      isRecurring,
      recurrenceLimit: (isRecurring && recurrenceLimit !== '') ? Number(recurrenceLimit) : undefined,
      transactionType: txType,
    };

    if (dataToEdit && onEditTransaction) {
      onEditTransaction({ id: dataToEdit.id, ...payload });
    } else {
      onAddTransaction(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  const accounts = currentData.accounts || [];
  const cards    = currentData.cards    || [];
  const subCats  = (currentData[categoryId as keyof FinancialData] as any)?.subCategories || [];

  const isDisabled =
    !amount || !description ||
    (txType === 'credit_card' && !cardId) ||
    (txType === 'transfer' && (!accountId || !toAccountId));

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-[420px] z-10 flex flex-col bg-white dark:bg-[#0d1526] rounded-t-[28px] border-t border-x border-slate-200 dark:border-white/5"
        style={{
          boxShadow: '0 -8px 40px rgba(0,0,0,0.1)',
          maxHeight: '92vh',
        }}
      >
        {/* Linha de destaque no topo */}
        <div
          className="h-px w-full rounded-t-[28px]"
          style={{ background: currentType.gradient }}
        />

        {/* Glow de fundo contextual */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none -mr-8 -mt-8"
          style={{
            background: currentType.glow.replace('0.4', '0.06'),
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Handle (mobile) */}
            <div className="sm:hidden w-8 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:hidden w-8 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-3 ml-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: currentType.gradient, boxShadow: `0 4px 16px ${currentType.glow}` }}
            >
              <currentType.icon size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base text-slate-800 dark:text-white leading-none tracking-tight">
                {dataToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 text-slate-500">{label.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-transform bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
          >
            <X size={15} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* ── Type Selector ── */}
        {!dataToEdit && (
          <div className="px-4 pt-4 pb-0 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TYPE_OPTIONS.map(opt => {
                const active = txType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTxType(opt.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all active:scale-95 border ${active ? 'border-white/15' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'}`}
                    style={active ? {
                      background: opt.gradient,
                      boxShadow: `0 4px 16px ${opt.glow}`
                    } : {}}
                  >
                    <opt.icon size={15} className={active ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                    <span className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Form ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">

          {/* Valor + Descrição */}
          <div
            className="rounded-2xl p-4 text-center space-y-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
          >
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label.question}</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-800 dark:text-slate-200 font-black text-xl">R$</span>
              <input
                type="number" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0,00" autoFocus
                className={`bg-transparent text-5xl font-black focus:outline-none w-full text-center tracking-tighter ${amount ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-white/10'}`}
              />
            </div>
            <input
              type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descrição..."
              className="w-full text-center font-bold text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all rounded-xl py-2.5 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* EXPENSE / INCOME / INVESTMENT */}
          {(txType === 'expense' || txType === 'income' || txType === 'investment') && (
            <div className="space-y-3">
              {subCats.length > 1 && (
                <Field label="Subcategoria" icon={<ChevronDown size={10} />}>
                  <div className="relative">
                    <select
                      value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)}
                      className={`appearance-none cursor-pointer uppercase tracking-wider pr-9 ${inputClasses}`}
                    >
                      {subCats.map((s: any) => <option key={s.id} value={s.id} className="bg-white text-slate-800 dark:bg-[#0d1526] dark:text-white">{s.name}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </Field>
              )}

              {accounts.length > 0 && (
                <Field label="Conta" icon={<Wallet size={10} />}>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {accounts.map(acc => (
                      <button key={acc.id} onClick={() => setAccountId(acc.id)}
                        className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${accountId === acc.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                          <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Field label="Data" icon={<Calendar size={10} />}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
                </Field>
                <Field label="&nbsp;" icon={null}>
                  <button
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-full flex items-center justify-start gap-2 rounded-2xl transition-all active:scale-95 border px-4 py-2.5 ${isRecurring ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${isRecurring ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}
                    >
                      {isRecurring && <Repeat size={9} className="text-white" />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isRecurring ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Recorrente</span>
                  </button>
                </Field>
              </div>

              {isRecurring && (
                <Field label="Limite de Meses (vazio = vitalício)" icon={null}>
                  <input
                    type="number" min={1} value={recurrenceLimit}
                    onChange={e => setRecurrenceLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="Ex: 12"
                    className={inputClasses}
                  />
                </Field>
              )}
            </div>
          )}

          {/* CREDIT CARD */}
          {txType === 'credit_card' && (
            <div className="space-y-3">
              {cards.length > 0 ? (
                <Field label="Selecione o Cartão" icon={<CreditCard size={10} />}>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {cards.map(card => (
                      <button key={card.id} onClick={() => setCardId(card.id)}
                        className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${cardId === card.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${card.color}`} />
                          <span className="text-xs font-bold whitespace-nowrap">{card.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(card.owner || 'pedro')}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              ) : (
                <div className="rounded-xl px-4 py-3 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                  Nenhum cartão cadastrado. Adicione um em <strong>Cartões</strong> no menu.
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Parcelas" icon={<Hash size={10} />}>
                  <div className="relative">
                    <select value={installments} onChange={e => setInstallments(parseInt(e.target.value))}
                      className={`appearance-none cursor-pointer pr-9 ${inputClasses}`}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i+1} value={i+1} className="bg-white text-slate-800 dark:bg-[#0d1526] dark:text-white">
                          {i+1}x {i > 0 && amount ? `(R$ ${(parseFloat(amount.replace(',', '.')) / (i+1)).toFixed(2)})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Data" icon={<Calendar size={10} />}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
                </Field>
              </div>
            </div>
          )}

          {/* TRANSFER */}
          {txType === 'transfer' && (
            <div className="space-y-3">
              {accounts.length >= 2 ? (
                <>
                  <Field label="Conta Origem" icon={<Wallet size={10} />}>
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      {accounts.filter(a => a.id !== toAccountId).map(acc => (
                        <button key={acc.id} onClick={() => setAccountId(acc.id)}
                          className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${accountId === acc.id ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                            <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    <ArrowLeftRight size={13} className="text-amber-500" />
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  </div>

                  <Field label="Conta Destino" icon={<Wallet size={10} />}>
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      {accounts.filter(a => a.id !== accountId).map(acc => (
                        <button key={acc.id} onClick={() => setToAccountId(acc.id)}
                          className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${toAccountId === acc.id ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                            <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Data" icon={<Calendar size={10} />}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
                  </Field>
                </>
              ) : (
                <div className="rounded-xl px-4 py-3 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                  Você precisa de pelo menos 2 contas cadastradas para fazer transferências.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 pb-6 pt-3 shrink-0 border-t border-slate-200 dark:border-white/5">
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`w-full py-4 rounded-2xl font-black text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.18em] disabled:cursor-not-allowed ${isDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500' : 'text-white'}`}
            style={isDisabled ? {} : {
              background: currentType.gradient,
              boxShadow: `0 8px 24px ${currentType.glow}`,
            }}
          >
            {dataToEdit ? <Save size={16} /> : <Plus size={16} />}
            <span>{dataToEdit ? 'Salvar Edição' : 'Confirmar Lançamento'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Helper ─────────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    {label.trim() && (
      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 ml-0.5">
        {icon}
        {label}
      </label>
    )}
    {children}
  </div>
);
