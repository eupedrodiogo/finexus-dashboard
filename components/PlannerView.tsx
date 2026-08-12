
import React, { useState, useEffect } from 'react';
import { Layout, TrendingUp, Info, ShieldCheck, ArrowUpRight, Activity, Zap, MinusCircle, TrendingDown, Target, Wallet, PieChart } from 'lucide-react';
import { FinancialData } from '../types';
import { CategorySection } from './CategorySection';
import { ConfirmationModal } from './ConfirmationModal';
import { ImportModal } from './ImportModal';
import { checkPendingShare } from '../services/shareService';
import { MonthNavigator } from './MonthNavigator';
import { SmartFinancialHealthCard } from './SmartFinancialHealthCard';

interface PlannerViewProps {
    data: FinancialData;
    totals: any;
    handleValueChange: any;
    handleNameChange: any;
    handleCategoryTitleChange: any;
    handleBudgetChange: any;
    handleRateChange: any;
    handleAddItem: any;
    handleDeleteItem: any;
    handleBulkDeleteItem?: (categoryId: string, subCategoryId: string, itemIds: string[]) => void;
    handleToggleRecurring: any;
    handleTogglePaid: any;
    handleToggleIgnored: any;
    itemToDelete: any;
    onConfirmDelete: any;
    onCancelDelete: any;
    handleSubCategoryNameChange?: (categoryId: string, subCategoryId: string, newName: string) => void;
    handleDeleteSubCategory?: (categoryId: string, subCategoryId: string) => void;
    handleBulkIgnore?: (categoryId: string, subCategoryId: string, itemIds: string[]) => void;
    handleBulkUpdate?: (categoryId: string, subCategoryId: string, itemIds: string[], updates: any) => void;
    onUpdateItem?: (categoryId: string, subCategoryId: string, itemId: string, updates: any) => void;
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onUpdateInitialBalance?: (value: number) => void;
    activeTab: 'payslip' | 'expenses' | 'investments';
    setActiveTab: (tab: 'payslip' | 'expenses' | 'investments') => void;
    isScrolled?: boolean;
    isPedro?: boolean;
}



export const PlannerView: React.FC<PlannerViewProps> = ({
    data,
    totals,
    handleValueChange,
    handleNameChange,
    handleCategoryTitleChange,
    handleBudgetChange,
    handleRateChange,
    handleAddItem,
    handleDeleteItem,
    handleBulkDeleteItem,
    handleBulkIgnore,
    handleBulkUpdate,
    handleToggleRecurring,
    handleTogglePaid,
    handleToggleIgnored,
    itemToDelete,
    onConfirmDelete,
    onCancelDelete,
    handleSubCategoryNameChange,
    handleDeleteSubCategory,
    onUpdateItem,
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onUpdateInitialBalance,
    activeTab,
    setActiveTab,
    isScrolled,
    isPedro = false
}) => {
    const [isEditingInitial, setIsEditingInitial] = useState(false);
    const [tempInitial, setTempInitial] = useState(totals.previousBalance || 0);

    const isFutureMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > 
                        new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    useEffect(() => {
        setTempInitial(totals.previousBalance || 0);
    }, [totals.previousBalance]);

    useEffect(() => {
        // Lógica de share movida ou desativada localmente
    }, []);

    const renderSection = (category: any, total: number, comparisonLabel?: string) => (
        <CategorySection
            category={category}
            total={total}
            comparisonLabel={comparisonLabel}
            onItemChange={(subId, itemId, val) => handleValueChange(category.id, subId, itemId, val)}
            onItemNameChange={(subId, itemId, val) => handleNameChange(category.id, subId, itemId, val)}
            onItemAdd={(subId, newItemId) => handleAddItem(category.id, subId, newItemId)}
            onItemDelete={(subId, itemId) => handleDeleteItem(category.id, subId, itemId)}
            onBulkItemDelete={(subId, itemIds) => handleBulkDeleteItem && handleBulkDeleteItem(category.id, subId, itemIds)}
            onTitleChange={(val) => handleCategoryTitleChange(category.id, val)}
            onBudgetChange={(val) => handleBudgetChange(category.id, val)}
            onRateChange={(subId, itemId, val) => handleRateChange(category.id, subId, itemId, val)}
            onItemRecurringToggle={(subId, itemId) => handleToggleRecurring(category.id, subId, itemId)}
            onItemPaidToggle={(subId, itemId) => handleTogglePaid(category.id, subId, itemId)}
            onItemIgnoreToggle={(subId, itemId) => handleToggleIgnored(category.id, subId, itemId)}
            onBulkItemIgnore={(subId, itemIds) => handleBulkIgnore && handleBulkIgnore(category.id, subId, itemIds)}
            onBulkItemUpdate={(subId, itemIds, updates) => handleBulkUpdate && handleBulkUpdate(category.id, subId, itemIds, updates)}
            onUpdateItem={(subId, itemId, updates) => onUpdateItem && onUpdateItem(category.id, subId, itemId, updates)}
            isEditable={true}
            onDeleteSubCategory={(subId) => handleDeleteSubCategory && handleDeleteSubCategory(category.id, subId)}
            accounts={data.accounts}
            isPedro={isPedro}
        />
    );



    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            
            {/* Sticky Header Container (Apenas Abas agora, o Grid foi para o App.tsx) */}
            {/* O cabeçalho fixo com abas e cards foi totalmente movido para App.tsx para evitar problemas de sobreposição de 'sticky' ao rolar a página */}

            {/* Categorias - Renderização Condicional por Aba */}
            <div className="animate-slideIn">

                {activeTab === 'payslip' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 flex flex-col">
                            {renderSection(data.payslipIncome, totals.grossIncome, 'Previsto')}
                        </div>
                        <div className="lg:col-span-6 flex flex-col">
                            {renderSection(data.payslipDeductions, totals.deductions)}
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 flex flex-col">
                            {renderSection(data.basicExpenses, totals.basicExpenses)}
                        </div>
                        <div className="lg:col-span-6 flex flex-col">
                            {renderSection(data.additionalVariableCosts, totals.additionalVariableCosts)}
                        </div>
                    </div>
                )}

                {activeTab === 'investments' && (
                    <div className="max-w-5xl mx-auto">
                        {renderSection(data.investments, totals.investments)}
                    </div>
                )}
            </div>

            {/* Modais */}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={onCancelDelete}
                onConfirm={onConfirmDelete}
                title="Excluir Item"
                message="Tem certeza? Isso afetará os cálculos deste mês."
            />

            {/* ImportModal removido daqui e levado para o App.tsx */}
        </div>
    );
};
