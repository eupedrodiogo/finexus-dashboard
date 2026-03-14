
import React, { useMemo } from 'react';
import { FinancialData, Category } from '../types';
import { CategorySection } from './CategorySection';
import { ConfirmationModal } from './ConfirmationModal';
import { TransactionHistory, Transaction } from './TransactionHistory';
import { ImportModal } from './ImportModal';
import { checkPendingShare } from '../services/shareService';
import { MonthNavigator } from './MonthNavigator';
import { useState, useEffect } from 'react';

interface MonthlyViewProps {
    data: FinancialData;
    totals: any;
    detailedChartData: any;
    monthlyInvestmentContributions: number;
    handleValueChange: any;
    handleNameChange: any;
    handleCategoryTitleChange: any;
    handleBudgetChange: any;
    handleRateChange: any;
    handleAddItem: any;
    handleDeleteItem: any;
    handleToggleRecurring: any;
    handleTogglePaid: any;
    itemToDelete: any;
    onConfirmDelete: any;
    onCancelDelete: any;
    onImport?: (data: any) => void;
    handleSubCategoryNameChange?: (categoryId: string, subCategoryId: string, newName: string) => void;
    handleDeleteSubCategory?: (categoryId: string, subCategoryId: string) => void;
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
    data,
    totals,
    handleValueChange,
    handleNameChange,
    handleCategoryTitleChange,
    handleBudgetChange,
    handleRateChange,
    handleAddItem,
    handleDeleteItem,
    handleToggleRecurring,
    handleTogglePaid,
    itemToDelete,
    onConfirmDelete,
    onCancelDelete,
    onImport,
    handleSubCategoryNameChange,
    handleDeleteSubCategory,
    currentMonth,
    onPreviousMonth,
    onNextMonth
}) => {
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    useEffect(() => {
        const checkShare = async () => {
            const file = await checkPendingShare(); // This clears the file from IDB after reading
            if (file) {
                setPendingFile(file);
                setIsImportModalOpen(true);
            }
        };
        // Check on mount and maybe when visibility changes
        checkShare();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkShare();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Helper to extract transactions from hierarchical data
    const allTransactions: Transaction[] = useMemo(() => {
        const txs: Transaction[] = [];
        const processCategory = (category: Category, type: Transaction['type'], prefix: string = '') => {
            if (!category || !category.subCategories) return;
            category.subCategories.forEach(sub => {
                sub.items.forEach(item => {
                    if (item.value > 0) {
                        txs.push({
                            id: item.id,
                            name: item.name,
                            value: item.value,
                            category: sub.name ? `${category.title} > ${sub.name}` : category.title,
                            type: type,
                            date: item.date
                        });
                    }
                });
            });
        };

        processCategory(data.payslipIncome, 'income');
        processCategory(data.payslipDeductions, 'expense');
        processCategory(data.basicExpenses, 'expense');
        processCategory(data.additionalVariableCosts, 'expense');
        processCategory(data.investments, 'investment');

        return txs.sort((a, b) => b.value - a.value);
    }, [data]);

    // Helper to render sections
    const renderSection = (category: any, total: number) => (
        <CategorySection
            category={category}
            total={total}
            onItemChange={(subId, itemId, val) => handleValueChange(category.id, subId, itemId, val)}
            onItemNameChange={(subId, itemId, val) => handleNameChange(category.id, subId, itemId, val)}
            onItemAdd={(subId) => handleAddItem(category.id, subId)}
            onItemDelete={(subId, itemId) => handleDeleteItem(category.id, subId, itemId)}
            onTitleChange={(val) => handleCategoryTitleChange(category.id, val)}
            onBudgetChange={(val) => handleBudgetChange(category.id, val)}
            onRateChange={(subId, itemId, val) => handleRateChange(category.id, subId, itemId, val)}
            onItemRecurringToggle={(subId, itemId) => handleToggleRecurring(category.id, subId, itemId)}
            onItemPaidToggle={(subId, itemId) => handleTogglePaid(category.id, subId, itemId)}
            isEditable={true}
            onSubCategoryNameChange={(subId, newName) => handleSubCategoryNameChange && handleSubCategoryNameChange(category.id, subId, newName)}
            onDeleteSubCategory={(subId) => handleDeleteSubCategory && handleDeleteSubCategory(category.id, subId)}
            accounts={data.accounts}
        />
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Actions Header */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-bold text-sm"
                >
                    <span className="material-symbols-rounded">upload_file</span>
                    Importar
                </button>
            </div>

            {/* Month Summary Header (Sticky) */}
            <div id="month-view-header" className="sticky top-0 z-30 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-around items-center gap-6">
                {/* Embedded Month Navigator for Mobile/Sticky Context */}
                <div className="w-full md:w-auto border-b border-slate-100 dark:border-slate-700 pb-4 md:border-b-0 md:pb-0">
                    <MonthNavigator
                        currentMonth={currentMonth}
                        onPrevious={onPreviousMonth}
                        onNext={onNextMonth}
                    />
                </div>
                <div className="flex gap-10 flex-wrap justify-center md:flex-nowrap w-full md:w-auto mt-4 md:mt-0 px-4">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Inicial</p>
                        <p className="text-xl font-bold text-slate-600 dark:text-slate-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.previousBalance || 0)}</p>
                    </div>
                    <div className="text-center relative px-4 border-l border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Entradas</p>
                        <div className="flex flex-col items-center">
                            <p className="text-xl font-bold text-indigo-600" title="Valor Realizado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.realGrossIncome || 0)}
                                <span className="text-[10px] text-slate-400 ml-1 font-semibold uppercase">Real</span>
                            </p>
                            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-0.5" title="Valor Projetado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.grossIncome || 0)}
                                <span className="text-[9px] text-slate-300 ml-1 uppercase">Proj</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-center relative px-4 border-l border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saídas</p>
                        <div className="flex flex-col items-center">
                            <p className="text-xl font-bold text-rose-500" title="Valor Realizado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((totals.realTotalExpenses || 0) + (totals.realDeductions || 0) + (totals.realInvest || 0))}
                                <span className="text-[10px] text-slate-400 ml-1 font-semibold uppercase">Real</span>
                            </p>
                            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-0.5" title="Valor Projetado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((totals.totalExpenses || 0) + (totals.deductions || 0) + (totals.investments || 0))}
                                <span className="text-[9px] text-slate-300 ml-1 uppercase">Proj</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-center relative px-4 border-l border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Final</p>
                        <div className="flex flex-col items-center">
                            <p className={`text-xl font-bold ${(totals.realBalance || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} title="Valor Realizado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.realBalance || 0)}
                                <span className="text-[10px] text-slate-400 ml-1 font-semibold uppercase">Real</span>
                            </p>
                            <p className={`text-sm font-semibold mt-0.5 ${(totals.balance || 0) >= 0 ? 'text-emerald-600/60 dark:text-emerald-500/60' : 'text-rose-600/60 dark:text-rose-500/60'}`} title="Valor Projetado">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.balance || 0)}
                                <span className="text-[9px] ml-1 uppercase">Proj</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="month-view-details" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Categorized Editors */}
                <div className="lg:col-span-2 space-y-8">
                    {renderSection(data.payslipIncome, totals.grossIncome)}
                    {renderSection(data.payslipDeductions, totals.deductions)}
                    {renderSection(data.basicExpenses, totals.basicExpenses)}
                    {renderSection(data.additionalVariableCosts, totals.additionalVariableCosts)}
                    {renderSection(data.investments, totals.investments)}
                </div>

                {/* Right Column: Transaction History Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6">
                        <TransactionHistory transactions={allTransactions} />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={onCancelDelete}
                onConfirm={onConfirmDelete}
                title="Excluir Item"
                message="Tem certeza? Isso afetará os cálculos deste mês."
            />

            {/* Import Modal */}
            {isImportModalOpen && (
                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => {
                        setIsImportModalOpen(false);
                        setPendingFile(null); // Clear pending file on close
                    }}
                    onImport={(data) => {
                        if (onImport) onImport(data);
                        setIsImportModalOpen(false);
                        setPendingFile(null);
                    }}
                    initialFile={pendingFile}
                    accounts={data.accounts}
                />
            )}
        </div>
    );
};
