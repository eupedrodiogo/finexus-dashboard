import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Repeat, Circle, CheckCircle2, Save, MoreVertical, EyeOff } from 'lucide-react';

export interface EditableRowProps {
  label: string;
  value: number;
  isRecurring?: boolean;
  annualRate?: number;
  isPaid?: boolean;
  isIgnored?: boolean;
  onEditClick: () => void;
  onDelete: () => void;
  onToggleRecurring: () => void;
  onTogglePaid: () => void;
  onToggleIgnored: () => void;
  onUpdate?: (updates: { name?: string, value?: number }) => void;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  onShowManagement?: () => void;
  accountColor?: string;
  accountName?: string;
}

export const EditableRow: React.FC<EditableRowProps> = ({ 
  label, value, isRecurring, annualRate, isPaid, isIgnored,
  onEditClick, onDelete, 
  onToggleRecurring, onTogglePaid, onToggleIgnored, onUpdate, accountColor, accountName,
  isSelected, onSelectToggle, onShowManagement
}) => {
  const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('down');
  const [showActions, setShowActions] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'value' | null>(null);
  const [tempName, setTempName] = useState(label);
  const [tempValue, setTempValue] = useState(value.toString());
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTempName(label);
    setTempValue(value.toString());
  }, [label, value]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowManagement?.();
  };

  const handleSave = () => {
    if (!onUpdate) return;
    
    const updates: { name?: string, value?: number } = {};
    if (editingField === 'name' && tempName !== label) {
      updates.name = tempName;
    }
    if (editingField === 'value') {
      const numVal = parseFloat(tempValue.replace(',', '.'));
      if (!isNaN(numVal) && numVal !== value) {
        updates.value = numVal;
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempName(label);
      setTempValue(value.toString());
      setEditingField(null);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between py-2 px-3 rounded-2xl transition-all duration-300 border ${
        isSelected 
          ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
      } ${isIgnored ? 'opacity-40' : 'opacity-100'}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Selection & Status Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div 
            onClick={(e) => { e.stopPropagation(); onSelectToggle?.(); }}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-indigo-600 border-indigo-600' 
                : 'border-slate-400 dark:border-slate-600'
            }`}
          >
            {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
            className={`transition-all ${
              isPaid ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'
            }`}
          >
            {isPaid ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Circle size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Name Area */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {editingField === 'name' ? (
            <input
              ref={nameInputRef}
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-white dark:bg-slate-900 border-b border-indigo-500 text-sm font-bold text-slate-800 dark:text-white focus:outline-none px-1"
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span 
                onClick={() => setEditingField('name')}
                className={`text-sm font-bold truncate cursor-text ${
                  isPaid || isIgnored 
                    ? 'text-slate-500 dark:text-slate-400 line-through' 
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {label || 'Sem descrição'}
              </span>
              
              {/* Discrete Badges */}
              {isRecurring && (
                <Repeat size={10} className="text-indigo-500 flex-shrink-0" strokeWidth={3} />
              )}
              {accountColor && (
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.1)]" 
                  style={{ backgroundColor: accountColor }}
                  title={accountName}
                />
              )}
              {isIgnored && <EyeOff size={10} className="text-amber-500 flex-shrink-0" />}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Value Area */}
        {editingField === 'value' ? (
          <input
            ref={valueInputRef}
            autoFocus
            type="number"
            step="0.01"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-20 text-right font-black text-sm text-slate-800 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none"
          />
        ) : (
          <span 
            onClick={() => setEditingField('value')}
            className={`text-sm font-black whitespace-nowrap cursor-text ${
              isPaid || isIgnored ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}
          </span>
        )}
        <div className="relative">
          <button
            ref={actionButtonRef}
            onClick={toggleMenu}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-90"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
