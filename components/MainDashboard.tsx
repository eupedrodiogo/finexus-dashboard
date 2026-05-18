
import React from 'react';

export const MainDashboard: React.FC<any> = ({ totals }) => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard (Modo de Recuperação)</h1>
      <p>Ocorreu um problema técnico na compilação do Dashboard completo.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
          <p className="text-sm text-slate-500">Saldo Atual</p>
          <p className="text-xl font-bold">{totals.balance}</p>
        </div>
      </div>
      <p className="text-xs text-rose-500">Nota: O modo de personalização (arrastar widgets) está temporariamente desativado para restaurar o acesso ao app.</p>
    </div>
  );
};
