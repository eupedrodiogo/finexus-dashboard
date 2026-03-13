
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface ExpenseChartProps {
  data: ChartData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatAxisTick = (tick: number) => {
    if (tick >= 1000) {
        return `R$${(tick / 1000).toFixed(0)}k`;
    }
    return `R$${tick}`;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const [yAxisWidth, setYAxisWidth] = useState(window.innerWidth < 768 ? 65 : 80);

  useEffect(() => {
    const handleResize = () => {
      setYAxisWidth(window.innerWidth < 768 ? 65 : 80);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <p>Nenhuma despesa registrada para exibir no gráfico.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis type="number" tickFormatter={formatAxisTick} stroke="currentColor" />
        <YAxis dataKey="name" type="category" width={yAxisWidth} stroke="currentColor" tick={{ textTransform: 'capitalize' }} />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          cursor={{fill: 'rgba(200,200,200,0.2)'}}
          contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderColor: 'rgba(51, 65, 85, 1)',
              color: '#cbd5e1'
          }}
          labelStyle={{ color: '#f1f5f9', textTransform: 'capitalize' }}
        />
        <Bar dataKey="value" name="Valor" barSize={20}>
           {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
