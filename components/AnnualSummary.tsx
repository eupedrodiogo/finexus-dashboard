

import React, { useMemo } from 'react';
import { FinancialData } from '../types';
import { calculateTotal } from '../utils';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AnnualSummaryProps {
  allData: { [key: string]: FinancialData };
  currentYear: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Custom Tooltip for better styling and data presentation
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const receita = payload.find((p: any) => p.dataKey === 'Receita Líquida');
    const despesas = payload.find((p: any) => p.dataKey === 'Total Despesas');
    const saldo = payload.find((p: any) => p.dataKey === 'Saldo');

    return (
      <div className="bg-light-card dark:bg-dark-card/90 backdrop-blur-sm p-3 rounded-lg border border-light-border dark:border-dark-border shadow-lg text-sm">
        <p className="font-bold text-light-text dark:text-dark-text mb-2">{label}</p>
        {receita && (
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: receita.fill }}></span>
            <span className="text-light-subtle dark:text-dark-subtle">Receita:</span>
            <span className="font-medium text-light-text dark:text-dark-text">{formatCurrency(receita.value)}</span>
          </div>
        )}
        {despesas && (
           <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: despesas.fill }}></span>
            <span className="text-light-subtle dark:text-dark-subtle">Despesas:</span>
            <span className="font-medium text-light-text dark:text-dark-text">{formatCurrency(despesas.value)}</span>
          </div>
        )}
        {saldo && (
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-light-border dark:border-dark-border">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: saldo.stroke }}></span>
            <span className="text-light-subtle dark:text-dark-subtle font-semibold">Saldo:</span>
            <span className={`font-bold ${saldo.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(saldo.value)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};


export const AnnualSummary: React.FC<AnnualSummaryProps> = ({ allData, currentYear }) => {

  const annualData = useMemo(() => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const summary = monthNames.map((monthName, index) => {
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      const monthData = allData[monthKey];

      if (!monthData) {
        return { 
          name: monthName, 
          'Receita Líquida': 0, 
          'Total Despesas': 0, 
          'Saldo': 0,
        };
      }

      const grossIncome = calculateTotal(monthData.payslipIncome);
      const deductions = calculateTotal(monthData.payslipDeductions);
      const netIncome = grossIncome - deductions;
      const basicExpenses = calculateTotal(monthData.basicExpenses);
      const additionalVariableCosts = calculateTotal(monthData.additionalVariableCosts);
      const totalExpenses = basicExpenses + additionalVariableCosts;
      const balance = netIncome - totalExpenses;

      return {
        name: monthName,
        'Receita Líquida': netIncome,
        'Total Despesas': totalExpenses,
        'Saldo': balance,
      };
    });

    const totals = summary.reduce((acc, month) => {
        acc['Receita Líquida'] += month['Receita Líquida'];
        acc['Total Despesas'] += month['Total Despesas'];
        acc['Saldo'] += month['Saldo'];
        return acc;
    }, { 'Receita Líquida': 0, 'Total Despesas': 0, 'Saldo': 0 });

    return { monthlySummary: summary, annualTotals: totals };

  }, [allData, currentYear]);


  if (Object.keys(allData).length === 0) {
    return (
        <div className="p-8 flex flex-col justify-center items-center text-light-text dark:text-dark-text">
            <p>Nenhum dado financeiro encontrado para exibir o resumo.</p>
        </div>
    );
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <main className="space-y-8 max-w-[1600px] mx-auto">
        {/* Chart Section */}
        <div className="p-6 rounded-xl shadow-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-center text-light-text dark:text-dark-text mb-4">
                Desempenho Mensal
            </h2>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={annualData.monthlySummary} 
                    margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                  >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-light-border/50 dark:stroke-dark-border/30" vertical={false} />
                      <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => `R$${(Number(value)/1000)}k`} stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                      <Legend iconType="circle" wrapperStyle={{fontSize: "14px", paddingTop: '20px'}}/>
                      <ReferenceLine y={0} stroke="currentColor" strokeWidth={1} strokeOpacity={0.7} />
                      
                      <Bar dataKey="Receita Líquida" name="Receita" fill="#22c55e" barSize={20} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Total Despesas" name="Despesas" fill="#ef4444" barSize={20} radius={[4, 4, 0, 0]} />
                      
                      <Line 
                          type="monotone" 
                          dataKey="Saldo" 
                          name="Saldo Mensal"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ r: 5, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }} 
                          activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                      />
                  </ComposedChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Table Section */}
        <div className="rounded-xl shadow-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border overflow-hidden">
            <h2 className="text-xl font-bold text-center text-light-text dark:text-dark-text p-6">
                Dados Consolidados
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-light-subtle dark:text-dark-subtle">
                  <thead className="text-xs text-light-text dark:text-dark-text uppercase bg-slate-100 dark:bg-slate-700/50">
                      <tr>
                          <th scope="col" className="px-4 sm:px-6 py-4 font-semibold">Mês</th>
                          <th scope="col" className="px-4 sm:px-6 py-4 text-right font-semibold">
                            <span className="hidden sm:inline">Receita Líquida</span>
                            <span className="sm:hidden">Receita</span>
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-4 text-right font-semibold">
                            <span className="hidden sm:inline">Total Despesas</span>
                            <span className="sm:hidden">Despesas</span>
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-4 text-right font-semibold">
                            <span className="hidden sm:inline">Saldo (p/ Investir)</span>
                            <span className="sm:hidden">Saldo</span>
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                      {annualData.monthlySummary.map((row, index) => (
                          <tr key={row.name} className={`border-t border-light-border dark:border-dark-border ${index % 2 === 0 ? 'bg-light-card dark:bg-dark-card' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                              <th scope="row" className="px-4 sm:px-6 py-4 font-medium text-light-text whitespace-nowrap dark:text-dark-text">{row.name}</th>
                              <td className="px-4 sm:px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(row['Receita Líquida'])}</td>
                              <td className="px-4 sm:px-6 py-4 text-right text-rose-600 dark:text-rose-400">{formatCurrency(row['Total Despesas'])}</td>
                              <td className={`px-4 sm:px-6 py-4 text-right font-bold ${row.Saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(row.Saldo)}</td>
                          </tr>
                      ))}
                  </tbody>
                  <tfoot className="font-bold text-light-text dark:text-dark-text bg-slate-100 dark:bg-slate-700/50 border-t-2 border-light-border dark:border-dark-border">
                      <tr>
                          <td className="px-4 sm:px-6 py-4 text-base">Total Anual</td>
                          <td className="px-4 sm:px-6 py-4 text-right text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(annualData.annualTotals['Receita Líquida'])}</td>
                          <td className="px-4 sm:px-6 py-4 text-right text-base text-rose-600 dark:text-rose-400">{formatCurrency(annualData.annualTotals['Total Despesas'])}</td>
                          <td className={`px-4 sm:px-6 py-4 text-right text-base font-extrabold ${annualData.annualTotals.Saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(annualData.annualTotals.Saldo)}</td>
                      </tr>
                  </tfoot>
              </table>
            </div>
        </div>
      </main>
    </div>
  );
};
