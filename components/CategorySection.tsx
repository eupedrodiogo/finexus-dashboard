
import React, { useState } from 'react';
import { Category, Account } from '../types';
import { EditableRow } from './EditableRow';

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
    isEditable: boolean;
    monthlyContributions?: number;
    accounts?: Account[];
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
    onBudgetChange,
    onRateChange,
    onSubCategoryNameChange,
    onDeleteSubCategory,
    accounts = []
}) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingSubId, setEditingSubId] = useState<string | null>(null);

    // Dynamic header color mapping to Tailwind text classes
    const getHeaderColor = (bgClass: string) => {
        if (bgClass.includes('indigo')) return 'text-indigo-600';
        if (bgClass.includes('rose')) return 'text-rose-600';
        if (bgClass.includes('emerald')) return 'text-emerald-600';
        if (bgClass.includes('purple')) return 'text-purple-600';
        return 'text-slate-600';
    }

    const getCategoryIcon = (id: string) => {
        if (id.includes('Income')) return 'payments';
        if (id.includes('Deductions')) return 'remove_circle';
        if (id.includes('Basic') || id.includes('basic')) return 'home';
        if (id.includes('Invest') || id.includes('invest')) return 'trending_up';
        if (id.includes('Variable') || id.includes('Cost')) return 'shopping_cart';
        return 'category';
    }

    const headerColorClass = getHeaderColor(category.headerColor);
    const icon = getCategoryIcon(category.id);

    // Budget Progress Logic
    const budget = category.budget || 0;
    const progressPercentage = budget > 0 ? (total / budget) * 100 : 0;

    let progressColor = 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (progressPercentage > 100) progressColor = 'bg-gradient-to-r from-rose-400 to-rose-500';
    else if (progressPercentage > 85) progressColor = 'bg-gradient-to-r from-amber-400 to-amber-500';

    return (
        <div className="glass-card rounded-3xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4 group/header">
                <div className="flex-1 mr-4 mt-1 flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${category.headerColor} bg-opacity-10 dark:bg-opacity-20`}>
                        <span className={`material-symbols-rounded notranslate text-xl ${headerColorClass}`}>{icon}</span>
                    </div>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            autoFocus
                            value={category.title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                            className={`text-xl font-bold ${headerColorClass} uppercase tracking-wide bg-transparent border-b border-indigo-500 focus:outline-none w-full`}
                        />
                    ) : (
                        <h2
                            onClick={() => setIsEditingTitle(true)}
                            className={`text-xl font-bold ${headerColorClass} uppercase tracking-wide flex items-center gap-2 cursor-pointer transition-all hover:opacity-80`}
                            title="Clique para editar o nome da categoria"
                        >
                            {category.title}
                            <span className="material-symbols-rounded notranslate text-base opacity-0 group-hover/header:opacity-40 transition-opacity">edit</span>
                        </h2>
                    )}
                </div>

                <div className="text-right flex flex-col items-end">
                    <span className="block text-xs text-slate-400 font-medium uppercase">Total</span>
                    <span className={`text-lg font-bold ${headerColorClass}`}>{formatCurrency(total)}</span>

                    <div className="flex items-center justify-end gap-2 mt-1 min-h-[24px]">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta</span>
                        {isEditingBudget ? (
                            <div className="flex items-center border-b-2 border-indigo-500 bg-white/50 dark:bg-slate-800/50 rounded px-1">
                                <span className="text-xs text-slate-500 mr-1">R$</span>
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
                                    className="w-20 bg-transparent text-right text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none p-0 appearance-none"
                                    placeholder="0,00"
                                />
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsEditingBudget(true)}
                                className="group/budget flex items-center gap-2 cursor-pointer"
                                title="Clique para definir o orçamento"
                            >
                                <span className={`text-xs font-medium transition-colors ${budget > 0 && total > budget ? 'text-rose-500 font-bold' : 'text-slate-400 group-hover/budget:text-indigo-600'}`}>
                                    {budget ? formatCurrency(budget) : 'Definir'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Indicator */}
                    {budget > 0 && !isEditingBudget && (
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progressColor}`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                title={`${progressPercentage.toFixed(0)}% da meta`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {category.subCategories.map(sub => {
                    // Automatically hide 'Importados' if empty
                    if (sub.name === 'Importados' && (!sub.items || sub.items.length === 0)) return null;

                    return (
                        <div key={sub.id} className="group/subcategory">
                            {sub.name && (
                                <div className="flex justify-between items-end mb-3 pl-1 border-b border-slate-100 dark:border-slate-800/50 pb-1 relative">
                                    <div className="flex items-center gap-2">
                                        {editingSubId === sub.id ? (
                                            <input
                                                type="text"
                                                autoFocus
                                                value={sub.name}
                                                onChange={(e) => onSubCategoryNameChange && onSubCategoryNameChange(sub.id, e.target.value)}
                                                onBlur={() => setEditingSubId(null)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') setEditingSubId(null); }}
                                                className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-transparent border-b border-indigo-300 focus:outline-none"
                                            />
                                        ) : (
                                            <h4
                                                onClick={() => setEditingSubId(sub.id)}
                                                className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-500"
                                                title="Clique para editar"
                                            >
                                                {sub.name}
                                            </h4>
                                        )}
                                        {/* Delete Subcategory Button */}
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Tem certeza que deseja excluir a subcategoria "${sub.name}" e todos os seus itens?`)) {
                                                    onDeleteSubCategory && onDeleteSubCategory(sub.id);
                                                }
                                            }}
                                            className="opacity-0 group-hover/subcategory:opacity-100 transition-opacity p-0.5 text-slate-300 hover:text-rose-500"
                                            title="Excluir subcategoria"
                                        >
                                            <span className="material-symbols-rounded notranslate text-sm">delete</span>
                                        </button>
                                    </div>
                                    <span className={`text-xs font-bold ${headerColorClass} opacity-80`}>
                                        {formatCurrency(sub.items.reduce((acc, item) => acc + item.value, 0))}
                                    </span>
                                </div>
                            )}
                            <div className="space-y-1">
                                {sub.items.map(item => (
                                    <EditableRow
                                        key={item.id}
                                        label={item.name}
                                        value={item.value}
                                        isRecurring={item.isRecurring}
                                        annualRate={item.annualRate}
                                        isPaid={item.isPaid}
                                        onChange={(val) => onItemChange(sub.id, item.id, val)}
                                        onNameChange={(val) => onItemNameChange(sub.id, item.id, val)}
                                        onRateChange={(val) => onRateChange(sub.id, item.id, val)}
                                        onDelete={() => onItemDelete(sub.id, item.id)}
                                        onToggleRecurring={() => onItemRecurringToggle(sub.id, item.id)}
                                        onTogglePaid={() => onItemPaidToggle(sub.id, item.id)}
                                        accountColor={item.accountId ? accounts.find(a => a.id === item.accountId)?.color : undefined}
                                        accountName={item.accountId ? accounts.find(a => a.id === item.accountId)?.name : undefined}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => onItemAdd(sub.id)}
                                className="mt-3 w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-400 hover:text-indigo-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-center gap-2 group/add"
                            >
                                <span className="material-symbols-rounded notranslate text-lg group-hover/add:scale-110 transition-transform">add_circle</span>
                                Adicionar Item
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
