
import React, { useMemo } from 'react';
import { FinancialData, Goal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SavingsRateIndicator } from './SavingsRateIndicator';
import { ImportModal } from './ImportModal';

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
  onImport?: (data: any) => void;
  accountsTotal: number;
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

export const Dashboard: React.FC<DashboardProps> = ({ data, totals, allData, goals, onManageGoals, onImport, accountsTotal }) => {

  const expenseAllocation = useMemo(() => [
    { name: 'Essenciais', value: totals.basicExpenses, color: '#6366f1' },
    { name: 'Variáveis', value: totals.additionalVariableCosts, color: '#ec4899' },
    { name: 'Investimentos', value: totals.investments, color: '#10b981' },
  ].filter(d => d.value > 0), [totals]);

  const trendData = useMemo(() => {
    return Object.keys(allData).sort().slice(-6).map(key => {
      const d = allData[key];
      const monthStr = new Date(key + '-02').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const income = d.payslipIncome.subCategories.reduce((acc, sub) => acc + sub.items.reduce((sum, item) => sum + item.value, 0), 0) -
        d.payslipDeductions.subCategories.reduce((acc, sub) => acc + sub.items.reduce((sum, item) => sum + item.value, 0), 0);
      const expense = d.basicExpenses.subCategories.reduce((acc, sub) => acc + sub.items.reduce((sum, item) => sum + item.value, 0), 0) +
        d.additionalVariableCosts.subCategories.reduce((acc, sub) => acc + sub.items.reduce((sum, item) => sum + item.value, 0), 0);
      return { month: monthStr, Receita: income, Despesa: expense };
    });
  }, [allData]);

  const topExpenses = useMemo(() => {
    const items: any[] = [];
    const collect = (cat: any, label: string, color: string) => {
      cat.subCategories.forEach((sub: any) => {
        sub.items.forEach((item: any) => {
          if (item.value > 0) items.push({ ...item, category: label, color });
        });
      });
    };
    collect(data.basicExpenses, 'Fixa', 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10');
    collect(data.additionalVariableCosts, 'Variável', 'text-pink-500 bg-pink-50 dark:bg-pink-500/10');
    return items.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [data]);

  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // Helper to merge imported data - this should ideally be in App.tsx but putting here for UI integration first
  // The actual prop `onImport` should be passed from App.tsx in a full refactor
  // For now we will assume the parent passes a handler, or we emit an event

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Actions Header */}
      <div id="import-area" className="flex justify-end mb-4">
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-bold text-sm"
        >
          <span className="material-symbols-rounded">upload_file</span>
          Importar
        </button>
      </div>

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

      {/* Import Modal */}
      {isImportModalOpen && (
        <React.Suspense fallback={null}>
          <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={(data) => {
              if (onImport) onImport(data);
              setIsImportModalOpen(false);
            }}
            accounts={data.accounts}
          />
        </React.Suspense>
      )}
    </div>
  );
};

