
import React from 'react';

interface SavingsRateIndicatorProps {
  netIncome: number;
  balance: number;
}

export const SavingsRateIndicator: React.FC<SavingsRateIndicatorProps> = ({ netIncome, balance }) => {
  const savingsRate = netIncome > 0 ? (balance / netIncome) * 100 : 0;
  
  const getIndicatorColor = (rate: number): string => {
    if (rate < 0) return 'stroke-red-500';
    if (rate < 10) return 'stroke-orange-500';
    if (rate < 20) return 'stroke-yellow-500';
    return 'stroke-green-500';
  };

  const getTextColor = (rate: number): string => {
    if (rate < 0) return 'text-red-500';
    if (rate < 10) return 'text-orange-500';
    if (rate < 20) return 'text-yellow-500';
    return 'text-green-500';
  };

  const colorClass = getIndicatorColor(savingsRate);
  const textColorClass = getTextColor(savingsRate);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Clamp the progress between 0 and 100 for the visual arc
  const clampedRate = Math.max(0, Math.min(savingsRate, 100));
  const offset = circumference - (clampedRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2" aria-label={`Taxa de poupança: ${savingsRate.toFixed(1)}%`}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="stroke-slate-200 dark:stroke-slate-600"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={`transition-all duration-500 ease-in-out ${colorClass}`}
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            role="presentation"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className={`text-2xl font-bold ${textColorClass}`}>
            {savingsRate.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            poupado
          </span>
        </div>
      </div>
       <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Taxa de Poupança</p>
    </div>
  );
};
