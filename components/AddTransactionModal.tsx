import React, { useState, useEffect } from 'react';
import { CreditCard, FinancialData, Account } from '../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData: FinancialData;
    onAddTransaction: (transaction: NewTransactionData) => void;
}

export interface NewTransactionData {
    description: string;
    amount: number;
    categoryId: string; // "payslipIncome" | "basicExpenses" | ...
    subCategoryId: string; // Specific subcategory ID
    paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
    cardId?: string;
    accountId?: string;
    installments?: number;
    date: Date;
    isRecurring?: boolean;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, currentData, onAddTransaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('additionalVariableCosts'); // Default to variable costs
    const [subCategoryId, setSubCategoryId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('debit');
    const [cardId, setCardId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [installments, setInstallments] = useState(1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(false);

    // Initial load logic to set a default subcategory if available
    useEffect(() => {
        if (isOpen && !subCategoryId) {
            const cat = currentData[categoryId as keyof FinancialData];
            if (cat && cat.subCategories.length > 0) {
                setSubCategoryId(cat.subCategories[0].id);
            }
        }
    }, [isOpen, categoryId, currentData]);

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setDescription('');
            setAmount('');
            setPaymentMethod('debit');
            setAccountId('');
            setInstallments(1);
            setIsRecurring(false);
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!description || !amount || !subCategoryId) return;

        onAddTransaction({
            description,
            amount: parseFloat(amount.replace(',', '.')), // Handle PT-BR decimal
            categoryId,
            subCategoryId,
            paymentMethod,
            cardId: paymentMethod === 'credit' ? cardId : undefined,
            accountId: paymentMethod !== 'credit' ? accountId : undefined,
            installments: paymentMethod === 'credit' ? installments : undefined,
            date: new Date(date),
            isRecurring
        });
        onClose();
    };

    const categories = [
        { id: 'additionalVariableCosts', label: 'Despesas Variáveis' },
        { id: 'basicExpenses', label: 'Despesas Fixas' },
        { id: 'payslipIncome', label: 'Receitas' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Novo Lançamento</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor</label>
                        <div className="relative mt-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl pl-12 pr-4 py-4 text-3xl font-black text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:outline-none border-2 border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descrição (ex: Almoço, Uber...)"
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:font-medium"
                    />

                    {/* Category Selection */}
                    <div className="flex gap-2">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-3 font-bold text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>

                        <select
                            value={subCategoryId}
                            onChange={(e) => setSubCategoryId(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-3 font-bold text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {currentData[categoryId as keyof FinancialData]?.subCategories.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex">
                        {['debit', 'credit'].map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method as any)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === method
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {method === 'debit' ? 'Débito / Dinheiro' : 'Cartão de Crédito'}
                            </button>
                        ))}
                    </div>

                    {/* Credit Card Specifics */}
                    {paymentMethod === 'credit' && (
                        <div className="space-y-3 animate-fadeIn">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Selecione o Cartão</label>
                                <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
                                    {(currentData.cards || []).map(card => (
                                        <button
                                            key={card.id}
                                            onClick={() => setCardId(card.id)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${cardId === card.id
                                                ? `border-${card.color.replace('bg-', '')} bg-slate-50 dark:bg-slate-800`
                                                : 'border-transparent bg-slate-50 dark:bg-slate-800 opacity-60'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${card.color}`}></div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-white">{card.name}</span>
                                        </button>
                                    ))}
                                    {(currentData.cards || []).length === 0 && (
                                        <p className="text-xs text-rose-500 font-bold px-2">Nenhum cartão cadastrado!</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Parcelas</label>
                                    <select
                                        value={installments}
                                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 font-bold text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}x {installments > 1 && amount ? `(R$ ${(parseFloat(amount.replace(',', '.')) / (i + 1)).toFixed(2)})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data da Compra</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 font-bold text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Debit/Account Specifics */}
                    {paymentMethod !== 'credit' && (
                        <div className="space-y-3 animate-fadeIn">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Selecione a Conta</label>
                                <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
                                    {(currentData.accounts || []).map(account => (
                                        <button
                                            key={account.id}
                                            onClick={() => setAccountId(account.id)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${accountId === account.id
                                                ? `border-indigo-500 bg-indigo-50 dark:bg-slate-800`
                                                : 'border-slate-200 dark:border-slate-700 bg-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${account.color || 'bg-slate-400'}`}></div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-white">{account.name}</span>
                                        </button>
                                    ))}
                                    {(currentData.accounts || []).length === 0 && (
                                        <div className="text-xs text-slate-400 font-medium px-2 py-2 w-full text-center border-dashed border border-slate-300 rounded-lg">
                                            Nenhuma conta cadastrada.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data da Transação</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 font-bold text-sm text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button 
                                    onClick={() => setIsRecurring(!isRecurring)} 
                                    className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${isRecurring ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}
                                >
                                    {isRecurring && <span className="material-symbols-rounded text-white text-sm font-black">check</span>}
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 dark:text-white leading-tight">Lançamento Recorrente</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Repetirá este lançamento nos próximos meses</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!amount || !description || (paymentMethod === 'credit' && !cardId)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
};
