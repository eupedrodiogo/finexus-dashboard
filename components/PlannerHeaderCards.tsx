import React from 'react';
import { Wallet, Activity, ArrowUpRight, TrendingUp, MinusCircle, Zap } from 'lucide-react';

interface PlannerHeaderCardsProps {
    totals: {
        previousBalance: number;
        netIncome: number;
        realNetIncome?: number;
        totalExpenses: number;
        realTotalExpenses?: number;
        balance: number;
        realBalance?: number;
    };
    isScrolled: boolean;
}

export const PlannerHeaderCards: React.FC<PlannerHeaderCardsProps> = ({ totals, isScrolled }) => {
    // Dynamic styles based on scroll state
    const containerClasses = isScrolled 
        ? "grid grid-cols-2 lg:grid-cols-4 gap-2 animate-slideIn" 
        : "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-slideIn";

    const cardBase = "relative overflow-hidden flex flex-col justify-between transition-all duration-500 border";
    const normalCardSize = isScrolled
        ? "bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-sm h-[90px] sm:h-[110px] border-slate-200 dark:border-slate-800"
        : "bg-white dark:bg-slate-900 rounded-[1.5rem] p-3 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none h-[120px] sm:h-[150px] border-slate-100 dark:border-slate-800";

    const darkCardSize = isScrolled
        ? "bg-[#0f172a] rounded-2xl p-2.5 sm:p-3 shadow-md h-[90px] sm:h-[110px] border-slate-700"
        : "bg-[#0f172a] rounded-[1.5rem] p-3 sm:p-5 shadow-[0_8px_25px_-5px_rgba(15,23,42,0.4)] h-[120px] sm:h-[150px] border-slate-800";

    const iconSize = isScrolled
        ? "w-11 h-11 sm:w-14 sm:h-14 top-2 -right-2 opacity-25"
        : "w-14 h-14 sm:w-24 sm:h-24 top-2 sm:top-4 -right-2 opacity-80";

    const darkIconSize = isScrolled
        ? "w-11 h-11 sm:w-14 sm:h-14 top-2 sm:top-4 -right-2 opacity-20"
        : "w-14 h-14 sm:w-24 sm:h-24 top-3 sm:top-6 -right-2 opacity-60";

    // Mobile-first: tamanhos legíveis no celular, refinados no desktop
    const titleClass = `font-bold tracking-widest flex items-center gap-1 ${isScrolled ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[11px]"}`;
    const valueClass = `font-extrabold tracking-tight leading-none mt-1 ${isScrolled ? "text-sm sm:text-lg" : "text-lg sm:text-2xl"}`;
    const subValueClass = `font-medium ${isScrolled ? "text-[8px] sm:text-[10px] mt-0.5" : "text-[9px] sm:text-[11px] mt-1"}`;
    const footerClass = `flex justify-between font-bold uppercase w-full ${isScrolled ? "text-[7px] sm:text-[8px] mb-0.5" : "text-[8px] sm:text-[10px] mb-1 sm:mb-1.5"}`;
    const barHeight = isScrolled ? "h-1" : "h-1 sm:h-1.5";

    return (
        <div className={containerClasses}>
            {/* SALDO INICIAL */}
            <div className={`${cardBase} ${normalCardSize}`}>
                <Wallet className={`absolute pointer-events-none text-slate-50 dark:text-slate-800 transition-all duration-500 ${iconSize}`} strokeWidth={1} />
                
                <div className="flex justify-between items-center relative z-10">
                    <h3 className={`${titleClass} text-slate-400 dark:text-slate-500`}>
                        SALDO INICIAL <Activity size={isScrolled ? 10 : 12} className="text-indigo-400 dark:text-indigo-500" />
                    </h3>
                </div>
                
                <div className="relative z-10">
                    <p className={`${valueClass} text-slate-800 dark:text-white`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.previousBalance)}
                    </p>
                </div>
                
                <div className="flex justify-between items-end relative z-10 mt-auto">
                    <span className={`font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-wider ${isScrolled ? "px-2 py-0.5 text-[6.5px]" : "px-2.5 py-1 text-[8px] sm:text-[9px]"}`}>
                        Ajustado
                    </span>
                    <span className={`font-semibold text-slate-400 dark:text-slate-500 ${isScrolled ? "text-[8px]" : "text-[9px] sm:text-[10px]"}`}>Disponível</span>
                </div>
            </div>

            {/* ENTRADAS */}
            <div className={`${cardBase} ${normalCardSize}`}>
                <ArrowUpRight className={`absolute pointer-events-none text-emerald-50 dark:text-emerald-900/30 transition-all duration-500 ${iconSize}`} strokeWidth={2} />
                
                <div className="flex justify-between items-center relative z-10">
                    <h3 className={`${titleClass} text-slate-400 dark:text-slate-500`}>
                        ENTRADAS <TrendingUp size={isScrolled ? 10 : 12} className="text-emerald-500" />
                    </h3>
                </div>
                
                <div className="relative z-10">
                    <p className={`${valueClass} text-slate-800 dark:text-white`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.realNetIncome || 0)}
                    </p>
                    <p className={`${subValueClass} text-slate-400 dark:text-slate-500`}>
                        de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.netIncome)} planejados
                    </p>
                </div>
                
                <div className="relative z-10 mt-auto w-full">
                    <div className={`${footerClass} text-slate-400 dark:text-slate-500`}>
                        <span>Progresso</span>
                        <span>{Math.min(100, Math.round(((totals.realNetIncome || 0) / (totals.netIncome || 1)) * 100))}%</span>
                    </div>
                    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${barHeight}`}>
                        <div 
                            className="bg-emerald-400 dark:bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, Math.round(((totals.realNetIncome || 0) / (totals.netIncome || 1)) * 100))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* SAÍDAS */}
            <div className={`${cardBase} ${normalCardSize}`}>
                <ArrowUpRight className={`absolute pointer-events-none text-rose-50 dark:text-rose-900/30 rotate-90 transition-all duration-500 ${iconSize}`} strokeWidth={2} />
                
                <div className="flex justify-between items-center relative z-10">
                    <h3 className={`${titleClass} text-slate-400 dark:text-slate-500`}>
                        SAÍDAS <MinusCircle size={isScrolled ? 10 : 12} className="text-rose-500" />
                    </h3>
                </div>
                
                <div className="relative z-10">
                    <p className={`${valueClass} text-slate-800 dark:text-white`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.realTotalExpenses || 0)}
                    </p>
                    <p className={`${subValueClass} text-slate-400 dark:text-slate-500`}>
                        de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.totalExpenses)} planejadas
                    </p>
                </div>
                
                <div className="relative z-10 mt-auto w-full">
                    <div className={`${footerClass}`}>
                        <span className="text-slate-400 dark:text-slate-500">Falta Pagar</span>
                        <span className="text-rose-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, totals.totalExpenses - (totals.realTotalExpenses || 0)))}
                        </span>
                    </div>
                    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${barHeight}`}>
                        <div 
                            className="bg-rose-400 dark:bg-rose-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, Math.round(((totals.realTotalExpenses || 0) / (totals.totalExpenses || 1)) * 100))}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* SALDO ATUAL (REAL) */}
            <div className={`${cardBase} ${darkCardSize}`}>
                <Zap className={`absolute pointer-events-none text-[#1e293b] transition-all duration-500 ${darkIconSize}`} strokeWidth={1.5} />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-center relative z-10">
                    <h3 className={`${titleClass} text-indigo-300`}>
                        SALDO ATUAL (REAL)
                    </h3>
                </div>
                
                <div className="relative z-10">
                    <p className={`${valueClass} text-white drop-shadow-md`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.realBalance || (totals.previousBalance + (totals.realNetIncome || 0) - (totals.realTotalExpenses || 0)))}
                    </p>
                    <p className={`${subValueClass} text-slate-400`}>
                        Projeção Final: <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.balance)}</span>
                    </p>
                </div>
                
                <div className="flex justify-between items-end relative z-10 mt-auto">
                    <span className={`font-bold bg-[#064e3b]/40 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider ${isScrolled ? "px-1.5 py-0.5 text-[6.5px]" : "px-2.5 py-1 text-[8px] sm:text-[9px]"}`}>
                        No Azul
                    </span>
                    <span className={`font-bold text-slate-500 tracking-widest uppercase ${isScrolled ? "text-[7px]" : "text-[8px] sm:text-[10px]"}`}>Performance</span>
                </div>
            </div>
        </div>
    );
};
