
import React, { useState, useRef, useEffect } from 'react';

export interface EditableRowProps {
  label: string;
  value: number;
  isRecurring?: boolean;
  annualRate?: number;
  isPaid?: boolean;
  onChange: (val: number) => void;
  onNameChange: (val: string) => void;
  onRateChange?: (val: number) => void;
  onDelete: () => void;
  onToggleRecurring: () => void;
  onTogglePaid: () => void;
  accountColor?: string;
  accountName?: string;
}

export const EditableRow: React.FC<EditableRowProps> = ({ label, value, isRecurring, annualRate, isPaid, onChange, onNameChange, onRateChange, onDelete, onToggleRecurring, onTogglePaid, accountColor, accountName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [label]);

  return (
    <div
      className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 flex-1 mr-4">
        <button
          onClick={onTogglePaid}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1.5 ${isPaid ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}
          title={isPaid ? "Realizado/Pago" : "Pendente"}
        >
          {isPaid && <span className="material-symbols-rounded notranslate text-white text-[10px] font-bold">check</span>}
        </button>
        <button
          onClick={onToggleRecurring}
          className={`w-2 h-2 rounded-full transition-all flex-shrink-0 mt-1.5 ${isRecurring ? 'bg-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-300'}`}
          title={isRecurring ? "Recorrente" : "Não recorrente"}
        />
        {accountColor && (
          <div
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: accountColor }}
            title={`Conta: ${accountName}`}
          />
        )}
        <textarea
          ref={textareaRef}
          value={label}
          rows={1}
          onChange={(e) => {
            onNameChange(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          className="font-medium text-slate-700 dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors w-full placeholder-slate-400 resize-none overflow-hidden min-h-[24px] py-0.5 leading-relaxed"
          placeholder="Nome do item"
        />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">

        {onRateChange && (
          <div className={`flex items-center mr-2 transition-all duration-200 ${isHovered || (annualRate && annualRate > 0) ? 'opacity-100 max-w-[60px]' : 'opacity-0 max-w-0 overflow-hidden'}`}>
            <input
              type="number"
              value={annualRate || ''}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              placeholder="%"
              title="Taxa anual (%)"
              className="w-10 text-right text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 ml-0.5">%</span>
          </div>
        )}

        <span className="text-xs text-slate-400 font-medium">R$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 bg-transparent text-right font-bold text-slate-800 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
        />

        {/* Delete Action (Micro-interaction: only visible on hover) */}
        <button
          onClick={onDelete}
          className={`ml-2 text-slate-400 hover:text-rose-500 transition-all transform duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
          title="Excluir item"
        >
          <span className="material-symbols-rounded notranslate text-lg">delete</span>
        </button>
      </div>
    </div>
  );
};
