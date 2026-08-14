
import React, { useMemo } from 'react';
import { FinancialData, Goal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SavingsRateIndicator } from './SavingsRateIndicator';
import { SmartFinancialHealthCard } from './SmartFinancialHealthCard';
import { SavingsCapacityCard } from './SavingsCapacityCard';
import { SpendingEfficiencyCard } from './SpendingEfficiencyCard';
import { calculateTotal } from '../utils';

interface DashboardProps {
  data: FinancialData;
  totals: {
    netIncome: number;
    totalExpenses: number;
    balance: number;
    investments: number;
    basicExpenses: number;
    additionalVariableCosts: number;
    monthlyBalance?: number;
    previousBalance?: number;
    pedroNetIncome?: number;
    izabelNetIncome?: number;
  };
  allData: { [key: string]: FinancialData };
  currentMonth: Date;
  goals: Goal[];
  onManageGoals?: () => void;
  accountsTotal: number;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  userName?: string;
  isSyncing?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const KPICard: React.FC<{
  title: string;
  value: number;
  icon: string;
  gradient: string;
  trend?: string;
  isNegativeBetter?: boolean;
}> = ({ title, value, icon, gradient, trend, isNegativeBetter = false }) => (
  <div className="glass-card rounded-[2rem] p-7 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-default shadow-lg hover:shadow-2xl">
    <div className="absolute -right-6 -top-6 text-slate-900/[0.03] dark:text-white/[0.03] group-hover:text-slate-900/[0.08] dark:group-hover:text-white/[0.08] transition-colors duration-700 pointer-events-none select-none">
      <span className="material-symbols-rounded notranslate text-[10rem] leading-none">{icon}</span>
    </div>
    <div className="relative z-10">
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center text-white mb-5 shadow-xl`}>
        <span className="material-symbols-rounded notranslate text-3xl icon-filled">{icon}</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5 tracking-tighter">{formatCurrency(value)}</h3>
      {trend && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mt-4 ${isNegativeBetter ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
          <span className="material-symbols-rounded notranslate text-xs">{value >= 0 ? 'trending_up' : 'trending_down'}</span>
          {trend}
        </div>
      )}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  totals, 
  allData, 
  currentMonth,
  goals,
  onManageGoals,
  onImport,
  onFullRestore,
  accountsTotal,
  isDarkMode,
  toggleTheme,
  onPreviousMonth,
  onNextMonth,
  userName,
  isSyncing
}) => {

  const expenseAllocation = useMemo(() => [
    { name: 'Essenciais', value: totals.basicExpenses, color: '#6366f1' },
    { name: 'Variáveis', value: totals.additionalVariableCosts, color: '#ec4899' },
    { name: 'Investimentos', value: totals.investments, color: '#10b981' },
  ].filter(d => d.value > 0), [totals]);

  const trendData = useMemo(() => {
    return Object.keys(allData).sort().filter(k => k.includes('-')).slice(-6).map(key => {
      const d = allData[key];
      const monthStr = new Date(key + '-02').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      
      // calculateTotal já descarta itens ignorados e pernas de transferência,
      // mantendo o gráfico coerente com os KPIs do mês.
      const income = calculateTotal(d.payslipIncome) - calculateTotal(d.payslipDeductions);

      const expense = calculateTotal(d.basicExpenses) + calculateTotal(d.additionalVariableCosts);
        
      return { month: monthStr, Receita: income, Despesa: expense };
    });
  }, [allData]);

  const topExpenses = useMemo(() => {
    const items: any[] = [];
    const collect = (cat: any, label: string, color: string) => {
      cat?.subCategories?.forEach((sub: any) => {
        sub?.items?.forEach((item: any) => {
          // Transferência não é gasto — não pode aparecer no ranking de despesas.
          if (item.value > 0 && !item.isTransfer) items.push({ ...item, category: label, color });
        });
      });
    };
    collect(data.basicExpenses, 'Fixa', 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10');
    collect(data.additionalVariableCosts, 'Variável', 'text-pink-500 bg-pink-50 dark:bg-pink-500/10');
    return items.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 💻 Cabeçalho de Computador (Desktop Header - md e superiores) */}
      <div className="hidden md:flex justify-between items-center gap-6 mb-8 w-full">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center border border-white/10 shadow-md">
            <span className="material-symbols-rounded text-white dark:text-slate-950 text-xl font-bold notranslate">bolt</span>
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight flex items-center gap-1">
              Finexus<span className="text-violet-500 font-extrabold">.</span>
            </h1>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">
              ESTRATÉGIA FINANCEIRA
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Month Selector */}
          {onPreviousMonth && onNextMonth && (
            <div className="flex items-center bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-1 border border-slate-200 dark:border-white/5 shadow-sm">
              <button 
                onClick={onPreviousMonth} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-rounded text-sm notranslate leading-none">chevron_left</span>
              </button>
              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-black text-slate-700 dark:text-white whitespace-nowrap shadow-inner">
                <span className="material-symbols-rounded text-xs text-indigo-500 dark:text-indigo-400 notranslate">calendar_today</span>
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <button 
                onClick={onNextMonth} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-rounded text-sm notranslate leading-none">chevron_right</span>
              </button>
            </div>
          )}

          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-1.5 pr-4 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center border border-white/10 shadow-md">
              <span className="text-white font-black text-sm uppercase">
                {userName ? userName.charAt(0) : 'P'}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-800 dark:text-white leading-none">
                {userName || 'Pedro Diogo'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest leading-none">
                  CLOUD ATIVA
                </span>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          {toggleTheme && (
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm"
            >
              <span className="material-symbols-rounded text-base notranslate">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 📱 Cabeçalho de Celular (Mobile Header - abaixo de md) */}
      <div className="sticky top-0 z-30 flex md:hidden flex-col items-center justify-center w-full gap-3 -mt-4 pt-4 pb-4 -mx-4 px-4 bg-slate-50 dark:bg-slate-950 !mt-0">
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center w-full mb-0.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md border border-white/10">
              <span className="material-symbols-rounded text-slate-950 text-2xl font-bold notranslate">bolt</span>
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight flex items-center gap-1">
                Finexus<span className="text-violet-500 font-extrabold">.</span>
              </h1>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-0.5">
                ESTRATÉGIA FINANCEIRA
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls - Unified Pill Bar */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-[#131e35]/65 backdrop-blur-md rounded-3xl p-1 border border-slate-200/60 dark:border-white/5 w-full max-w-sm gap-2 shadow-sm">
          {/* Month Selector */}
          {onPreviousMonth && onNextMonth && (
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-0.5 border border-slate-200/40 dark:border-white/5 flex-1 justify-between gap-1 max-w-[165px] shadow-inner">
              <button 
                onClick={onPreviousMonth} 
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-rounded text-sm notranslate leading-none">chevron_left</span>
              </button>
              <span className="text-[10px] font-black text-slate-700 dark:text-white whitespace-nowrap tracking-wider px-1">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <button 
                onClick={onNextMonth} 
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-rounded text-sm notranslate leading-none">chevron_right</span>
              </button>
            </div>
          )}

          {/* User Profile Card */}
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-1 px-2.5 border border-slate-200/30 dark:border-white/5">
            <div className="w-7 h-7 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10 relative flex-shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/a/ACg8ocL54N0Z2g-z_-24x51XqP2r3wY3647P9r1t6g=s96-c" 
                alt="Pedro Diogo" 
                className="w-full h-full object-cover animate-fadeIn" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900 animate-pulse"></span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-slate-800 dark:text-white leading-none whitespace-nowrap">
                {userName || 'Pedro Diogo'}
              </span>
              <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                CLOUD ATIVA
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          {toggleTheme && (
            <button 
              onClick={toggleTheme} 
              className="w-8 h-8 rounded-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-rounded text-sm notranslate leading-none">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 💻 Ações de Computador (Desktop Actions - md e superiores) */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <button
          onClick={onManageGoals}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm transition-all font-black text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-rounded text-base notranslate">tune</span>
          Personalizar Dashboard
        </button>
      </div>

      {/* 📱 Ações de Celular (Mobile Actions - abaixo de md) */}
      <div className="flex md:hidden flex-col gap-3 mb-6 w-full">
        <button
          onClick={onManageGoals}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#131e35]/65 dark:bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 dark:text-slate-200 border border-white/5 rounded-2xl transition-all font-black text-xs uppercase tracking-wider shadow-md"
        >
          <span className="material-symbols-rounded text-base notranslate">tune</span>
          Personalizar Dashboard
        </button>
      </div>

      {/* Smart Health Card ocupando 100% da largura */}
      <div className="w-full mb-6">
        <SmartFinancialHealthCard 
          netIncome={totals.netIncome} 
          totalOut={totals.totalExpenses} 
          investments={totals.investments}
          previousBalance={totals.previousBalance}
          balance={totals.balance}
        />
      </div>

      {/* Reserva do João Vitor Horizontal Card - 100% width */}
      {data.joaoVitorReserve !== undefined && data.joaoVitorTarget !== undefined && (
        <div className="w-full mb-6 glass-card rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-md relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 shadow-xl">
          {/* Decorative background glow */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/[0.02] blur-3xl rounded-full pointer-events-none" />

          {/* Top Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/25 shadow-md shadow-emerald-500/5">
                <span className="material-symbols-rounded text-3xl notranslate">child_care</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  Reserva do João Vitor
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                  Construindo o ninho...
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black text-emerald-500 block leading-none">
                {((data.joaoVitorReserve / data.joaoVitorTarget) * 100).toFixed(0)}%
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">
                PROGRESSO
              </span>
            </div>
          </div>

          {/* Main Progress Bar */}
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mb-6 relative border border-slate-200/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((data.joaoVitorReserve / data.joaoVitorTarget) * 100, 100)}%` }}
            />
          </div>

          {/* Bottom Metas Section */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                ACUMULADO
              </span>
              <h4 className="text-lg sm:text-2xl font-black text-slate-700 dark:text-white leading-none">
                {formatCurrency(data.joaoVitorReserve)}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                META FINAL
              </span>
              <h4 className="text-lg sm:text-2xl font-black text-slate-700 dark:text-white leading-none">
                {formatCurrency(data.joaoVitorTarget)}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Top Level Summary */}
      <div id="kpi-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col gap-4">
          <KPICard title="Renda Líquida Familiar" value={totals.netIncome} icon="account_balance" gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" trend="+4% vs mês anterior" />

          {/* Individual Breakdown */}
          <div className="glass-card rounded-3xl p-4 border border-white/20 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-rounded text-lg">person</span>
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pedro</span>
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{formatCurrency(totals.pedroNetIncome || 0)}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <span className="material-symbols-rounded text-lg">person_3</span>
                </div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Izabel</span>
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{formatCurrency(totals.izabelNetIncome || 0)}</span>
            </div>
          </div>
        </div>

        {/* <KPICard title="Saldo em Contas" value={accountsTotal} icon="account_balance_wallet" gradient="bg-gradient-to-br from-blue-500 to-cyan-600" /> */}

        <KPICard title="Despesas Totais" value={totals.totalExpenses} icon="shopping_bag" gradient="bg-gradient-to-br from-rose-500 to-pink-600" trend="-2.5% vs meta" isNegativeBetter={true} />
        <div className="relative">
          <KPICard title="Investido" value={totals.investments} icon="rocket_launch" gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend="Acumulação Ativa" />
          <div className="absolute top-4 right-4 bg-white/50 dark:bg-slate-800/50 rounded-full p-1 backdrop-blur-sm shadow-sm hidden sm:block">
            <div className="scale-75 origin-top-right">
              <SavingsRateIndicator netIncome={totals.netIncome} balance={totals.investments + totals.balance} />
            </div>
          </div>
        </div>

        {/* Previous Balance Display - Only show if relevant */}
        {(totals.previousBalance !== undefined && totals.previousBalance !== 0) ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card rounded-[2rem] p-5 relative overflow-hidden flex flex-col justify-between border border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">Saldo Inicial</p>
                  <h4 className="text-lg font-black text-slate-700 dark:text-slate-300">{formatCurrency(totals.previousBalance)}</h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-rounded text-sm">history</span>
                </div>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">Resultado Mês</p>
                  <h4 className={`text-lg font-black ${totals.monthlyBalance && totals.monthlyBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {totals.monthlyBalance ? formatCurrency(totals.monthlyBalance) : 'R$ 0,00'}
                  </h4>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-[2rem] p-5 bg-gradient-to-br from-violet-500 to-purple-700 text-white relative overflow-hidden shadow-lg shadow-purple-500/20">
              <p className="font-bold text-xs uppercase tracking-[0.1em] opacity-80">Saldo Final</p>
              <h3 className="text-2xl font-black mt-1 tracking-tighter">{formatCurrency(totals.balance)}</h3>
              <span className="absolute right-4 bottom-4 material-symbols-rounded opacity-20 text-5xl">wallet</span>
            </div>
          </div>
        ) : (
          <KPICard title="Saldo Final" value={totals.balance} icon="wallet" gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div id="performance-chart" className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-white/40">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
              Desempenho Financeiro
            </h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} stroke="#000" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1.25rem' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Area type="monotone" dataKey="Receita" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Despesa" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Goals (Metas) */}
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-indigo-500 rounded-full"></span>
            Metas Financeiras
          </h3>
          <div className="flex-1 space-y-6">

            {goals.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">Nenhuma meta definida.</p>
              </div>
            ) : goals.map((goal) => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              return (
                <div key={goal.id} className="space-y-2 group cursor-default">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{goal.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-indigo-500 transition-colors">{progress.toFixed(0)}%</p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>{formatCurrency(goal.currentValue)}</span>
                    <span>Alvo: {formatCurrency(goal.targetValue)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <button
            onClick={onManageGoals}
            className="mt-8 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-500 border border-indigo-100 dark:border-indigo-900 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded notranslate text-base">edit_square</span>
            Gerenciar Objetivos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Expenses */}
        <div className="glass-card rounded-[2.5rem] p-8">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-rose-500 rounded-full"></span>
            Maiores Gastos
          </h3>
          <div className="space-y-4">
            {topExpenses.map((item, i) => (
              <div key={i} className="flex items-center justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-all">
                <div id="import-area" className="flex flex-col md:flex-row gap-4 mb-8 overflow-hidden">
                  <span className="text-slate-300 dark:text-slate-600 font-black text-xl italic">{i + 1}</span>
                  <div className="truncate">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate capitalize">{item.name}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${item.color}`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <span className="font-black text-slate-800 dark:text-white text-sm whitespace-nowrap">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 self-start flex items-center gap-3">
            <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
            Distribuição de Renda
          </h3>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseAllocation} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  {expenseAllocation.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff' }} formatter={(v: any) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Saídas Totais</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{formatCurrency(totals.totalExpenses + totals.investments)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Intelligence & Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SavingsCapacityCard grossIncome={totals.netIncome + totals.totalExpenses} totalOut={totals.totalExpenses} />
        </div>
        <div className="lg:col-span-1">
          <SpendingEfficiencyCard efficiency={Math.max(0, Math.min(100, Math.round(100 - (totals.totalExpenses / (totals.netIncome > 0 ? totals.netIncome : 1) * 100))))} />
        </div>
        <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-900/5 to-indigo-900/10 dark:from-white/5 dark:to-white/10 border border-white/20 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Alocação Recomendada
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Divisão do Orçamento</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Essenciais (50% Alvo)</span>
              <span className="text-slate-800 dark:text-white">{(totals.netIncome > 0 ? (totals.basicExpenses / totals.netIncome * 100).toFixed(0) : 0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (totals.netIncome > 0 ? (totals.basicExpenses / totals.netIncome * 100) : 0))}%` }} />
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Investimentos (30% Alvo)</span>
              <span className="text-slate-800 dark:text-white">{(totals.netIncome > 0 ? (totals.investments / totals.netIncome * 100).toFixed(0) : 0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totals.netIncome > 0 ? (totals.investments / totals.netIncome * 100) : 0))}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

