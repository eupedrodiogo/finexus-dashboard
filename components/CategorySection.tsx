import React, { useState } from 'react';
import { 
  DollarSign, 
  MinusCircle, 
  Home, 
  TrendingUp, 
  ShoppingCart, 
  FolderOpen, 
  Edit2, 
  Trash2, 
  Plus,
  X,
  Save,
  Zap,
  Circle,
  Repeat,
  CheckCircle2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  EyeOff
} from 'lucide-react';
import { Category, Account } from '../types';
import { EditableRow } from './EditableRow';
import { Modal } from './Modal';
import { ItemManagementOverlay } from './ItemManagementOverlay';
import { getAnonymizedLabel } from '../utils';

interface CategorySectionProps {
    category: Category;
    total: number;
    onItemChange: (subId: string, itemId: string, val: number) => void;
    onItemNameChange: (subId: string, itemId: string, val: string) => void;
    onItemAdd: (subId: string) => void;
    onItemDelete: (subId: string, itemId: string) => void;
    onTitleChange: (val: string) => void;
    onBudgetChange: (val: number) => void;
    onRateChange: (subId: string, itemId: string, val: number) => void;
    onItemRecurringToggle: (subId: string, itemId: string) => void;
    onItemPaidToggle: (subId: string, itemId: string) => void;
    onItemIgnoreToggle: (subId: string, itemId: string) => void;
    onBulkItemDelete?: (subId: string, itemIds: string[]) => void;
    onBulkItemIgnore?: (subId: string, itemIds: string[]) => void;
    isEditable: boolean;
    onSubCategoryNameChange?: (subId: string, newName: string) => void;
    onDeleteSubCategory?: (subId: string) => void;
    onUpdateItem?: (subId: string, itemId: string, updates: any) => void;
    onBulkItemUpdate?: (subId: string, itemIds: string[], updates: any) => void;
    accounts?: Account[];
    comparisonLabel?: string;
    isPedro?: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const CategorySection: React.FC<CategorySectionProps> = ({
    category,
    total,
    onItemChange,
    onItemNameChange,
    onItemAdd,
    onItemDelete,
    onTitleChange,
    onItemRecurringToggle,
    onItemPaidToggle,
    onItemIgnoreToggle,
    onBulkItemDelete,
    onBulkItemIgnore,
    onBudgetChange,
    onRateChange,
    onSubCategoryNameChange,
    onDeleteSubCategory,
    onUpdateItem,
    onBulkItemUpdate,
    accounts = [],
    comparisonLabel,
    isPedro = false
}) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [collapsedSubs, setCollapsedSubs] = useState<Record<string, boolean>>({});
    const [bulkModalData, setBulkModalData] = useState<{ subId: string, count: number } | null>(null);

