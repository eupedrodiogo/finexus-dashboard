
import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';

interface SmartFinancialHealthCardProps {
  netIncome: number;
  totalOut: number;
  investments: number;
}

export const SmartFinancialHealthCard: React.FC<SmartFinancialHealthCardProps> = ({
  netIncome,
  totalOut,
  investments
}) => {
  const savingsRate = netIncome > 0 ? (investments / netIncome) * 100 : 0;
  const expenseRatio = netIncome > 0 ? (totalOut / netIncome) * 100 : 0;

  let status = 'excellent';
  if (expenseRatio > 90) status = 'critical';
  else if (expenseRatio > 75) status = 'warning';

  const configs = {
    excellent: {
      bg: "from-emerald-500 to-teal-600",
      icon: <ShieldCheck size={48} />,
      title: "Saúde Excelente",
      desc: "Sua estrutura de gastos está saudável e permite aportes consistentes."
    },
    warning: {
      bg: "from-yellow-400 to-amber-500",
      icon: <Activity size={48} />,
      title: "Atenção: Consumo de Reserva",
      desc: "Seus gastos estão próximos do limite da receita. Revise variáveis."
    },
    critical: {
      bg: "from-rose-500 to-red-700",
      icon: <AlertTriangle size={48} />,
      title: "Estado Crítico",
      desc: "Despesas superando a margem de segurança. Risco de endividamento."
    }
  };

  const config = configs[status as keyof typeof configs] || configs.excellent;

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white bg-gradient-to-br ${config.bg} shadow-2xl shadow-emerald-500/10`}>
      <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 scale-150">
        {config.icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight leading-none">{config.title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Monitor de Estabilidade</span>
          </div>
        </div>

        <p className="text-sm font-medium opacity-90 leading-relaxed mb-8 max-w-[80%]">
          {config.desc}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 block mb-1">Taxa de Poupança</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black">{savingsRate.toFixed(1)}%</span>
              <Zap size={14} className="text-yellow-300 mb-1" />
            </div>
          </div>
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 block mb-1">Comprometimento</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black">{expenseRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
