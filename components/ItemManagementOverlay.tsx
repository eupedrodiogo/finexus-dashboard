import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  Circle, 
  Save, 
  Repeat, 
  EyeOff, 
  Trash2,
  X,
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { LineItem } from '../types';

interface ItemManagementOverlayProps {
  item: {
    id: string;
    name: string;
    value: number;
    category: string;
    subCategoryId: string;
    isPaid?: boolean;
    isRecurring?: boolean;
    isIgnored?: boolean;
    accountName?: string;
    accountColor?: string;
  } | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleRecurring: () => void;
  onToggleIgnored: () => void;
  onDelete: () => void;
  onTogglePaid: () => void;
}

export const ItemManagementOverlay: React.FC<ItemManagementOverlayProps> = ({
  item,
  onClose,
  onEdit,
  onToggleRecurring,
  onToggleIgnored,
  onDelete,
  onTogglePaid
}) => {
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item]);

  if (!item) return null;

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(item.value);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop com Blur Profundo */}
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-[64px] z-[100] transition-all duration-500 ease-in-out ${
          item ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose}
      />
      
      {/* Modal Container - Ajustado para ser mais compacto e consistente */}
      <div className={`relative w-full sm:max-w-[390px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[101] shadow-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 dark:border-slate-800/50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col max-h-[85vh] ${
        item ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}>
        
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

        {/* Top Header - Estilo Sidebar */}
        <div className="p-6 pb-2 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-xl transition-all ${
              item.isPaid 
                ? 'bg-emerald-500 shadow-emerald-500/20' 
                : 'bg-indigo-600 shadow-indigo-500/20'
            }`}>
              {item.isPaid ? <CheckCircle2 size={20} className="text-white" /> : <Info size={20} className="text-white" />}
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tighter text-slate-900 dark:text-white leading-none">Gestão</h1>
              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">{item.category}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar relative z-10">
          {/* Item Meta */}
          <div className="mb-6 text-center">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Valor do Lançamento</p>
            <p className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter mb-4">
              {formattedValue}
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight px-4">
              {item.name}
            </h1>
            
            {item.accountName && (
              <div className="flex items-center justify-center gap-2 mt-4 bg-slate-100/50 dark:bg-white/5 py-2 px-4 rounded-full w-fit mx-auto border border-slate-200/50 dark:border-white/5">
                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.accountColor }}></div>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {item.accountName}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 mb-4">
            <button
              onClick={onTogglePaid}
              className={`w-full flex items-center justify-between p-4 rounded-[28px] transition-all active:scale-[0.98] border-2 shadow-lg group ${
                item.isPaid 
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' 
                  : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-900 dark:text-white hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  item.isPaid ? 'bg-white/20' : 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm'
                }`}>
                  {item.isPaid ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                <div className="text-left">
                  <p className="font-black text-sm leading-none tracking-tight">
                    {item.isPaid ? 'Pagamento Confirmado' : 'Marcar como Pago'}
                  </p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${item.isPaid ? 'text-white/60' : 'text-slate-400'}`}>
                    Status atual
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className={item.isPaid ? 'opacity-50' : 'opacity-20'} />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <ActionButton 
                icon={<Save size={18} />} 
                label="Editar" 
                onClick={onEdit} 
                color="indigo" 
              />
              <ActionButton 
                icon={<Repeat size={18} />} 
                label="Repetir" 
                onClick={onToggleRecurring} 
                color={item.isRecurring ? 'indigo' : 'slate'}
                isActive={item.isRecurring}
              />
              <ActionButton 
                icon={<EyeOff size={18} />} 
                label="Ignorar" 
                onClick={onToggleIgnored} 
                color={item.isIgnored ? 'amber' : 'slate'}
                isActive={item.isIgnored}
              />
              <ActionButton 
                icon={<Trash2 size={18} />} 
                label="Excluir" 
                onClick={onDelete} 
                color="rose" 
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black text-xs shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-[0.2em]"
          >
            Fechar Menu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ActionButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  sub?: string; 
  onClick: () => void; 
  color: 'indigo' | 'slate' | 'amber' | 'rose';
  isActive?: boolean;
}> = ({ icon, label, sub, onClick, color, isActive }) => {
  const colorStyles = {
    indigo: isActive ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10',
    slate: isActive ? 'bg-slate-800 text-white' : 'text-slate-400 bg-slate-100 dark:bg-slate-900',
    amber: isActive ? 'bg-amber-500 text-white shadow-amber-500/20' : 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all'
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-3 p-4 border border-transparent rounded-[32px] transition-all active:scale-[0.95] bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-800 group`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${colorStyles[color]}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-black text-[11px] text-slate-900 dark:text-white leading-none tracking-tight">{label}</p>
        {sub && <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-1">{sub}</p>}
      </div>
    </button>
  );
};

