
import React, { useMemo } from 'react';
import { FinancialData, Category } from '../types';
import { TransactionHistory, Transaction } from './TransactionHistory';

interface MonthlyViewProps {
    data: FinancialData;
    totals: any;
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onEditTransaction?: (tx: import('./TransactionHistory').Transaction) => void;
    selectedTransactionId?: string | null;
    onSelectTransaction?: (tx: import('./TransactionHistory').Transaction | null) => void;
    onUpdateInitialBalance?: (value: number) => void;
    isScrolled?: boolean;
}

const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const MonthlyView: React.FC<MonthlyViewProps> = ({
    data,
    totals,
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onEditTransaction,
    selectedTransactionId,
    onSelectTransaction,
    onUpdateInitialBalance,
    isScrolled = false
}) => {
    // Estado local para edição removido pois agora é controlado pelo TransactionHistory

    // Extrai todas as transações do mês a partir dos dados hierárquicos
    const allTransactions: Transaction[] = useMemo(() => {
        const txs: Transaction[] = [];
        const processCategory = (category: Category, type: Transaction['type']) => {
            if (!category?.subCategories) return;
            category.subCategories.forEach(sub => {
                (sub.items || []).forEach(item => {
                    if (item.value > 0 && item.isPaid && !item.isIgnored) {
                        txs.push({
                            id: item.id,
                            name: item.name,
                            value: item.value,
                            category: sub.name ? `${category.title} › ${sub.name}` : category.title,
                            type,
                            date: item.date,
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

        return txs.sort((a, b) => {
            const da = a.date ?? '0000-00-00';
            const db = b.date ?? '0000-00-00';
            return db.localeCompare(da);
        });
    }, [data]);

    const realBalance = totals.realBalance || 0;

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Barra de ações */}
            {/* Header removido para evitar duplicidade com o fixo do App.tsx */}

            {/* Header de resumo do mês */}

            {/* Conteúdo: Extrato */}
            <div className="animate-slideIn">
                <TransactionHistory
                    transactions={allTransactions}
                    onEditTransaction={onEditTransaction}
                    selectedTransactionId={selectedTransactionId}
                    onSelectTransaction={onSelectTransaction}
                    initialBalance={totals.previousBalance || 0}
                    finalBalance={realBalance}
                    onUpdateInitialBalance={(newVal) => {
                        if (onUpdateInitialBalance) {
                            const naturalCarryOver = (totals.previousBalance || 0) - (data.initialBalanceAdjustment || 0);
                            onUpdateInitialBalance(newVal - naturalCarryOver);
                        }
                    }}
                />
            </div>
        </div>
    );
};
