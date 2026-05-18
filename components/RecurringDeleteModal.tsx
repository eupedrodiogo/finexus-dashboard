
import React, { useState, useMemo } from 'react';
import { Trash2, Calendar, List, ChevronRight } from 'lucide-react';

export type RecurringDeleteMode = 'single' | 'from-here' | 'custom';

export interface RecurringDeletePayload {
  mode: RecurringDeleteMode;
  selectedMonths?: string[]; // only for 'custom', format: 'YYYY-MM'
}

interface RecurringDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: RecurringDeletePayload) => void;
  itemName: string;
  itemDate: string | undefined;   // 'YYYY-MM-DD' anchor date
  /** All month keys (YYYY-MM) where this recurring item exists */
  affectedMonths: string[];
  /** The month the user is currently viewing, format: 'YYYY-MM' */
  currentMonthKey: string;
}

const fmt = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const RecurringDeleteModal: React.FC<RecurringDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemDate,
  affectedMonths,
  currentMonthKey,
}) => {
  const [mode, setMode] = useState<RecurringDeleteMode>('single');
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'choose' | 'pick-months'>('choose');

  const sortedAffectedMonths = useMemo(
    () => [...affectedMonths].sort(),
    [affectedMonths]
  );

  // Months at-or-after currentMonthKey (for 'from-here' count display)
  const futureCount = useMemo(
    () => sortedAffectedMonths.filter(m => m >= currentMonthKey).length,
    [sortedAffectedMonths, currentMonthKey]
  );

  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const handleConfirm = () => {
    if (mode === 'custom') {
      onConfirm({ mode: 'custom', selectedMonths: [...selectedMonths] });
    } else {
      onConfirm({ mode });
    }
    handleClose();
  };

  const handleClose = () => {
    setMode('single');
    setSelectedMonths(new Set());
    setStep('choose');
    onClose();
  };

  const handleNext = () => {
    if (mode === 'custom') {
      setStep('pick-months');
    } else {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  const options = [
    {
      id: 'single' as const,
      icon: <Calendar size={22} className="text-amber-500" />,
      bg: 'bg-amber-500/10 dark:bg-amber-500/10',
      border: 'border-amber-400/50',
      activeBg: 'bg-amber-50 dark:bg-amber-900/20',
      label: 'Apenas este mês',
      desc: `Remove só a entrada de ${fmt(currentMonthKey)}.`,
    },
    {
      id: 'from-here' as const,
      icon: <ChevronRight size={22} className="text-rose-500" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-400/50',
      activeBg: 'bg-rose-50 dark:bg-rose-900/20',
      label: 'Este mês e todos os seguintes',
      desc: `Remove ${futureCount} entr${futureCount === 1 ? 'ada' : 'adas'} a partir de ${fmt(currentMonthKey)}.`,
    },
    {
      id: 'custom' as const,
      icon: <List size={22} className="text-indigo-500" />,
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-400/50',
      activeBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      label: 'Selecionar meses manualmente',
      desc: 'Escolha exatamente quais meses deseja remover.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                Excluir lançamento recorrente
              </h2>
              <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">"{itemName}"</p>
            </div>
          </div>
        </div>

        {/* Step: choose mode */}
        {step === 'choose' && (
          <div className="p-6 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              O que deseja excluir?
            </p>

            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  mode === opt.id
                    ? `${opt.activeBg} ${opt.border}`
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                  {opt.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{opt.desc}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  mode === opt.id
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {mode === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition-all active:scale-95"
              >
                {mode === 'custom' ? 'Próximo →' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        )}

        {/* Step: pick months */}
        {step === 'pick-months' && (
          <div className="p-6 space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Selecione os meses
            </p>

            {/* Select all / Deselect all */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonths(new Set(sortedAffectedMonths))}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Selecionar todos
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={() => setSelectedMonths(new Set())}
                className="text-xs font-bold text-slate-400 hover:underline"
              >
                Desmarcar todos
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {sortedAffectedMonths.map(m => {
                const isSelected = selectedMonths.has(m);
                const isCurrent = m === currentMonthKey;
                return (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-rose-400/60 bg-rose-50 dark:bg-rose-900/20'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                      {fmt(m)}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                          Atual
                        </span>
                      )}
                    </span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedMonths.size > 0 && (
              <p className="text-xs text-center text-slate-400 font-medium">
                {selectedMonths.size} {selectedMonths.size === 1 ? 'mês selecionado' : 'meses selecionados'}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedMonths.size === 0}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-rose-500/25 transition-all active:scale-95"
              >
                Excluir {selectedMonths.size > 0 ? `${selectedMonths.size} mês(es)` : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
