import React, { useState } from 'react';
import { CreditCard, FinancialData, LineItem } from '../types';

interface CreditCardsViewProps {
    cards: CreditCard[];
    onUpdateCards: (cards: CreditCard[]) => void;
    allData: Record<string, FinancialData>;
    currentMonth: string;
}

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({ cards, onUpdateCards, allData, currentMonth }) => {
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    // ... existing state ...
    const [newCardName, setNewCardName] = useState('');
    const [newCardDueDay, setNewCardDueDay] = useState(10);
    const [newCardClosingDay, setNewCardClosingDay] = useState(3);
    const [newCardColor, setNewCardColor] = useState('bg-slate-800');
    const [isAddingCard, setIsAddingCard] = useState(false);

    const CARD_COLORS = [
        { class: 'bg-slate-800', label: 'Preto' },
        { class: 'bg-indigo-600', label: 'Roxo' },
        { class: 'bg-rose-600', label: 'Vermelho' },
        { class: 'bg-emerald-600', label: 'Verde' },
        { class: 'bg-amber-500', label: 'Gold' },
        { class: 'bg-sky-500', label: 'Azul' },
        { class: 'bg-pink-500', label: 'Rosa' },
    ];

    const handleAddCard = () => {
        if (!newCardName) return;
        const newCard: CreditCard = {
            id: `card-${Date.now()}`,
            name: newCardName,
            color: newCardColor,
            dueDay: newCardDueDay,
            closingDay: newCardClosingDay
        };
        onUpdateCards([...cards, newCard]);
        setNewCardName('');
        setIsAddingCard(false);
    };

    const handleDeleteCard = (id: string) => {
        if (window.confirm('Excluir este cartão?')) {
            onUpdateCards(cards.filter(c => c.id !== id));
        }
    };

    const getMonthLabel = (dateString: string) => {
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedMonth(date.toISOString().slice(0, 7));
    };

    const getInvoiceData = (cardId: string) => {
        const monthData = allData[selectedMonth];
        if (!monthData) return { total: 0, items: [] };

        let total = 0;
        let items: LineItem[] = [];

        Object.values(monthData).forEach(category => {
            category.subCategories.forEach(sub => {
                sub.items.forEach(item => {
                    if (item.cardId === cardId) {
                        total += item.value;
                        items.push({ ...item, categoryName: category.name, subCategoryName: sub.name } as any);
                    }
                });
            });
        });

        return { total, items };
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-24">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Faturas do Cartão</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe seus gastos e limites.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <span className="material-symbols-rounded">chevron_left</span>
                    </button>
                    <span className="font-bold text-slate-700 dark:text-white min-w-[140px] text-center capitalize">
                        {getMonthLabel(selectedMonth)}
                    </span>
                    <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <span className="material-symbols-rounded">chevron_right</span>
                    </button>
                </div>

                <button
                    onClick={() => setIsAddingCard(!isAddingCard)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <span className="material-symbols-rounded notranslate">add_card</span>
                    {isAddingCard ? 'Cancelar' : 'Novo Cartão'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Card Form Card */}
                {isAddingCard && (
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-indigo-500/20 space-y-4 animate-scaleIn">
                        <h3 className="font-black text-slate-700 dark:text-white">Novo Cartão</h3>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                            <input
                                type="text"
                                value={newCardName}
                                onChange={(e) => setNewCardName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex: Nubank"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Vencimento</label>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    value={newCardDueDay}
                                    onChange={(e) => setNewCardDueDay(parseInt(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Fechamento</label>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    value={newCardClosingDay}
                                    onChange={(e) => setNewCardClosingDay(parseInt(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cor do Cartão</label>
                            <div className="flex flex-wrap gap-3">
                                {CARD_COLORS.map(color => (
                                    <button
                                        key={color.class}
                                        onClick={() => setNewCardColor(color.class)}
                                        className={`w-8 h-8 rounded-full ${color.class} transition-all ${newCardColor === color.class ? 'ring-4 ring-slate-200 dark:ring-slate-700 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAddCard}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                        >
                            Salvar
                        </button>
                    </div>
                )}

                {/* Existing Cards */}
                {cards.map(card => {
                    const { total, items } = getInvoiceData(card.id);
                    const isExpanded = expandedCard === card.id;

                    return (
                        <div key={card.id} className="relative group flex flex-col transition-all duration-500">
                            {/* Card Visual */}
                            <div
                                onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                                className={`cursor-pointer overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 z-10 ${isExpanded ? 'ring-4 ring-indigo-500/20' : ''}`}
                            >
                                <div className={`h-32 ${card.color} p-6 relative overflow-hidden flex flex-col justify-between`}>
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                    <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

                                    <div className="flex justify-between items-start z-10">
                                        <span className="material-symbols-rounded text-white/80 text-3xl">contactless</span>
                                        <div className="text-right">
                                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Fatura Atual</p>
                                            <p className="text-white font-black text-2xl tracking-tight">
                                                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end z-10 text-white">
                                        <h3 className="font-black text-xl tracking-tight">{card.name}</h3>
                                        <div className="flex items-center gap-1 text-white/80 text-xs font-bold bg-black/20 px-2 py-1 rounded-lg">
                                            <span>Vence dia {card.dueDay}</span>
                                            {isExpanded ?
                                                <span className="material-symbols-rounded text-sm">keyboard_arrow_up</span> :
                                                <span className="material-symbols-rounded text-sm">keyboard_arrow_down</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details (Accordion) */}
                            <div className={`
                                overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl mx-2 border-x border-b border-slate-200 dark:border-slate-700
                                ${isExpanded ? 'max-h-[500px] opacity-100 shadow-inner' : 'max-h-0 opacity-0'}
                            `}>
                                <div className="p-4 space-y-3">
                                    {items.length === 0 ? (
                                        <p className="text-center text-slate-400 text-xs py-4">Nenhuma compra nesta fatura.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {items.map((item, idx) => (
                                                <div key={item.id || idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                            <span className="material-symbols-rounded text-sm notranslate">
                                                                {item.installments ? 'calendar_month' : 'credit_card'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-white leading-tight">{item.name}</p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {(item as any).subCategoryName}
                                                                {item.installments && ` • Parcelas ${item.installments.current}/${item.installments.total}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 dark:text-white">
                                                        {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="text-rose-500 hover:text-rose-600 text-xs font-bold uppercase flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-sm">delete</span>
                                            Excluir Cartão
                                        </button>

                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Fechamento</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-white">Dia {card.closingDay}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {cards.length === 0 && !isAddingCard && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-rounded text-6xl text-slate-300 mb-4">credit_card</span>
                    <p className="text-slate-500 font-bold">Nenhum cartão cadastrado</p>
                    <p className="text-xs text-slate-400 mt-1">Clique em "Novo Cartão" para começar a organizar.</p>
                </div>
            )}
        </div>
    );
};
