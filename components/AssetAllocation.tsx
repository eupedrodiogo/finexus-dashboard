
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetAllocationProps {
  investments: { name: string; value: number; color: string }[];
  totalValue: number;
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({
  investments,
  totalValue
}) => {
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="glass-card rounded-[2.5rem] p-8">
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
        <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
        Alocação de Ativos
      </h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="h-[200px] w-[200px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={investments} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                {investments.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff' }} formatter={(v: any) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">Total</span>
            <span className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
          {investments.map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(item.value)}</p>
                <p className="text-[10px] font-bold text-slate-400">{((item.value / totalValue) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
