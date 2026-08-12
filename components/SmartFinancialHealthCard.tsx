import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, Info } from 'lucide-react';

interface SmartFinancialHealthCardProps {
  netIncome: number;
  totalOut: number;
  investments: number;
  previousBalance?: number;
  balance?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const SmartFinancialHealthCard: React.FC<SmartFinancialHealthCardProps> = ({
  netIncome,
  totalOut,
  investments,
  previousBalance = 0,
  balance = 0
}) => {
  const monthlyBalance = netIncome - totalOut - investments;
  const expenseRatio = netIncome > 0 ? (totalOut / netIncome) * 100 : 0;

  let status = 'excellent';
  if (expenseRatio > 90) status = 'critical';
  else if (expenseRatio > 75) status = 'warning';

  const configs = {
    excellent: {
      bg: "bg-[#037A56] border-[#037A56]/20 shadow-xl shadow-emerald-950/10",
      innerBg: "bg-black/15 border-white/15",
      title: "Saúde Excelente",
      desc: monthlyBalance >= 0 
        ? `Você poupou ${formatCurrency(monthlyBalance)} até agora.`
        : `Você investiu além do caixa livre em ${formatCurrency(Math.abs(monthlyBalance))}.`,
      iconColor: "text-[#00E5A3] bg-emerald-500/20 border-emerald-500/30"
    },
    warning: {
      bg: "bg-amber-800 border-amber-800/20 shadow-xl shadow-amber-950/10",
      innerBg: "bg-black/15 border-white/15",
      title: "Atenção: Margem Estrita",
      desc: monthlyBalance >= 0
        ? `Você poupou ${formatCurrency(monthlyBalance)} até agora.`
        : `Revisar despesas variáveis para recompor caixa livre.`,
      iconColor: "text-amber-400 bg-amber-500/20 border-amber-500/30"
    },
    critical: {
      bg: "bg-rose-900 border-rose-900/20 shadow-xl shadow-rose-950/10",
      innerBg: "bg-black/15 border-white/15",
      title: "Estado Crítico",
      desc: `Despesas superando a receita em ${formatCurrency(Math.abs(monthlyBalance))}.`,
      iconColor: "text-rose-400 bg-rose-500/20 border-rose-500/30"
    }
  };

  const config = configs[status as keyof typeof configs] || configs.excellent;

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 text-white ${config.bg} border transition-all duration-500 flex flex-col lg:flex-row justify-between gap-6 w-full`}>
      
      {/* Decorative Blur Backing */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />

      {/* Left side: Health Metrics & Info */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00E5A3]/25 text-[#00E5A3] text-[9px] font-black uppercase tracking-widest border border-[#00E5A3]/10">
              TEMPO REAL
            </span>
            <span className="px-3 py-1 rounded-full bg-black/20 text-white/60 text-[9px] font-black uppercase tracking-widest border border-white/5">
              ANÁLISE INTELIGENTE
            </span>
          </div>

          {/* Title and Main Description */}
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white">
            {config.title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-white/80 mt-2 sm:mt-3 leading-relaxed max-w-[90%]">
            {config.desc}
          </p>
        </div>

        {/* Bottom Horizontal Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 sm:mt-8">
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
            <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
              ENTRADAS
            </span>
            <span className="text-sm font-black mt-1 whitespace-nowrap">
              {formatCurrency(netIncome)}
            </span>
          </div>
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
            <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
              SAÍDAS
            </span>
            <span className="text-sm font-black mt-1 whitespace-nowrap">
              {formatCurrency(totalOut)}
            </span>
          </div>
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1 w-[70%] sm:w-auto min-h-[64px]">
            <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
              PATRIMÔNIO INICIAL
            </span>
            <span className="text-sm font-black mt-1 whitespace-nowrap">
              {formatCurrency(previousBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Consolidated Final Result Panel */}
      <div className={`relative z-10 w-full lg:w-[35%] min-w-[280px] rounded-[2rem] p-5 sm:p-6 ${config.innerBg} border border-white/15 flex flex-col justify-between shadow-inner gap-6`}>
        {/* Top Section with Status Indicator */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest block">
              RESULTADO FINAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mt-1 text-white">
              {formatCurrency(balance)}
            </h3>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.iconColor} border shadow-md`}>
            {status === 'excellent' && <ShieldCheck size={20} className="icon-filled" />}
            {status === 'warning' && <Activity size={20} />}
            {status === 'critical' && <AlertTriangle size={20} />}
          </div>
        </div>

        {/* Budget Efficiency Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-white/50">
            <span>EFICIÊNCIA DO ORÇAMENTO</span>
            <span className="text-xs font-black text-white">{Math.round(expenseRatio)}%</span>
          </div>
          <div className="w-full h-2 bg-black/35 rounded-full overflow-hidden relative border border-white/5">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(expenseRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* Base Info Footer */}
        <div className="flex items-center gap-1.5 text-[8px] font-black text-white/40 tracking-widest uppercase leading-none">
          <Info size={10} className="flex-shrink-0" />
          <span>BASEADO NO COMPORTAMENTO DE GASTOS ATUAL</span>
        </div>
      </div>
      
    </div>
  );
};