    const toggleSubCollapse = (subId: string) => {
        setCollapsedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));
    };
    
    // Cálculo de Realizado vs Planejado
    const allItems = category.subCategories.flatMap(sub => sub.items);
    const realTotal = allItems.filter(i => i.isPaid && !i.isIgnored).reduce((acc, i) => acc + i.value, 0);
    const remainingToPay = total - realTotal;
    const paymentProgress = total > 0 ? (realTotal / total) * 100 : 0;

    // Modal Edit State
    const [editingItem, setEditingItem] = useState<{ subId: string, item: any } | null>(null);
    const [managedItem, setManagedItem] = useState<{ subId: string, item: any } | null>(null);
    const [editForm, setEditForm] = useState({ 
        name: '', 
        value: 0, 
        annualRate: 0,
        isPaid: false,
        isIgnored: false,
        isRecurring: false,
        recurrenceLimit: undefined as number | undefined,
        accountId: ''
    });
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});

    const openEditModal = (subId: string, item: any) => {
        setEditingItem({ subId, item });
        setEditForm({ 
            name: item.name, 
            value: item.value, 
            annualRate: item.annualRate || 0,
            isPaid: item.isPaid || false,
            isIgnored: item.isIgnored || false,
            isRecurring: item.isRecurring || false,
            recurrenceLimit: item.recurrenceLimit,
            accountId: item.accountId || ''
        });
    };
  
    const handleSaveEdit = () => {
        if (!editingItem || !onUpdateItem) return;
        
        const updates: any = {};
        if (editForm.name !== editingItem.item.name) updates.name = editForm.name;
        if (editForm.value !== editingItem.item.value) updates.value = editForm.value;
        if (editForm.annualRate !== (editingItem.item.annualRate || 0)) updates.annualRate = editForm.annualRate;
        if (editForm.isPaid !== (editingItem.item.isPaid || false)) updates.isPaid = editForm.isPaid;
        if (editForm.isIgnored !== (editingItem.item.isIgnored || false)) updates.isIgnored = editForm.isIgnored;
        if (editForm.isRecurring !== (editingItem.item.isRecurring || false)) updates.isRecurring = editForm.isRecurring;
        if (editForm.recurrenceLimit !== editingItem.item.recurrenceLimit) updates.recurrenceLimit = editForm.recurrenceLimit;
        if (editForm.accountId !== (editingItem.item.accountId || '')) updates.accountId = editForm.accountId;

        if (Object.keys(updates).length > 0) {
            onUpdateItem(editingItem.subId, editingItem.item.id, updates);
        }
        
        setEditingItem(null);
    };

    const toggleSelectItem = (subId: string, itemId: string) => {
        setSelectedItems(prev => {
            const current = prev[subId] || [];
            if (current.includes(itemId)) {
                return { ...prev, [subId]: current.filter(id => id !== itemId) };
            } else {
                return { ...prev, [subId]: [...current, itemId] };
            }
        });
    };

    const toggleSelectAll = (subId: string, items: any[]) => {
        setSelectedItems(prev => {
            const current = prev[subId] || [];
            if (current.length === items.length && items.length > 0) {
                return { ...prev, [subId]: [] };
            } else {
                return { ...prev, [subId]: items.map(i => i.id) };
            }
        });
    };

    const handleDeleteSelected = (subId: string) => {
        const ids = selectedItems[subId] || [];
        if (ids.length === 0) return;

        if (window.confirm(`Excluir ${ids.length} itens selecionados?`)) {
            onBulkItemDelete && onBulkItemDelete(subId, ids);
            setSelectedItems(prev => ({ ...prev, [subId]: [] }));
        }
    };

    const handleIgnoreSelected = (subId: string) => {
        const ids = selectedItems[subId] || [];
        if (ids.length === 0) return;

        onBulkItemIgnore && onBulkItemIgnore(subId, ids);
        setSelectedItems(prev => ({ ...prev, [subId]: [] }));
    };

    const handleUpdateSelectedAccount = (subId: string, accountId: string) => {
        const ids = selectedItems[subId] || [];
        if (ids.length === 0) return;
        if (onBulkItemUpdate) onBulkItemUpdate(subId, ids, { accountId });
        setSelectedItems(prev => ({ ...prev, [subId]: [] }));
    };

    const handleTogglePaidSelected = (subId: string, isPaid: boolean) => {
        const ids = selectedItems[subId] || [];
        if (ids.length === 0) return;
        if (onBulkItemUpdate) onBulkItemUpdate(subId, ids, { isPaid });
        setSelectedItems(prev => ({ ...prev, [subId]: [] }));
    };

    const handleAdjustSelectedValues = (subId: string, percent: number) => {
        const ids = selectedItems[subId] || [];
        if (ids.length === 0) return;

        if (onBulkItemUpdate) {
            onBulkItemUpdate(subId, ids, (item: any) => ({
                value: item.value * (1 + (percent / 100))
            }));
        }
        
        setSelectedItems(prev => ({ ...prev, [subId]: [] }));
    };

    const getHeaderColor = (bgClass: string) => {
        if (bgClass.includes('indigo')) return 'text-indigo-600 dark:text-indigo-400';
        if (bgClass.includes('rose')) return 'text-rose-600 dark:text-rose-400';
        if (bgClass.includes('emerald')) return 'text-emerald-600 dark:text-emerald-400';
        if (bgClass.includes('purple')) return 'text-purple-600 dark:text-purple-400';
        return 'text-slate-600 dark:text-slate-400';
    }

    const getCategoryIcon = (id: string) => {
        if (id.includes('Income')) return DollarSign;
        if (id.includes('Deductions')) return MinusCircle;
        if (id.includes('Basic') || id.includes('basic')) return Home;
        if (id.includes('Invest') || id.includes('invest')) return TrendingUp;
        if (id.includes('Variable') || id.includes('Cost')) return ShoppingCart;
        return FolderOpen;
    }

    const headerColorClass = getHeaderColor(category.headerColor);
    const IconComponent = getCategoryIcon(category.id);

    const budget = category.budget || 0;
    const progressPercentage = budget > 0 ? (total / budget) * 100 : 0;

    let progressColor = 'bg-emerald-500';
    if (progressPercentage > 100) progressColor = 'bg-rose-500';
    else if (progressPercentage > 85) progressColor = 'bg-amber-500';

    return (
        <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-all duration-300 w-full mb-6 relative">
            {/* Linha colorida indicativa no topo baseada na cor da categoria */}
            <div className={`absolute top-0 left-0 w-full h-1 ${category.headerColor} opacity-50`}></div>

            {/* Cabeçalho da Categoria */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 sm:mb-6 relative z-10 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${category.headerColor} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}>
                        <IconComponent size={20} className={headerColorClass} />
                    </div>
                    {isEditingTitle ? (
                        <textarea
                            autoFocus
                            value={category.title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => { 
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    setIsEditingTitle(false);
                                }
                            }}
                            className={`text-lg sm:text-xl font-black ${headerColorClass} uppercase tracking-tight bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full min-w-[150px] resize-none overflow-hidden`}
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className={`text-lg sm:text-xl font-black ${headerColorClass} uppercase tracking-tight flex items-center gap-2 cursor-pointer transition-all hover:opacity-80 group/title`}
                        >
                            {category.title}
                            <Edit2 size={13} className="opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-500" />
                        </h2>
                    )}
                </div>

                {/* Resumo de valores no cabeçalho */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-1.5 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none mb-1 text-left sm:text-right w-full">
                            Real vs {comparisonLabel || 'Planejado'}
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-xl sm:text-2xl font-black ${headerColorClass} leading-none`}>
                                {formatCurrency(realTotal)}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                / {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Meta</span>
                            {isEditingBudget ? (
                                <div className="flex items-center border-b-2 border-indigo-500 bg-slate-50 dark:bg-slate-800 rounded px-1 -my-1">
                                    <span className="text-[10px] text-slate-400 font-black mr-0.5" style={{fontSize: '9px'}}>R$</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={category.budget || ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            onBudgetChange(isNaN(val) ? 0 : val);
                                        }}
                                        onBlur={() => setIsEditingBudget(false)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingBudget(false); }}
                                        className="w-16 bg-transparent text-right text-xs font-black text-slate-700 dark:text-slate-200 focus:outline-none p-0 appearance-none"
                                    />
                                </div>
                            ) : (
                                <div
                                    onClick={() => setIsEditingBudget(true)}
                                    className="group/budget flex items-center gap-1 cursor-pointer"
                                >
                                    <span className={`text-[11px] font-black transition-colors ${budget > 0 && total > budget ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400 group-hover/budget:text-indigo-500'}`}>
                                        {budget ? formatCurrency(budget) : 'Definir'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {budget > 0 && !isEditingBudget && (
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden relative">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-indigo-500/20`}
                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                />
                                <div 
                                    className="h-full bg-emerald-500 absolute top-0 left-0 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                />
                            </div>
                        )}
                        {budget === 0 && (
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subcategorias */}
            <div className="space-y-4">
                {category.subCategories.length === 0 && (
                     <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                         Sem subcategorias
                     </div>
                )}
                {category.subCategories.map(sub => {
                    if (sub.name === 'Importados' && (!sub.items || sub.items.length === 0)) return null;

                    const subTotal = sub.items.reduce((acc, item) => acc + item.value, 0);

                    return (
                        <div key={sub.id} className="group/subcategory bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                            {/* Header da Subcategoria */}
                            {sub.name && (
                                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-y-3 px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 min-w-fit">
                                        {/* Collapse Toggle */}
                                        <button 
                                            onClick={() => toggleSubCollapse(sub.id)}
                                            className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-all flex-shrink-0"
                                        >
                                            {collapsedSubs[sub.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                        </button>

                                        {/* Select All Checkbox */}
                                        <div 
                                            onClick={() => toggleSelectAll(sub.id, sub.items)}
                                            className="cursor-pointer p-1"
                                            title="Selecionar todos"
                                        >
                                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                                (selectedItems[sub.id]?.length === sub.items.length && sub.items.length > 0)
                                                    ? 'bg-indigo-500 border-indigo-500' 
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                                            }`}>
                                                {(selectedItems[sub.id]?.length === sub.items.length && sub.items.length > 0) && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </div>

                                        {editingSubId === sub.id ? (
                                            <textarea
                                                autoFocus
                                                value={sub.name}
                                                onChange={(e) => onSubCategoryNameChange && onSubCategoryNameChange(sub.id, e.target.value)}
                                                onBlur={() => setEditingSubId(null)}
                                                onKeyDown={(e) => { 
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        setEditingSubId(null);
                                                    }
                                                }}
                                                className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-transparent border-b-2 border-indigo-400 focus:outline-none resize-none overflow-hidden"
                                                rows={1}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = 'auto';
                                                    target.style.height = target.scrollHeight + 'px';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                              <h4
                                                  onClick={() => setEditingSubId(sub.id)}
                                                  className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                              >
                                                  {getAnonymizedLabel(sub.name, isPedro)}
                                              </h4>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Tem certeza que deseja excluir "${sub.name}" e todos os seus itens?`)) {
                                                    onDeleteSubCategory && onDeleteSubCategory(sub.id);
                                                }
                                            }}
                                            className="opacity-0 group-hover/subcategory:opacity-100 transition-opacity p-1 text-slate-300 hover:text-rose-500"
                                            title="Excluir subcategoria"
                                        >
                                            <Trash2 size={11} strokeWidth={3} />
                                        </button>
                                    </div>
                                    
                                        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                                            {(selectedItems[sub.id]?.length || 0) > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBulkModalData({ subId: sub.id, count: selectedItems[sub.id].length });
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/50 animate-bounce-subtle"
                                                >
                                                    <Zap size={12} fill="currentColor" />
                                                    Ações ({selectedItems[sub.id].length})
                                                </button>
                                            )}
                                            <span className={`flex-shrink-0 text-[11px] font-black ${headerColorClass} bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md shadow-sm border border-transparent dark:border-slate-700/50`}>
                                                {formatCurrency(subTotal)}
                                            </span>
                                        </div>
                                </div>
                                )}

                                {/* Lista de Itens */}
                            {!collapsedSubs[sub.id] && (
                                <div className="p-1.5 space-y-0.5 animate-fadeIn">
                                    {sub.items.map(item => (
                                        <EditableRow
                                            key={item.id}
                                            label={item.name}
                                            value={item.value}
                                            isRecurring={item.isRecurring}
                                            annualRate={item.annualRate}
                                            isPaid={item.isPaid}
                                            isIgnored={item.isIgnored}
                                            onEditClick={() => openEditModal(sub.id, item)}
                                            onDelete={() => onItemDelete(sub.id, item.id)}
                                            onToggleRecurring={() => onItemRecurringToggle(sub.id, item.id)}
                                            onTogglePaid={() => onItemPaidToggle(sub.id, item.id)}
                                            onToggleIgnored={() => onItemIgnoreToggle(sub.id, item.id)}
                                            onUpdate={(updates) => onUpdateItem?.(sub.id, item.id, updates)}
                                            onShowManagement={() => setManagedItem({ subId: sub.id, item })}
                                            isSelected={selectedItems[sub.id]?.includes(item.id)}
                                            onSelectToggle={() => toggleSelectItem(sub.id, item.id)}
                                            accountColor={item.accountId ? accounts.find(a => a.id === item.accountId)?.color : undefined}
                                            accountName={item.accountId ? accounts.find(a => a.id === item.accountId)?.name : undefined}
                                        />
                                    ))}

                                    {/* Botão Novo Item */}
                                    <button
                                        onClick={() => onItemAdd(sub.id)}
                                        className="w-full mt-1.5 py-2.5 px-3 flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all group/add uppercase tracking-widest border border-transparent border-dashed hover:border-slate-200 dark:hover:border-slate-700/50"
                                    >
                                        <Plus size={12} strokeWidth={3} className="group-hover/add:scale-125 transition-transform text-slate-300 group-hover/add:text-indigo-500" />
                                        Adicionar Item
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
                   {/* Modal de Edição de Item Premium Imersivo */}
            <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)}>
              <div className="relative w-[95vw] max-w-lg bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl flex flex-col max-h-[95vh] rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800/50">
                
                {/* Decorative Element - Brilho igual ao menu de gestão */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                
                {/* Header Imersivo - Estilo Sidebar/Gestão */}
                <div className="relative p-6 sm:p-8 pb-4 sm:pb-5 border-b border-slate-200/50 dark:border-slate-800/50 z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl shadow-xl transition-all ${
                        editForm.isPaid 
                          ? 'bg-emerald-500 shadow-emerald-500/20' 
                          : 'bg-indigo-600 shadow-indigo-500/20'
                      }`}>
                        <Edit2 size={20} className="text-white" />
                      </div>
                      <div>
                        <h1 className="font-black text-lg tracking-tighter text-slate-900 dark:text-white leading-none">Edição</h1>
                        <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">{category.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm transition-colors ${
                        editForm.isPaid 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                          : 'bg-indigo-500 text-white shadow-indigo-500/20'
                      }`}>
                        {editForm.isPaid ? 'Confirmado' : 'Aberto'}
                      </div>
                      <button 
                        onClick={() => setEditingItem(null)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 transition-all active:scale-90"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                 
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-6 scroll-smooth bg-transparent no-scrollbar">
                    {/* Descrição */}
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Descrição</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                                placeholder="Ex: Aluguel, Supermercado..."
                            />
                        </div>
                    </div>
                    
                    {/* Valores e Taxas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                                <input
                                    type="number"
                                    value={editForm.value || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
                                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                        
                        {editingItem?.item.annualRate !== undefined ? (
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Taxa Anual (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={editForm.annualRate || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, annualRate: parseFloat(e.target.value) || 0 }))}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); }}
                                        className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-3 text-sm font-black text-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                           <div className="group">
                              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Estado</label>
                              <button
                                  onClick={() => setEditForm(prev => ({ ...prev, isPaid: !prev.isPaid }))}
                                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${
                                      editForm.isPaid 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                                  }`}
                              >
                                  {editForm.isPaid ? <CheckCircle2 size={14} fill="currentColor" /> : <Circle size={14} />}
                                  <span className="text-[9px] font-black uppercase tracking-widest">{editForm.isPaid ? 'Pago' : 'Pendente'}</span>
                              </button>
                           </div>
                        )}
                    </div>

                    {/* Controles Rápidos Premium */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setEditForm(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${
                                editForm.isRecurring 
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                        >
                            <Repeat size={14} className={editForm.isRecurring ? 'animate-spin-slow' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Recorrente</span>
                        </button>

                        <button
                            onClick={() => setEditForm(prev => ({ ...prev, isIgnored: !prev.isIgnored }))}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${
                                editForm.isIgnored 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                        >
                            <span className="material-symbols-rounded text-[16px] leading-none">
                                {editForm.isIgnored ? 'visibility_off' : 'visibility'}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest">{editForm.isIgnored ? 'Ignorado' : 'Contabilizar'}</span>
                        </button>
                    </div>

                    {/* Detalhes da Recorrência */}
                    {editForm.isRecurring && (
                        <div className="bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/10 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="number"
                                        placeholder="∞ meses"
                                        value={editForm.recurrenceLimit || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, recurrenceLimit: parseInt(e.target.value) || undefined }))}
                                        className="w-full bg-white dark:bg-slate-800 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight">
                                    {editForm.recurrenceLimit ? (
                                        <span>Repetir por <span className="text-indigo-500">{editForm.recurrenceLimit} meses</span></span>
                                    ) : (
                                        <span>Recorrência <span className="text-emerald-500">Infinita</span></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seleção de Conta */}
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 px-1">Conta de Origem</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {accounts.map(account => (
                                <button
                                    key={account.id}
                                    onClick={() => setEditForm(prev => ({ ...prev, accountId: account.id }))}
                                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all active:scale-95 ${
                                        editForm.accountId === account.id
                                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/10'
                                        : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                                    }`}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: account.color }} />
                                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate uppercase tracking-tighter">{account.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>

                 {/* Footer Imersivo */}
                 <div className="px-6 sm:px-8 pb-8 pt-4 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (editingItem && window.confirm('Excluir este item permanentemente?')) {
                                    onItemDelete(editingItem.subId, editingItem.item.id);
                                    setEditingItem(null);
                                }
                            }}
                            className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100 dark:border-rose-800/30"
                            title="Excluir Item"
                        >
                            <Trash2 size={20} />
                        </button>

                        <button
                            onClick={handleSaveEdit}
                            className="flex-1 flex justify-center items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4.5 px-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest text-xs"
                        >
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </div>
                 </div>
              </div>
            </Modal>

            {/* Overlay de Gestão Imersiva */}
            {managedItem && (
              <ItemManagementOverlay
                item={{
                  ...managedItem.item,
                  subCategoryId: managedItem.subId,
                  category: category.title,
                  accountName: managedItem.item.accountId ? accounts.find(a => a.id === managedItem.item.accountId)?.name : undefined,
                  accountColor: managedItem.item.accountId ? accounts.find(a => a.id === managedItem.item.accountId)?.color : undefined,
                }}
                onClose={() => setManagedItem(null)}
                onEdit={() => {
                  const { subId, item } = managedItem;
                  setManagedItem(null);
                  openEditModal(subId, item);
                }}
                onToggleRecurring={() => onItemRecurringToggle(managedItem.subId, managedItem.item.id)}
                onToggleIgnored={() => onItemIgnoreToggle(managedItem.subId, managedItem.item.id)}
                onDelete={() => {
                  if (window.confirm('Excluir este item permanentemente?')) {
                    onItemDelete(managedItem.subId, managedItem.item.id);
                    setManagedItem(null);
                  }
                }}
                onTogglePaid={() => onItemPaidToggle(managedItem.subId, managedItem.item.id)}
              />
            )}

            {/* Modal de Ações em Massa Premium */}
            <Modal isOpen={!!bulkModalData} onClose={() => setBulkModalData(null)}>
                <div className="relative w-[95vw] max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-slideUp">
                    {/* Header do Modal */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                                <Zap size={18} className="text-white" fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-800 dark:text-white leading-none">Ações em Massa</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {bulkModalData?.count} itens selecionados
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setBulkModalData(null)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-500 transition-all border border-slate-100 dark:border-slate-600"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Conteúdo do Modal */}
                    <div className="p-6 space-y-6">
                        {/* Ação Principal: Pago/Recebido */}
                        <button
                            onClick={() => {
                                if (bulkModalData) handleTogglePaidSelected(bulkModalData.subId, true);
                                setBulkModalData(null);
                            }}
                            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                        >
                            <CheckCircle2 size={20} />
                            {category.id.includes('Income') ? 'Marcar como Recebido' : 'Marcar como Pago'}
                        </button>

                        {/* Status e Exclusão */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    if (bulkModalData) handleIgnoreSelected(bulkModalData.subId);
                                    setBulkModalData(null);
                                }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 transition-all group"
                            >
                                <EyeOff size={20} className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 tracking-widest">Alternar Ignorar</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (bulkModalData) handleDeleteSelected(bulkModalData.subId);
                                    setBulkModalData(null);
                                }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 transition-all group"
                            >
                                <Trash2 size={20} className="text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300 tracking-widest">Excluir Tudo</span>
                            </button>
                        </div>

                        {/* Mudar Conta */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <CreditCard size={12} />
                                Mover para Conta
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {accounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        onClick={() => {
                                            if (bulkModalData) handleUpdateSelectedAccount(bulkModalData.subId, acc.id);
                                            setBulkModalData(null);
                                        }}
                                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500/50 transition-all text-left"
                                    >
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color }} />
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{acc.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reajuste de Valor */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Plus size={12} />
                                Reajuste Rápido
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 10, -5, -10].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            if (bulkModalData) handleAdjustSelectedValues(bulkModalData.subId, val);
                                            setBulkModalData(null);
                                        }}
                                        className={`p-3 rounded-xl font-black text-xs transition-all border ${
                                            val > 0 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100' 
                                                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                        }`}
                                    >
                                        {val > 0 ? '+' : ''}{val}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => setBulkModalData(null)}
                            className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Cancelar Operação
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
