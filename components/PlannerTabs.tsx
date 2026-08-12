import React from 'react';
import { Activity, Target, TrendingUp } from 'lucide-react';

interface PlannerTabsProps {
    activeTab: 'payslip' | 'expenses' | 'investments';
    setActiveTab: (tab: 'payslip' | 'expenses' | 'investments') => void;
    isScrolled?: boolean;
}

export const PlannerTabs: React.FC<PlannerTabsProps> = ({ activeTab, setActiveTab, isScrolled }) => {
    const tabs = [
        { id: 'payslip' as const, label: 'HOLERITE', icon: Activity },
        { id: 'expenses' as const, label: 'CUSTOS', icon: Target },
        { id: 'investments' as const, label: 'INVESTIMENTOS', icon: TrendingUp },
    ];

    return (
        <div className={`flex justify-center items-center gap-1 animate-fadeIn overflow-x-auto no-scrollbar transition-all duration-500 ${isScrolled ? 'mt-3 pb-1' : 'mt-5 pb-1'}`}>
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[11px] tracking-widest transition-all duration-300 whitespace-nowrap ${
                        activeTab === id
                            ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                            : 'text-slate-500 dark:text-slate-400 hover:text-[#4F46E5] dark:hover:text-indigo-400 bg-transparent'
                    }`}
                >
                    <Icon size={14} className={activeTab === id ? 'animate-pulse' : ''} />
                    {label}
                </button>
            ))}
        </div>
    );
};
