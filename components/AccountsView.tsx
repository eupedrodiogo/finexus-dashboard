
import React, { useState } from 'react';
import { Account, FinancialData } from '../types';
import { Trash2, Plus, Edit2, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { calculateAccountBalance } from '../utils';

interface AccountsViewProps {
    data: FinancialData;
    onUpdate: (data: FinancialData) => void;
    isMobile: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ data, onUpdate, isMobile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [owner, setOwner] = useState<'pedro' | 'izabel' | 'joint'>('pedro');
    const [color, setColor] = useState('#3b82f6');
    const [type, setType] = useState<'checking' | 'savings' | 'investment' | 'cash'>('checking');

    const accounts = data.accounts || [];

    const handleOpenModal = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setName(account.name);
            setInitialBalance(account.initialBalance.toString());
            setOwner(account.owner);
            setColor(account.color);
            setType(account.type);
        } else {
            setEditingAccount(null);
            setName('');
            setInitialBalance('');
            setOwner('pedro');
            setColor('#3b82f6');
            setType('checking');
        }
        setIsModalOpen(true);
    };

    const calculateCurrentBalance = (account: Account) => {
        return calculateAccountBalance(account, data);
    }

    const handleSave = () => {
        if (!name || !initialBalance) return;

        const newAccount: Account = {
            id: editingAccount ? editingAccount.id : crypto.randomUUID(),
            name,
            initialBalance: parseFloat(initialBalance),
            owner,
            color,
            type
        };

        let updatedAccounts;
        if (editingAccount) {
            updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? newAccount : acc);
        } else {
            updatedAccounts = [...accounts, newAccount];
        }

        onUpdate({ ...data, accounts: updatedAccounts });
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta conta?')) {
            const updatedAccounts = accounts.filter(acc => acc.id !== id);
            onUpdate({ ...data, accounts: updatedAccounts });
        }
    };

    const getOwnerLabel = (key: string) => {
        if (key === 'pedro') return 'Pedro';
        if (key === 'izabel') return 'Izabel';
        return 'Conjunta';
    };

    const groupedAccounts = {
        pedro: accounts.filter(a => a.owner === 'pedro'),
        izabel: accounts.filter(a => a.owner === 'izabel'),
        joint: accounts.filter(a => a.owner === 'joint'),
    };

    const getTotalBalance = (ownerKey: 'pedro' | 'izabel' | 'joint') => {
        // Calculate total balance for a specific owner
        return groupedAccounts[ownerKey].reduce((acc, account) => acc + calculateCurrentBalance(account), 0);
    }

    const renderAccountCard = (account: Account) => {
        const currentBalance = calculateCurrentBalance(account);
        const isPositive = currentBalance >= 0;

        return (
            <div key={account.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 relative group transition-all hover:shadow-md">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={() => handleOpenModal(account)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(account.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: account.color }}>
                        {account.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{account.name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{account.type}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Saldo Atual</p>
                    <p className={`text-xl font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-slate-400">
                    <span>Inicial: {account.initialBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={`p-6 ${isMobile ? 'pb-24' : ''} max-w-7xl mx-auto animate-fadeIn`}>
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Wallet className="text-indigo-600 dark:text-indigo-400" />
                        Minhas Contas
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Gerencie o saldo das suas contas bancárias e carteiras.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-95"
                >
                    <Plus size={20} />
                    Nova Conta
                </button>
            </header>

            {/* Summary Cards */}
            <div id="accounts-summary" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Pedro's Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700/50">
                    <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2 flex items-center gap-2">
                        <DollarSign size={18} />
                        Saldo Pedro
                    </h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {getTotalBalance('pedro').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                {/* Izabel's Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700/50">
                    <h3 className="text-purple-800 dark:text-purple-300 font-semibold mb-2 flex items-center gap-2">
                        <DollarSign size={18} />
                        Saldo Izabel
                    </h3>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {getTotalBalance('izabel').toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                {/* Total Summary */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-slate-800 dark:text-slate-300 font-semibold mb-2 flex items-center gap-2">
                        <DollarSign size={18} />
                        Saldo Total
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {(getTotalBalance('pedro') + getTotalBalance('izabel') + getTotalBalance('joint')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Pedro's Accounts */}
                {groupedAccounts.pedro.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg w-fit pr-4">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Contas do Pedro</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedAccounts.pedro.map(renderAccountCard)}
                        </div>
                    </section>
                )}

                {/* Izabel's Accounts */}
                {groupedAccounts.izabel.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg w-fit pr-4">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Contas da Izabel</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedAccounts.izabel.map(renderAccountCard)}
                        </div>
                    </section>
                )}

                {/* Joint Accounts */}
                {groupedAccounts.joint.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg w-fit pr-4">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Contas Conjuntas</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedAccounts.joint.map(renderAccountCard)}
                        </div>
                    </section>
                )}

                {accounts.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Wallet size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Nenhuma conta cadastrada.</p>
                        <button onClick={() => handleOpenModal()} className="text-indigo-500 hover:text-indigo-600 font-medium mt-2">
                            Cadastrar primeira conta
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nome da Conta
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Nubank, Carteira..."
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Saldo Inicial
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Saldo inicial para o mês atual.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Titular
                                        </label>
                                        <select
                                            value={owner}
                                            onChange={(e) => setOwner(e.target.value as any)}
                                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        >
                                            <option value="pedro">Pedro</option>
                                            <option value="izabel">Izabel</option>
                                            <option value="joint">Conjunta</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Tipo
                                        </label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value as any)}
                                            className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        >
                                            <option value="checking">Corrente</option>
                                            <option value="savings">Poupança</option>
                                            <option value="investment">Investimento</option>
                                            <option value="cash">Dinheiro</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Cor de Identificação
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-700/30">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                            >
                                Salvar Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
