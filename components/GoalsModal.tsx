
import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { Modal } from './Modal';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const COLORS = [
  { label: 'Indigo', value: '#6366f1', bg: 'bg-[#6366f1]' },
  { label: 'Rose', value: '#ec4899', bg: 'bg-[#ec4899]' },
  { label: 'Emerald', value: '#10b981', bg: 'bg-[#10b981]' },
  { label: 'Amber', value: '#f59e0b', bg: 'bg-[#f59e0b]' },
  { label: 'Violet', value: '#8b5cf6', bg: 'bg-[#8b5cf6]' },
  { label: 'Cyan', value: '#06b6d4', bg: 'bg-[#06b6d4]' },
];

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen, onClose, goals, onAddGoal, onUpdateGoal, onDeleteGoal
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Goal>>({
    name: '',
    targetValue: 0,
    currentValue: 0,
    deadline: '',
    color: COLORS[0].value
  });

  const resetForm = () => {
    setFormData({
      name: '',
      targetValue: 0,
      currentValue: 0,
      deadline: '',
      color: COLORS[0].value
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetValue) return;

    const goalData = {
      id: editingId || `goal-${Date.now()}`,
      name: formData.name,
      targetValue: Number(formData.targetValue),
      currentValue: Number(formData.currentValue || 0),
      deadline: formData.deadline || '',
      color: formData.color || COLORS[0].value
    };

    if (editingId) {
      onUpdateGoal(goalData);
    } else {
      onAddGoal(goalData);
    }
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData(goal);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Gerenciar Metas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Defina e acompanhe seus sonhos financeiros.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <span className="material-symbols-rounded notranslate">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome da Meta</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Viagem, Carro Novo..."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazo (Opcional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Alvo (R$)</label>
                <input
                  type="number"
                  value={formData.targetValue || ''}
                  onChange={e => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Atual (R$)</label>
                <input
                  type="number"
                  value={formData.currentValue || ''}
                  onChange={e => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor de Identificação</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-all duration-300 flex items-center justify-center ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    {formData.color === c.value && <span className="material-symbols-rounded notranslate text-white text-xs">check</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
              >
                {editingId ? 'Atualizar Meta' : 'Adicionar Nova Meta'}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Suas Metas Atuais</h3>
            {goals.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-rounded notranslate text-4xl mb-2 opacity-50">flag</span>
                <p>Nenhuma meta definida ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {goals.map(goal => {
                  const percentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                  return (
                    <div key={goal.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:shadow-lg transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: goal.color }}
                      >
                        <span className="text-xs font-bold">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-white truncate">{goal.name}</h4>
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetValue)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: goal.color }} />
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(goal)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                          <span className="material-symbols-rounded notranslate text-lg">edit</span>
                        </button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
                          <span className="material-symbols-rounded notranslate text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
