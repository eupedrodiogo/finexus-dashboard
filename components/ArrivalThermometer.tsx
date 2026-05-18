
import React, { useState } from 'react';
import { Baby, Edit2, Check, X, Target, Wallet } from 'lucide-react';

interface ArrivalThermometerProps {
  currentAmount?: number;
  targetAmount?: number;
  onUpdate?: (data: { current?: number; target?: number }) => void;
}

export const ArrivalThermometer: React.FC<ArrivalThermometerProps> = ({ 
  currentAmount = 0, 
  targetAmount = 15000,
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrent, setEditCurrent] = useState(currentAmount);
  const [editTarget, setEditTarget] = useState(targetAmount);

  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ current: editCurrent, target: editTarget });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditCurrent(currentAmount);
    setEditTarget(targetAmount);
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fadeIn overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 blur-[100px] rounded-full" />

      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-inner">
            <Baby size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Reserva do João Vitor
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-white/5 md:bg-transparent hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/5 md:border-transparent md:opacity-0 md:group-hover:opacity-100"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </h3>
            <p className="text-sm font-semibold text-slate-400/80">
              {percentage < 25 ? "Dando os primeiros passos..." : 
               percentage < 50 ? "Construindo o ninho..." : 
               percentage < 75 ? "O futuro está logo ali!" : 
               percentage < 100 ? "Falta pouco para a meta!" : "Meta alcançada! 🎉"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-4xl font-black bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">
            {Math.round(percentage)}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Progresso</span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
                <Wallet size={12} /> Saldo Atual
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  value={editCurrent}
                  onChange={(e) => setEditCurrent(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
                <Target size={12} /> Meta Objetivo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
            >
              <X size={16} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Check size={16} /> Salvar Alterações
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full h-5 bg-slate-800/50 rounded-full mt-4 overflow-hidden border border-white/5 p-1 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between mt-8">
            <div className="group/val p-4 rounded-2xl hover:bg-white/5 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Acumulado</span>
              <span className="text-2xl font-black text-slate-100 tracking-tight">{formatCurrency(currentAmount)}</span>
            </div>
            <div className="group/val p-4 rounded-2xl hover:bg-white/5 transition-all text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Meta final</span>
              <span className="text-2xl font-black text-slate-100 tracking-tight">{formatCurrency(targetAmount)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

