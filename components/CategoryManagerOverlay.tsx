import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Edit2, Trash2, Check, XCircle } from 'lucide-react';
import { SubCategory } from '../types';

interface CategoryManagerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SubCategory[];
  categoryId: string; // The parent category ID
  typeLabel: string;
  onAdd: (categoryId: string, name: string) => void;
  onEdit: (categoryId: string, subId: string, newName: string) => void;
  onDelete: (categoryId: string, subId: string) => void;
  gradient: string;
  glow: string;
}

export const CategoryManagerOverlay: React.FC<CategoryManagerOverlayProps> = ({
  isOpen,
  onClose,
  categories,
  categoryId,
  typeLabel,
  onAdd,
  onEdit,
  onDelete,
  gradient,
  glow
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addValue, setAddValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setEditingId(null);
      setIsAdding(false);
      setAddValue('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveEdit = (subId: string) => {
    if (editValue.trim()) {
      onEdit(categoryId, subId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleSaveAdd = () => {
    if (addValue.trim()) {
      onAdd(categoryId, addValue.trim());
      setAddValue('');
      setIsAdding(false);
    }
  };

  const handleDelete = (subId: string, hasItems: boolean) => {
    if (hasItems) {
      if (!window.confirm('Esta categoria possui lançamentos. Excluí-la irá mover os lançamentos para a primeira categoria existente. Continuar?')) {
        return;
      }
    } else {
      if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
      }
    }
    onDelete(categoryId, subId);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-[10px] z-[100] transition-all duration-300`} 
        onClick={onClose}
      />
      
      <div className="relative w-full sm:max-w-[400px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[101] shadow-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 dark:border-slate-800/50 flex flex-col overflow-hidden max-h-[85vh]">
        
        {/* Top Highlight Line */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: gradient }} />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-white/5">
          <div>
            <h2 className="font-black text-lg tracking-tighter text-slate-900 dark:text-white leading-none">Categorias</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1 text-slate-500">{typeLabel}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(cat.id); }}
                    className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none border border-indigo-500/50"
                  />
                  <button onClick={() => handleSaveEdit(cat.id)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                    <XCircle size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{cat.items.length} lançamento(s)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    {categories.length > 1 && (
                      <button 
                        onClick={() => handleDelete(cat.id, cat.items.length > 0)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <input
                autoFocus
                type="text"
                placeholder="Nome da categoria..."
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAdd(); }}
                className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none border border-transparent focus:border-indigo-500/50"
              />
              <button onClick={handleSaveAdd} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                <Check size={16} />
              </button>
              <button onClick={() => setIsAdding(false)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                <XCircle size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <Plus size={16} />
              Nova Categoria
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
