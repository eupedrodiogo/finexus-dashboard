import React, { useState } from 'react';

// --- Ícones Desenhados Manualmente (Sem dependências externas para garantir renderização a 100%) ---
const TargetIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const ZapIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckCircleIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const LandmarkIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>;
const ShieldCheckIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const RocketIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
const TrendingUpIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const WalletIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const BriefcaseIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const BuildingIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
const CalendarIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ListIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const GridIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const TrophyIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const PiggyBankIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-1.5L20 12V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>;
const ClockIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PieChartIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const HeartIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const FastForwardIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>;
const BabyIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 21.5c-3-3-4-6-4-9 0-3 1.5-5.5 4-5.5s4 2.5 4 5.5c0 3-1 6-4 9z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M10 14h4"/></svg>;
const LayersIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>;
const ScaleIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
const FlagIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const PlaneIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
const MapPinIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

// Dados Recalculados com o Reembolso de Abril e Patrimônio Acumulado (e novo aporte de março/2026)
const extratoData = [
  { id: 1, mes: 'Março/2026', entradas: 'R$ 8.509,25', extra: 'R$ 3.500,00', extraDetail: 'Devolução / Reembolso', despesas: 'R$ 3.683,00', invest: 'R$ 2.401,10', investDetail: 'Extrato Inter (Tesouro Direto)', patrimonio: 'R$ 2.401+', sobra: 'R$ 3.500,00', alvo: 'Pedro', status: '18 parcelas (60ª à 43ª)' },
  { id: 2, mes: 'Abril/2026', entradas: 'R$ 6.259,25', extra: 'R$ 1.250,00', extraDetail: 'Reembolso Santander', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 3.401+', sobra: 'R$ 1.576,25', alvo: 'Pedro', status: '6 parcelas (42ª à 37ª)' },
  { id: 3, mes: 'Maio/2026', entradas: 'R$ 5.285,01', extra: 'Consignado Ajustado', extraDetail: 'Sobra Fixa Consolidada (+ Triênio)', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 4.401+', sobra: 'R$ 602,01', alvo: 'Pedro', status: '3 parcelas (36ª à 34ª)' },
  { id: 4, mes: 'Junho/2026', entradas: 'R$ 5.324,53', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 5.401+', sobra: 'R$ 641,53', alvo: 'Pedro', status: 'Reta final (33ª à 31ª)' },
  { id: 5, mes: 'Julho/2026', entradas: 'R$ 5.361,93', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 6.401+', sobra: 'R$ 678,93', alvo: 'Pedro', status: 'Quitado 🏆' },
  { id: 6, mes: 'Agosto/2026', entradas: 'R$ 5.944,20', extra: '+ R$ 684,33', extraDetail: 'Salário Livre (Pedro quita folha)', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 7.401+', sobra: 'R$ 1.261,20', alvo: 'Izabel', status: '4 parcelas finais' },
  { id: 7, mes: 'Setembro/2026', entradas: 'R$ 5.966,93', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 8.401+', sobra: 'R$ 1.283,93', alvo: 'Izabel', status: '4 parcelas finais' },
  { id: 8, mes: 'Outubro/2026', entradas: 'R$ 5.988,50', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 9.401+', sobra: 'R$ 1.305,50', alvo: 'Izabel', status: '4 parcelas finais' },
  { id: 9, mes: 'Novembro/2026', entradas: 'R$ 6.010,35', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 10.401+', sobra: 'R$ 1.327,35', alvo: 'Izabel', status: '4 parcelas finais' },
  { id: 10, mes: 'Dezembro/2026', entradas: 'R$ 13.555,43', extra: '+ R$ 7.524,00', extraDetail: 'Efeito 13º Salário', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 11.401+', sobra: 'R$ 8.872,43', alvo: 'Izabel', status: '25 parcelas (Fim do contrato)' },
  { id: 11, mes: 'Janeiro/2027', entradas: 'R$ 7.462,89', extra: '+ R$ 1.500,00', extraDetail: 'Férias Izabel', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 12.401+', sobra: 'R$ 2.779,89', alvo: 'Izabel', status: '5 parcelas pesadas' },
  { id: 12, mes: 'Fevereiro/2027', entradas: 'R$ 6.083,00', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 13.401+', sobra: 'R$ 1.400,00', alvo: 'Izabel', status: '2 parcelas (Reta final)' },
  { id: 13, mes: 'Março/2027', entradas: 'R$ 6.083,00', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 14.401+', sobra: 'R$ 1.400,00', alvo: 'Izabel', status: '2 parcelas (Reta final)' },
  { id: 14, mes: 'Abril/2027', entradas: 'R$ 6.083,00', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 15.401+', sobra: 'R$ 1.400,00', alvo: 'Izabel', status: '2 parcelas (Reta final)' },
  { id: 15, mes: 'Maio/2027', entradas: 'R$ 6.100,13', extra: '-', extraDetail: '', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 16.401+', sobra: 'R$ 1.417,13', alvo: 'Izabel', status: 'Quitado 🏆' },
  { id: 16, mes: 'Junho/2027', entradas: 'R$ 7.082,57', extra: '100% Livres', extraDetail: 'Sem Desconto C/ Salário Limpo', despesas: 'R$ 3.683,00', invest: 'R$ 1.000,00', investDetail: 'Alocação Padrão Mensal', patrimonio: 'R$ 17.401+', sobra: 'R$ 2.399,57', alvo: 'Livre', status: 'Projeto TeraNexus 🚀' },
];

interface MasterPlanProps {
  isDarkMode: boolean;
}

export const MasterPlan: React.FC<MasterPlanProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const isDark = isDarkMode;

  // Configuração Responsiva do Tema (Claro/Escuro)
  const theme = {
    bgMain: "bg-transparent",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-500",
    textMuted: isDark ? "text-slate-500" : "text-slate-400",
    cardBg: isDark ? "bg-slate-900/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md",
    cardBorder: isDark ? "border-slate-800" : "border-slate-200",
    headerBorder: isDark ? "border-slate-800" : "border-slate-200",
    tagBg: isDark ? "bg-slate-900" : "bg-slate-100",
    tagBorder: isDark ? "border-slate-800" : "border-slate-200",
    progressBg: isDark ? "bg-slate-800" : "bg-slate-200",
    ringColor: isDark ? "ring-slate-900" : "ring-white",
    timelineBorder: isDark ? "border-slate-800" : "border-slate-200",
    badgeBg: isDark ? "bg-slate-950" : "bg-white",
    btnTheme: isDark ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100",
    shadowCard: isDark ? "shadow-black/20 text-slate-200" : "shadow-slate-200/50 text-slate-700",
    tableHeaderRow: isDark ? "bg-slate-800/50 text-slate-300" : "bg-slate-100 text-slate-600",
    tableRowBorder: isDark ? "border-slate-800" : "border-slate-200",
    tableRowHover: isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50",
    tabActiveBg: isDark ? "bg-emerald-500 text-slate-950" : "bg-emerald-500 text-white",
    tabInactiveBg: isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-200/70 text-slate-600 hover:bg-slate-300",
    alertBg: isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200",
    alertText: isDark ? "text-emerald-400" : "text-emerald-700",
    izabelCard: isDark ? "bg-slate-900/40" : "bg-white/60",
    planCardActive: isDark ? "bg-emerald-500/10 border-emerald-500 shadow-emerald-500/10" : "bg-emerald-50 border-emerald-500 shadow-emerald-500/10",
    planCardInactive: isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200",
    travelCard: isDark ? "bg-cyan-500/5 border-cyan-500/20" : "bg-cyan-50 border-cyan-200"
  };

  return (
    <div className={`w-full max-w-7xl mx-auto ${theme.bgMain} ${theme.shadowCard} transition-colors duration-300 animate-fadeIn`}>
      {/* Cabeçalho */}
      <header className={`mb-6 border-b ${theme.headerBorder} pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors`}>
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme.textPrimary} flex items-center gap-3 transition-colors`}>
            <TargetIcon className="text-emerald-500 h-8 w-8" />
            Master Plan 2026-2027
          </h1>
          <p className={`${theme.textSecondary} mt-1 text-sm md:text-base transition-colors`}>
            Plano Estratégico de Desalavancagem e Escala Patrimonial — Pedro &amp; Izabel
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${theme.tagBg} px-4 py-2 rounded-full border ${theme.tagBorder} transition-colors`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Sistema Ativo</span>
          </div>
        </div>
      </header>

      {/* Navegação por Abas */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-transparent">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'overview' ? theme.tabActiveBg : theme.tabInactiveBg}`}
        >
          <GridIcon className="w-4 h-4" /> Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('izabel')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'izabel' ? theme.tabActiveBg : theme.tabInactiveBg}`}
        >
          <HeartIcon className="w-4 h-4" /> Visão Izabel
        </button>
        <button 
          onClick={() => setActiveTab('comparativo')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'comparativo' ? theme.tabActiveBg : theme.tabInactiveBg}`}
        >
          <ScaleIcon className="w-4 h-4" /> Comparativo Tático
        </button>
        <button 
          onClick={() => setActiveTab('carteira')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'carteira' ? theme.tabActiveBg : theme.tabInactiveBg}`}
        >
          <PieChartIcon className="w-4 h-4" /> A Carteira (Plano 1)
        </button>
        <button 
          onClick={() => setActiveTab('extrato')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'extrato' ? theme.tabActiveBg : theme.tabInactiveBg}`}
        >
          <ListIcon className="w-4 h-4" /> Extrato Financeiro
        </button>
        <button 
          onClick={() => setActiveTab('futuro')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'futuro' ? 'bg-amber-500 text-slate-950' : theme.tabInactiveBg}`}
        >
          <FlagIcon className={`w-4 h-4 ${activeTab !== 'futuro' ? 'text-amber-500' : ''}`} /> Futuro (2027+)
        </button>
        <button 
          onClick={() => setActiveTab('viagem')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-sm ${activeTab === 'viagem' ? 'bg-cyan-500 text-slate-950' : theme.tabInactiveBg}`}
        >
          <PlaneIcon className={`w-4 h-4 ${activeTab !== 'viagem' ? 'text-cyan-500' : ''}`} /> Férias 2028
        </button>
      </div>

      {/* ABA: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn duration-500">
          
          {/* Alerta de Reembolso do Banco Central */}
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-4 ${theme.alertBg}`}>
            <TrophyIcon className={`w-6 h-6 mt-0.5 shrink-0 ${theme.alertText}`} />
            <div>
              <h4 className={`font-bold ${theme.alertText}`}>Ataque Validado: Restituição do Santander (Abril/2026)</h4>
              <p className={`text-sm mt-1 ${theme.textSecondary} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                A notificação oficial contra o desconto indevido vai gerar o reembolso retroativo. Estimamos a entrada de <strong>R$ 1.250,00</strong> na sua conta em Abril. Este valor cria uma super amortização de R$ 1.576,00, cortando 6 parcelas de uma vez!
              </p>
            </div>
          </div>

          {/* Cartões Principais (KPIs) */}
          <div className="flex flex-col gap-4 mb-8 cursor-default">
            
            <div className={`${theme.cardBg} border border-orange-500/20 rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300 group overflow-hidden`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`text-orange-500 font-bold text-xs uppercase tracking-widest mb-1`}>Patrimônio Atual</p>
                  <h3 className={`text-3xl font-black ${theme.textPrimary} tracking-tighter`}>R$ 2.411,55</h3>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <PiggyBankIcon className="h-6 w-6" />
                </div>
              </div>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5 mt-2`}>
                <CheckCircleIcon className="h-4 w-4 text-orange-500" />
                Banco Inter (Tesouro Selic)
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300 group overflow-hidden`}>
               <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`${theme.textSecondary} font-bold text-xs uppercase tracking-widest mb-1`}>Fundo de Guerra (Dívida)</p>
                  <h3 className={`text-3xl font-black ${theme.textPrimary} tracking-tighter`}>R$ 4.750,00</h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <ZapIcon className="h-6 w-6" />
                </div>
              </div>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5 mt-2`}>
                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                Devolução + Reembolso
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300 group overflow-hidden`}>
               <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`${theme.textSecondary} font-bold text-xs uppercase tracking-widest mb-1`}>Aporte de Março</p>
                  <h3 className={`text-3xl font-black text-blue-500 tracking-tighter`}>R$ 2.411,55</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <LandmarkIcon className="h-6 w-6" />
                </div>
              </div>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5 mt-2`}>
                <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                Meta pulverizada (+140%)
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300 group overflow-hidden`}>
               <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`${theme.textSecondary} font-bold text-xs uppercase tracking-widest mb-1`}>Cashflow Livre (Jun/27)</p>
                  <h3 className={`text-3xl font-black ${theme.textPrimary} tracking-tighter`}>R$ 2.399<span className={`text-sm font-normal ${theme.textMuted}`}>/mês</span></h3>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                  <RocketIcon className="h-6 w-6" />
                </div>
              </div>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5 mt-2`}>
                <TrendingUpIcon className="h-4 w-4 text-purple-500" />
                P/ o projeto TeraNexus
              </div>
            </div>

          </div>

          <div className="w-full">
            <div className="">
              <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 md:p-8 transition-colors duration-300 shadow-xl ${theme.shadowCard}`}>
                <h2 className={`text-lg font-black ${theme.textPrimary} flex items-center gap-3 mb-10`}>
                  <CalendarIcon className="h-6 w-6 text-emerald-500" />
                  Cronologia de Desalavancagem (A Guerra Contra os Juros)
                </h2>
                <div className={`relative border-l-2 ${theme.timelineBorder} ml-3 md:ml-6 space-y-12`}>
                  
                  {/* Março e Abril */}
                  <div className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ${theme.ringColor} shadow-lg shadow-emerald-500/50`}></div>
                    <h3 className={`text-lg font-black ${theme.textPrimary} flex flex-wrap items-center gap-3`}>
                      Março &amp; Abril / 2026 
                      <span className="text-[10px] font-black px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg tracking-widest leading-none">AGORA</span>
                    </h3>
                    <p className={`${theme.textSecondary} mt-3 text-sm md:text-base leading-relaxed`}>
                      Injeção dupla: <strong className={isDark ? "text-slate-200" : "text-slate-700"}>R$ 3.560</strong> de devolução seguidos de <strong className={isDark ? "text-slate-200" : "text-slate-700"}>R$ 1.250</strong> do Reembolso Santander. Contrato do Pedro encolhe massivamente.
                    </p>
                  </div>

                  {/* Maio 2026 */}
                  <div className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-blue-500 ring-4 ${theme.ringColor}`}></div>
                    <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Maio de 2026</h3>
                    <p className={`${theme.textSecondary} mt-2 text-sm md:text-base leading-relaxed`}>
                      Entrada do <strong className={isDark ? "text-slate-200" : "text-slate-700"}>Triênio (5%)</strong> + contracheque com desconto corrigido e reduzido.
                    </p>
                  </div>

                  {/* Julho 2026 */}
                  <div className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[15px] top-0 w-7 h-7 rounded-full ${theme.cardBg} border-2 border-emerald-500 flex items-center justify-center`}><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div></div>
                    <h3 className="text-xl font-black text-emerald-500">Julho de 2026</h3>
                    <p className={`${theme.textSecondary} mt-2 text-sm md:text-base font-bold`}>🏆 Contrato Pedro 100% quitado. Inicia o ataque à Izabel.</p>
                  </div>

                  {/* Fim de 2026 / Início 2027 */}
                  <div className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-amber-500 ring-4 ${theme.ringColor}`}></div>
                    <h3 className={`text-lg font-bold ${theme.textPrimary}`}>Dezembro/26 e Janeiro/27</h3>
                    <p className={`${theme.textSecondary} mt-2 text-sm md:text-base leading-relaxed`}>O grande bombardeamento com o <strong className={isDark ? "text-slate-200" : "text-slate-700"}>13º Salário</strong> e as <strong className={isDark ? "text-slate-200" : "text-slate-700"}>Férias</strong>. Capital pulverizado.</p>
                  </div>

                  {/* Maio 2027 */}
                  <div className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[17px] top-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-4 ${theme.ringColor} flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]`}><CheckCircleIcon className="h-5 w-5 text-white" /></div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 tracking-tight">Maio de 2027</h3>
                    <p className={`${theme.textSecondary} mt-2 text-sm md:text-base font-black`}>🏆 Dívidas extintas. Salários livres e foco no TeraNexus.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: CARTEIRA DE INVESTIMENTOS */}
      {activeTab === 'carteira' && (
        <div className="animate-fadeIn duration-500">
          <div className="mb-6">
            <h2 className={`text-xl md:text-2xl font-black ${theme.textPrimary}`}>O Seu Império em Construção</h2>
            <p className={`${theme.textSecondary} text-sm mt-1`}>Soma exata de todos os aportes realizados em Março: R$ 2.411,55.</p>
          </div>
          
          <div className="flex flex-col gap-4 mb-8 cursor-default">
            <div className={`${theme.cardBg} border border-orange-500/30 rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300`}>
              <p className={`text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2`}>Saldo Consolidado</p>
              <h3 className={`text-3xl font-black ${theme.textPrimary} tracking-tighter mb-4`}>R$ 2.411,55</h3>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5`}>
                <LandmarkIcon className="h-4 w-4" /> Tesouro Selic 2031
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300`}>
              <p className={`${theme.textSecondary} font-bold text-[10px] uppercase tracking-widest mb-2`}>Aporte Programado</p>
              <h3 className={`text-3xl font-black ${theme.textPrimary} tracking-tighter mb-4`}>R$ 1.000<span className={`text-lg font-normal ${theme.textMuted}`}>/mês</span></h3>
              <div className={`text-xs text-blue-500 flex items-center gap-1.5`}>
                <ClockIcon className="h-4 w-4" /> 75% Selic | 25% FIIs (a partir de Abril)
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 shadow-xl ${theme.shadowCard} transition-all duration-300`}>
              <p className={`${theme.textSecondary} font-bold text-[10px] uppercase tracking-widest mb-2`}>Meta Maio/2027</p>
              <h3 className={`text-3xl font-black text-emerald-500 tracking-tighter mb-4`}>&gt; R$ 17.411</h3>
              <div className={`text-xs ${theme.textSecondary} flex items-center gap-1.5`}>
                <TrendingUpIcon className="h-4 w-4 text-emerald-500" /> Sem contabilizar juros e dividendos
              </div>
            </div>
          </div>
          
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden transition-colors duration-300 shadow-xl ${theme.shadowCard}`}>
              <h2 className={`text-lg font-black ${theme.textPrimary} flex items-center gap-3 mb-6`}>
                 <PieChartIcon className="h-5 w-5 text-blue-500" />
                 Engenharia de Alocação Mensal
              </h2>
              <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}><LandmarkIcon className={`h-4 w-4 ${theme.textSecondary}`}/> Tesouro Selic</span>
                      <span className={`${theme.textPrimary} font-black text-[10px] md:text-xs`}>R$ 750 (75%)</span>
                    </div>
                    <div className={`w-full ${theme.progressBg} rounded-full h-3 overflow-hidden shadow-inner`}>
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}><BriefcaseIcon className={`h-4 w-4 ${theme.textSecondary}`}/> FII Papel (MXRF11)</span>
                      <span className={`${theme.textPrimary} font-black text-[10px] md:text-xs`}>R$ 145 (15%)</span>
                    </div>
                    <div className={`w-full ${theme.progressBg} rounded-full h-3 overflow-hidden shadow-inner`}>
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}><BuildingIcon className={`h-4 w-4 ${theme.textSecondary}`}/> FII Tijolo (BTLG11)</span>
                      <span className={`${theme.textPrimary} font-black text-[10px] md:text-xs`}>R$ 105 (10%)</span>
                    </div>
                    <div className={`w-full ${theme.progressBg} rounded-full h-3 overflow-hidden shadow-inner`}>
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
              </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-6 md:p-8 shadow-xl ${theme.shadowCard} mb-8 cursor-default`}>
            <h2 className={`text-lg font-black ${theme.textPrimary} flex items-center gap-3 mb-6`}>
              <WalletIcon className="h-5 w-5 text-emerald-500" />
              Ativos na Carteira
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-black ${theme.textPrimary} flex items-center gap-2`}><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Tesouro Selic</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded">Segurança</span>
                </div>
                <p className={`text-xs ${theme.textSecondary}`}>Reserva no Banco Inter para liquidez imediata.</p>
                <p className={`text-xs font-bold ${theme.textPrimary} mt-2`}>Saldo Atual: <span className="text-blue-500 tracking-tight">R$ 2.411,55</span></p>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-black ${theme.textPrimary} flex items-center gap-2`}><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> FII MXRF11</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">Dividendos</span>
                </div>
                <p className={`text-xs ${theme.textSecondary} mb-2`}>A compra mensal rende as 14 cotas.</p>
                <p className={`text-[11px] font-bold ${theme.textPrimary}`}>A iniciar em Abril.</p>
              </div>
              
              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-black ${theme.textPrimary} flex items-center gap-2`}><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> FII BTLG11</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">Tijolo Real</span>
                </div>
                <p className={`text-xs ${theme.textSecondary} mb-2`}>Galpões logísticos premium.</p>
                <p className={`text-[11px] font-bold ${theme.textPrimary}`}>A iniciar em Abril.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ABA: EXTRATO FINANCEIRO COMPLETO */}
      {activeTab === 'extrato' && (
        <div className="animate-fadeIn duration-500">
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl shadow-xl ${theme.shadowCard} overflow-hidden`}>
            
            <div className={`p-6 md:p-8 border-b ${theme.cardBorder} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div>
                <h2 className={`text-xl font-black ${theme.textPrimary} flex items-center gap-3`}>
                  <ListIcon className="h-6 w-6 text-blue-500" />
                  Fluxo de Caixa e Amortizações
                </h2>
                <p className={`${theme.textSecondary} text-sm mt-2 font-medium`}>Todos os cálculos refletem a entrada do Reembolso do Santander no mês de Abril de 2026.</p>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-2">
              <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal min-w-[800px]">
                <thead className={`${theme.tableHeaderRow}`}>
                  <tr>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Mês / Ano</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Salários Normais</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Aceleração Extra</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Aporte Mensal</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Patrimônio Acum.</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Sobra (Para Dívida)</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Alvo</th>
                    <th className="px-6 py-5 font-black text-xs uppercase tracking-wider">Efeito no Contrato</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-200'}`}>
                  {extratoData.map((row) => (
                    <tr key={row.id} className={`${theme.tableRowBorder} ${theme.tableRowHover} transition-colors`}>
                      <td className={`px-6 py-4 font-black ${theme.textPrimary}`}>{row.mes}</td>
                      <td className={`px-6 py-4 font-medium ${theme.textSecondary}`}>{row.entradas}</td>
                      <td className={`px-6 py-4 font-black ${row.extra !== '-' ? 'text-emerald-500' : theme.textSecondary}`}>
                        <div>{row.extra}</div>
                        {row.extraDetail && <div className={`text-[10px] mt-1 font-bold lowercase opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.extraDetail}</div>}
                      </td>
                      <td className={`px-6 py-4 font-black text-blue-500`}>
                        <div>{row.invest}</div>
                        {row.investDetail && <div className={`text-[10px] mt-1 font-bold opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.investDetail}</div>}
                      </td>
                      <td className={`px-6 py-4 font-black text-emerald-500`}>
                        {row.patrimonio}
                      </td>
                      <td className={`px-6 py-4 font-black ${theme.textPrimary}`}>{row.sobra}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg 
                          ${row.alvo === 'Pedro' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm' : ''}
                          ${row.alvo === 'Izabel' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm' : ''}
                          ${row.alvo === 'Livre' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm' : ''}
                        `}>
                          {row.alvo}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-xs ${row.status.includes('Quitado') || row.status.includes('🚀') ? 'font-black text-amber-500' : 'font-bold ' + theme.textSecondary}`}>
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={`p-5 ${theme.tableHeaderRow} text-xs font-black tracking-wide text-center uppercase`}>
              A Matemática não mente: O &quot;Efeito Bola de Neve&quot; ao contrário garante a morte das dívidas antes de 2028.
            </div>

          </div>
        </div>
      )}

      {/* --- ABA 2: VISÃO IZABEL --- */}
      {activeTab === 'izabel' && (
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4 max-w-5xl mx-auto">
          <div className={`${theme.izabelCard} border rounded-3xl p-6 md:p-10 relative overflow-hidden`}>
            {/* Decoração de Fundo com as cores principais (Verde e Rosa) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10">
              {/* Título Principal */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                  <HeartIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className={`text-2xl md:text-3xl font-black ${theme.textPrimary}`}>A Estratégia por Trás do Plano 1</h2>
                  <p className={`${theme.textSecondary} mt-1`}>Um resumo visual preparado especialmente para a Izabel.</p>
                </div>
              </div>

              {/* Bloco 1: A Nossa Realidade (Despesas e Orçamento) */}
              <div className="mb-12">
                <h3 className={`text-xl font-bold ${theme.textPrimary} mb-4 flex items-center gap-2`}>
                  <TargetIcon className="w-5 h-5 text-emerald-500" /> A Nossa Realidade Atual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className={`${theme.textSecondary} text-sm mb-3`}>O Foco Principal (R$ 750)</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><ShieldCheckIcon className="w-6 h-6"/></div>
                      <div>
                        <p className={`font-bold ${theme.textPrimary}`}>A Defesa Absoluta</p>
                        <p className={`text-xs ${theme.textSecondary}`}>Garantir o ninho do João Vitor no Tesouro Selic.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className={`${theme.textSecondary} text-sm mb-3`}>O Foco Secundário (Sobra Mensal)</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><ZapIcon className="w-6 h-6"/></div>
                      <div>
                        <p className={`font-bold ${theme.textPrimary}`}>A Guerra contra Juros</p>
                        <p className={`text-xs ${theme.textSecondary}`}>Esmagar o Santander o mais rápido possível.</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* O Alerta sobre o Orçamento de R$ 250 */}
                <div className={`mt-6 p-4 rounded-xl border border-emerald-500/30 ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'} text-center`}>
                  <p className={`${theme.textPrimary} font-medium`}>
                    Isso deixa-nos com um orçamento "curto" de apenas <span className="font-bold text-emerald-500 text-lg">R$ 250,00 por mês</span> para começar a investir na Bolsa de Valores.
                  </p>
                </div>
              </div>

              {/* Bloco 2: O Duelo de Velocidade (Plano 1 vs Plano 2) */}
              <div className="mb-12">
                <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6 flex items-center gap-2`}>
                  <FastForwardIcon className="w-5 h-5 text-emerald-500" /> Por que o Plano 1 (Acelerador) Vence?
                </h3>
                
                <p className={`${theme.textSecondary} mb-6 leading-relaxed`}>
                  O segredo para não desistir de investir quando a vida está difícil é a <strong className={theme.textPrimary}>motivação visual</strong>. Nós precisamos de ver o nosso dinheiro a trabalhar sozinho rápido. Chamamos a isso a "Mágica da Bola de Neve". Veja a diferença com os nossos R$ 250 mensais:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Caixa: Plano 2 (Rejeitado agora) */}
                  <div className={`p-6 rounded-2xl border ${theme.cardBorder} opacity-60 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-500/10 rounded-bl-full flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-slate-500 mb-2 ml-2" />
                    </div>
                    <h4 className={`font-bold ${theme.textPrimary} mb-1 text-lg`}>O Plano 2 (A Fortaleza)</h4>
                    <p className={`text-xs ${theme.textSecondary} mb-4`}>Fundos de elite que custam mais de R$ 100.</p>
                    <ul className={`space-y-3 text-sm ${theme.textPrimary}`}>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> Compramos apenas 2 cotas/mês.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> Elas geram uns R$ 2,00 por mês.</li>
                    </ul>
                    <div className="mt-6 pt-4 border-t border-slate-500/20">
                      <p className={`text-sm font-bold text-amber-500 flex items-center gap-2`}>
                        <ClockIcon className="w-4 h-4" /> Demora 50 Meses (4 Anos)
                      </p>
                      <p className={`text-xs ${theme.textSecondary} mt-1`}>Para o dividendo ser suficiente para comprar 1 cota extra sozinho.</p>
                    </div>
                  </div>

                  {/* Caixa: Plano 1 (O Vencedor) */}
                  <div className={`p-6 rounded-2xl border-2 border-emerald-500 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-bl-full flex items-center justify-center">
                      <RocketIcon className="w-5 h-5 text-emerald-500 mb-2 ml-2" />
                    </div>
                    <h4 className={`font-bold ${theme.textPrimary} mb-1 text-lg`}>O Plano 1 (O Acelerador)</h4>
                    <p className={`text-xs ${theme.textSecondary} mb-4`}>O fundo BTLG11 (R$ 105) + O MXRF11 (R$ 10).</p>
                    <ul className={`space-y-3 text-sm ${theme.textPrimary}`}>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Compramos logo 14 cotas/mês.</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Os dividendos somam-se muito rápido.</li>
                    </ul>
                    <div className="mt-6 pt-4 border-t border-emerald-500/20">
                      <p className={`text-sm font-bold text-emerald-500 flex items-center gap-2`}>
                        <ZapIcon className="w-4 h-4" /> Demora apenas 7 Meses
                      </p>
                      <p className={`text-xs ${theme.textSecondary} mt-1`}>Para o dividendo ultrapassar os R$ 10,00 e começar a <strong className="text-emerald-500">comprar 1 cota nova "de graça" todos os meses!</strong></p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bloco 3: O Veredito */}
              <div className={`p-6 md:p-8 rounded-2xl ${isDark ? 'bg-slate-950/50' : 'bg-white'} border ${theme.cardBorder}`}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <BabyIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-2`}>O Nosso Foco Principal</h3>
                    <p className={`${theme.textSecondary} text-sm leading-relaxed mb-4`}>
                      A vossa guerra agora não é ficar ricos do dia para a noite na Bolsa de Valores. A vossa guerra é esmagar o banco e preparar o ninho para o João Vitor.
                    </p>
                    <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
                      O <strong>Plano 1</strong> é a injeção de ânimo que vocês precisam. Quando bater o cansaço de pagar os boletos, vocês vão abrir a corretora e ver a "Fábrica de Cotas" a gerar filhotes sozinha. O Plano 2 (A Fortaleza) foi descartado? Não! <strong className={theme.textPrimary}>Ele é a nossa meta oficial para Junho de 2027</strong>, quando vocês já não tiverem dívidas e tiverem quase R$ 2.400,00 livres por mês para investir com peso!
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- ABA 3: COMPARATIVO TÁTICO --- */}
      {activeTab === 'comparativo' && (
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>O Duelo Estratégico de Março</h2>
            <p className={`${theme.textSecondary} text-sm`}>
              Qual é o plano mais inteligente para o seu momento atual de desalavancagem e formação de caixa?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Bloco: PLANO 1 - ACELERADOR */}
            <div className={`rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 relative ${theme.planCardActive}`}>
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                <FastForwardIcon className="w-3 h-3" /> Mais Inteligente Agora
              </div>

              <h3 className={`text-2xl font-black ${theme.textPrimary} mb-1`}>Plano 1: Acelerador</h3>
              <p className={`${theme.textSecondary} text-sm mb-6`}>Foco em Dopamina Financeira e Hábitos Rápidos.</p>

              <div className="space-y-4 mb-8">
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Ativos Selecionados</span>
                  <span className={`font-bold ${theme.textPrimary}`}>MXRF11 + BTLG11</span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Alocação Mensal (~R$ 250)</span>
                  <span className={`font-bold ${theme.textPrimary} text-right`}>14 Cotas Papel<br/><span className="text-xs font-normal">1 Cota Tijolo</span></span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Tempo p/ "Cota Infinita"</span>
                  <span className={`font-bold text-emerald-500 flex items-center gap-1`}><ZapIcon className="w-4 h-4"/> ~7 meses</span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Dividendos Estimados (Mês 1)</span>
                  <span className={`font-bold ${theme.textPrimary}`}>~R$ 2,20</span>
                </div>
              </div>
            </div>

            {/* Bloco: PLANO 2 - INSTITUCIONAL */}
            <div className={`rounded-2xl border p-6 md:p-8 transition-all duration-300 ${theme.planCardInactive}`}>
              <h3 className={`text-2xl font-black ${theme.textPrimary} mb-1`}>Plano 2: Fortaleza Premium</h3>
              <p className={`${theme.textSecondary} text-sm mb-6`}>Foco em Qualidade Institucional "Buy & Forget".</p>

              <div className="space-y-4 mb-8">
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Ativos Selecionados</span>
                  <span className={`font-bold ${theme.textPrimary}`}>KNCR11 + HGLG11</span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Alocação Mensal (~R$ 262)</span>
                  <span className={`font-bold ${theme.textPrimary} text-right`}>1 Cota Papel<br/><span className="text-xs font-normal">1 Cota Tijolo</span></span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Tempo p/ "Cota Infinita"</span>
                  <span className={`font-bold text-amber-500 flex items-center gap-1`}><CalendarIcon className="w-4 h-4"/> ~50 meses</span>
                </div>
                <div className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <span className={`${theme.textSecondary} text-sm`}>Dividendos Estimados (Mês 1)</span>
                  <span className={`font-bold ${theme.textPrimary}`}>~R$ 2,10</span>
                </div>
              </div>
            </div>

          </div>

          {/* --- GRÁFICO 1: CRESCIMENTO RENDA PASSIVA --- */}
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 md:p-8 shadow-lg mb-8 max-w-4xl mx-auto`}>
            <div className="mb-6 text-center">
              <h3 className={`text-xl font-bold ${theme.textPrimary} flex items-center justify-center gap-2`}>
                <TrendingUpIcon className="w-6 h-6 text-blue-500" />
                Efeito Bola de Neve: Crescimento da Renda Passiva
              </h3>
              <p className={`${theme.textSecondary} text-sm mt-1`}>Evolução dos dividendos mensais (R$) ao longo de 24 meses</p>
            </div>
            
            <div className="h-64 mt-8 flex items-end justify-between gap-2 md:gap-6 relative">
              {/* Linhas de fundo do gráfico */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
                ))}
              </div>
              
              {/* Função que gera as barras duplas (Verde vs Cinza) a partir de um Array de dados */}
              {[
                { mes: 'Mês 1', p1: 2.2, p2: 2.1 },
                { mes: 'Mês 6', p1: 14.5, p2: 12.6 },
                { mes: 'Mês 12', p1: 33.5, p2: 25.2 },
                { mes: 'Mês 18', p1: 58.0, p2: 38.0 },
                { mes: 'Mês 24', p1: 89.0, p2: 52.0 },
              ].map((data, index) => (
                <div key={index} className="relative flex-1 flex flex-col items-center justify-end h-full z-10 group">
                  <div className="flex w-full justify-center gap-1 md:gap-2 items-end h-[85%]">
                    {/* Barra Verde (Plano 1) */}
                    <div className="w-full max-w-[40px] bg-emerald-500/90 hover:bg-emerald-400 rounded-t-md relative flex justify-center transition-all duration-500" style={{ height: `${(data.p1 / 89) * 100}%` }}>
                      <span className={`absolute -top-6 text-xs font-bold ${theme.textPrimary}`}>R${Math.round(data.p1)}</span>
                    </div>
                    {/* Barra Cinza (Plano 2) */}
                    <div className="w-full max-w-[40px] bg-slate-600/80 hover:bg-slate-500 rounded-t-md relative flex justify-center transition-all duration-500" style={{ height: `${(data.p2 / 89) * 100}%` }}>
                      <span className={`absolute -top-6 text-xs font-bold ${theme.textSecondary}`}>R${Math.round(data.p2)}</span>
                    </div>
                  </div>
                  <div className={`mt-4 text-xs md:text-sm font-medium ${theme.textSecondary}`}>{data.mes}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center items-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className={`text-sm font-medium ${theme.textPrimary}`}>Plano 1 (Acelerador)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>Plano 2 (Institucional)</span>
              </div>
            </div>
          </div>

          {/* --- GRÁFICO 2: A FÁBRICA DE COTAS (BARRAS EMPILHADAS) --- */}
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 md:p-8 shadow-lg mb-8 max-w-4xl mx-auto`}>
            <div className="mb-6 text-center">
              <h3 className={`text-xl font-bold ${theme.textPrimary} flex items-center justify-center gap-2`}>
                <LayersIcon className="w-6 h-6 text-emerald-500" />
                A "Fábrica de Cotas" (Plano 1 - MXRF11)
              </h3>
              <p className={`${theme.textSecondary} text-sm mt-1`}>O momento exato em que os dividendos ganham vida e compram novas cotas sozinhos</p>
            </div>
            
            <div className="h-72 mt-12 flex items-end justify-between gap-2 md:gap-6 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
                ))}
              </div>
              
              {/* Função que constrói as barras sobrepostas (Suor vs Dividendos) */}
              {[
                { mes: 'Mês 1', suor: 14, div: 0, vel: 'Acumulando...' },
                { mes: 'Mês 6', suor: 84, div: 2, vel: 'Quase 1/mês' },
                { mes: 'Mês 12', suor: 168, div: 12, vel: '+1 Grátis/mês' },
                { mes: 'Mês 18', suor: 252, div: 29, vel: '+2 Grátis/mês' },
                { mes: 'Mês 24', suor: 336, div: 56, vel: '+3 Grátis/mês' },
              ].map((data, index) => {
                const total = 336 + 56; // Teto para escalar o gráfico (100%)
                const suorHeight = (data.suor / total) * 100;
                const divHeight = (data.div / total) * 100;
                
                return (
                  <div key={index} className="relative flex-1 flex flex-col items-center justify-end h-full z-10 group">
                    <div className="flex flex-col w-full max-w-[48px] justify-end items-center h-[85%]">
                      
                      {/* O topo da barra: As cotas geradas pelos dividendos (Verde Neon) */}
                      {data.div > 0 && (
                        <div className="w-full bg-emerald-400 rounded-t-sm relative flex justify-center items-center transition-all duration-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]" style={{ height: `${divHeight}%` }}>
                          <span className={`text-[10px] md:text-xs font-bold text-slate-900`}>{data.div}</span>
                        </div>
                      )}
                      
                      {/* A base da barra: As cotas compradas com o seu salário (Cinza Escuro) */}
                      <div className={`w-full bg-slate-700 ${data.div === 0 ? 'rounded-t-sm' : ''} relative flex justify-center items-center transition-all duration-500`} style={{ height: `${suorHeight}%` }}>
                         <span className={`text-[10px] md:text-xs font-bold text-slate-300`}>{data.suor}</span>
                      </div>
                    </div>
                    {/* A Etiqueta flutuante do "Ponto Mágico" */}
                    <div className={`absolute -top-8 whitespace-nowrap text-xs md:text-sm font-bold ${data.div > 10 ? 'text-emerald-500' : theme.textSecondary}`}>
                      {data.vel}
                    </div>
                    <div className={`mt-4 text-xs md:text-sm font-medium ${theme.textSecondary}`}>{data.mes}</div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-center items-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-slate-700"></div>
                <span className={`text-sm font-medium ${theme.textPrimary}`}>Cotas Compradas (Seu Aporte)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                <span className={`text-sm font-medium ${theme.textPrimary}`}>Cotas "Grátis" (A Bola de Neve)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- NOVA ABA: FUTURO (2027+) --- */}
      {activeTab === 'futuro' && (
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          {/* Cabeçalho da Aba */}
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-500 rounded-full mb-4">
              <FlagIcon className="w-8 h-8" />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black ${theme.textPrimary} mb-2`}>A Linha de Chegada: Junho de 2027</h2>
            <p className={`${theme.textSecondary} text-sm md:text-base`}>
              O momento exato em que a dívida do Santander zera e o vosso Cashflow Livre salta para <strong className="text-emerald-500">R$ 2.400,00 mensais</strong>. É aqui que iniciamos a Verdadeira Diversificação (O Antigo Plano 2).
            </p>
          </div>

          {/* Cards Superiores: Distribuição dos R$ 2.400 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
              <p className={`${theme.textSecondary} font-bold text-sm uppercase mb-2`}>Caixa de Emergência</p>
              <h3 className={`text-3xl font-black text-blue-500 mb-1`}>R$ 800</h3>
              <p className={`${theme.textSecondary} text-xs mt-2`}>Tesouro Selic (Aumentamos o aporte para blindar o TeraNexus)</p>
            </div>
            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <p className={`${theme.textSecondary} font-bold text-sm uppercase mb-2`}>Ataque Papel</p>
              <h3 className={`text-3xl font-black text-emerald-500 mb-1`}>R$ 700</h3>
              <p className={`${theme.textSecondary} text-xs mt-2`}>Dividendos: <strong className={theme.textPrimary}>MXRF11 + KNCR11</strong></p>
            </div>
            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
              <p className={`${theme.textSecondary} font-bold text-sm uppercase mb-2`}>Ataque Tijolo</p>
              <h3 className={`text-3xl font-black text-purple-500 mb-1`}>R$ 900</h3>
              <p className={`${theme.textSecondary} text-xs mt-2`}>Património: <strong className={theme.textPrimary}>BTLG11 + HGLG11</strong> (Elite Logística)</p>
            </div>
          </div>

          {/* Tabela: O Calendário Oficial de Compras */}
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl shadow-lg ${theme.shadowCard} overflow-hidden mb-8`}>
            <div className={`p-6 border-b ${theme.cardBorder} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-amber-500/5`}>
              <div>
                <h2 className={`text-xl font-bold ${theme.textPrimary} flex items-center gap-2`}>
                  <CalendarIcon className="h-5 w-5 text-amber-500" />
                  Calendário Oficial (Fase 2)
                </h2>
                <p className={`${theme.textSecondary} text-sm mt-1`}>A rotina de execução pós-dívidas (A partir de Junho/2027)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`${theme.tableHeaderRow}`}>
                  <tr>
                    <th className="px-6 py-4 font-semibold">Mês / Ano</th>
                    <th className="px-6 py-4 font-semibold">Segurança</th>
                    <th className="px-6 py-4 font-semibold text-emerald-500">FIIs Papel (Renda)</th>
                    <th className="px-6 py-4 font-semibold text-purple-500">FIIs Tijolo (Imóveis)</th>
                    <th className="px-6 py-4 font-semibold">Aporte Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-200'}`}>
                  {/* Geração Dinâmica das Linhas da Tabela de Junho a Dezembro */}
                  {[
                    { mes: 'Jun/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Jul/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Ago/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Set/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Out/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Nov/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                    { mes: 'Dez/2027', selic: 'R$ 800', papel: 'MXRF11 + KNCR11 (R$ 700)', tijolo: 'BTLG11 + HGLG11 (R$ 900)' },
                  ].map((row, index) => (
                    <tr key={index} className={`${theme.tableRowBorder} ${theme.tableRowHover} transition-colors`}>
                      <td className={`px-6 py-4 font-bold ${theme.textPrimary}`}>{row.mes}</td>
                      <td className={`px-6 py-4 font-medium text-blue-500`}>{row.selic}</td>
                      <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.papel}</td>
                      <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.tijolo}</td>
                      <td className={`px-6 py-4 font-bold ${theme.textPrimary}`}>R$ 2.400,00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Destaque: O Ano de 2028 (Aceleração Exponencial) */}
          <div className={`${theme.cardBg} border-2 border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden`}>
             <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
             <h3 className={`text-xl font-bold ${theme.textPrimary} mb-4 flex items-center gap-2`}>
                <RocketIcon className="w-6 h-6 text-amber-500" />
                Fase 3: O Ano de 2028 (Aceleração Exponencial)
             </h3>
             <p className={`${theme.textSecondary} mb-4`}>
                Em 2028, todos os ganhos extraordinários que recebem vão diretamente inflar o vosso império financeiro ou o vosso negócio (TeraNexus). Já não há dívidas a sugar os vossos rendimentos extras.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className={`p-4 rounded-xl border ${theme.cardBorder} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <strong className={`block text-emerald-500 mb-1`}>Jan/Fev 2028: Super Aporte de Férias</strong>
                    <span className={`text-sm ${theme.textSecondary}`}>O bónus de férias da Izabel (~R$ 3.000) entra diretamente para comprar dezenas de cotas do HGLG11 de uma só vez.</span>
                </div>
                <div className={`p-4 rounded-xl border ${theme.cardBorder} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <strong className={`block text-amber-500 mb-1`}>Nov/Dez 2028: A Bomba do 13º Salário</strong>
                    <span className={`text-sm ${theme.textSecondary}`}>Os 13º salários integrais (livres de empréstimos) geram uma injeção de mais de R$ 10.000,00 diretos para blindagem patrimonial.</span>
                </div>
             </div>
          </div>

        </div>
      )}

      {/* --- NOVA ABA: A VITÓRIA (FÉRIAS 2028) --- */}
      {activeTab === 'viagem' && (
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          {/* Cabeçalho da Aba */}
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 text-cyan-500 rounded-full mb-4 relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
              <PlaneIcon className="w-8 h-8 relative z-10" />
            </div>
            <h2 className={`text-3xl md:text-4xl font-black ${theme.textPrimary} mb-3`}>Operação: A Grande Recompensa</h2>
            <p className={`${theme.textSecondary} text-sm md:text-base`}>
              2ª Semana de 2028 • 5 Dias • Um destino inesquecível. A celebração oficial de uma família que esmagou as dívidas e construiu a sua própria liberdade.
            </p>
          </div>

          {/* Bloco 1: O Contexto Financeiro de 2028 (Como Pagar) */}
          <div className={`${theme.travelCard} border rounded-2xl p-6 md:p-8 mb-10 shadow-lg`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className={`text-xl font-bold text-cyan-500 mb-3 flex items-center gap-2`}>
                  <ZapIcon className="w-5 h-5" />
                  Como vamos pagar isto sem dores de cabeça?
                </h3>
                <p className={`${theme.textPrimary} mb-4 leading-relaxed`}>
                  Em Janeiro de 2028, a vossa vida financeira será irreconhecível. Não haverá mais Santander. Os vossos salários estarão 100% livres, as vossas cotas de FIIs estarão a gerar dividendos mensais sozinhos e o João Vitor já estará a correr pela casa.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-white'} border ${theme.cardBorder}`}>
                    <p className={`text-xs ${theme.textSecondary} uppercase font-bold tracking-wider mb-1`}>O Fundo da Viagem</p>
                    <p className={`font-bold ${theme.textPrimary}`}>Bónus de Férias do Final de 2027</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-white'} border ${theme.cardBorder}`}>
                    <p className={`text-xs ${theme.textSecondary} uppercase font-bold tracking-wider mb-1`}>A Regra de Ouro</p>
                    <p className={`font-bold ${theme.textPrimary}`}>Não tocamos no Tesouro Selic!</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                 <div className={`p-4 rounded-xl border border-emerald-500/30 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} text-center`}>
                    <p className={`text-xs text-emerald-500 font-bold uppercase mb-1`}>Orçamento Alvo (5 Dias)</p>
                    <h4 className="text-2xl font-black text-emerald-500">~R$ 4.500</h4>
                    <p className={`text-[10px] ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'} mt-1`}>Voos + Hotel + Passeios para o casal e o bebé.</p>
                 </div>
              </div>
            </div>
          </div>

          <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-6 text-center`}>Destinos Sugeridos (Onde o vosso dinheiro vale mais)</h3>

          {/* Bloco 2: Cards de Destinos (Com gradientes CSS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            
            {/* Destino 1: Praias do Nordeste */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-colors duration-300`}>
              <div className="h-40 bg-gradient-to-br from-cyan-600 to-blue-800 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 50% 120%, #ffffff 0%, transparent 60%)'}}></div>
                 <MapPinIcon className="w-12 h-12 text-white/50" />
                 <div className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/30">
                   Nordeste (Águas Quentes)
                 </div>
              </div>
              <div className="p-6">
                <h4 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Maragogi ou Porto de Galinhas</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4 h-16`}>
                  Perfeito para levar o João Vitor. Resorts com infraestrutura para bebés, piscinas naturais calmas e um custo-benefício excelente para 5 dias.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                   <span className="text-xs font-medium text-cyan-500">Perfil: Descanso Total</span>
                   <span className={`text-sm font-bold ${theme.textPrimary}`}>R$ Alto Custo/Benefício</span>
                </div>
              </div>
            </div>

            {/* Destino 2: Sul */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl overflow-hidden shadow-lg group hover:border-emerald-500/50 transition-colors duration-300`}>
              <div className="h-40 bg-gradient-to-br from-emerald-600 to-teal-800 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 50%)'}}></div>
                 <MapPinIcon className="w-12 h-12 text-white/50" />
                 <div className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/30">
                   Sul (Serra Gaúcha)
                 </div>
              </div>
              <div className="p-6">
                <h4 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Gramado e Canela (RS)</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4 h-16`}>
                  Em Janeiro a cidade já está mais calma pós-Natal, mas ainda lindíssima. Clima agradável, parques temáticos tranquilos e gastronomia premium.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                   <span className="text-xs font-medium text-emerald-500">Perfil: Romântico/Familiar</span>
                   <span className={`text-sm font-bold ${theme.textPrimary}`}>R$ Médio-Alto</span>
                </div>
              </div>
            </div>

            {/* Destino 3: Lençóis Maranhenses */}
            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl overflow-hidden shadow-lg group hover:border-amber-500/50 transition-colors duration-300`}>
              <div className="h-40 bg-gradient-to-br from-amber-500 to-orange-700 relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #ffffff 0%, transparent 60%)'}}></div>
                 <MapPinIcon className="w-12 h-12 text-white/50" />
                 <div className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/30">
                   Natureza Exclusiva
                 </div>
              </div>
              <div className="p-6">
                <h4 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Lençóis Maranhenses (MA)</h4>
                <p className={`text-sm ${theme.textSecondary} mb-4 h-16`}>
                  Uma viagem mais exótica. Uma imersão total na natureza que marca a vida de qualquer um. Exige um pouco mais de logística com a criança.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                   <span className="text-xs font-medium text-amber-500">Perfil: Aventura</span>
                   <span className={`text-sm font-bold ${theme.textPrimary}`}>R$ Planeamento Prévio</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bloco 3: O Simulador de Custos de Viagem */}
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 md:p-8 shadow-lg max-w-4xl mx-auto`}>
            <h3 className={`text-lg font-bold ${theme.textPrimary} mb-6 flex items-center gap-2`}>
              <WalletIcon className="h-5 w-5 text-cyan-500" />
              Simulador Base: Orçamento de R$ 4.500 (Para o Casal + Bebé)
            </h3>
            
            <div className="space-y-4">
              <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <PlaneIcon className={`w-5 h-5 ${theme.textSecondary}`} />
                  <div>
                    <p className={`font-bold ${theme.textPrimary}`}>Passagens Aéreas (Ida e Volta)</p>
                    <p className={`text-xs ${theme.textSecondary}`}>Bebés até 2 anos geralmente não pagam assento (viajam ao colo).</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-cyan-500">~R$ 1.800</div>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <BuildingIcon className={`w-5 h-5 ${theme.textSecondary}`} />
                  <div>
                    <p className={`font-bold ${theme.textPrimary}`}>Alojamento (4 Noites / 5 Dias)</p>
                    <p className={`text-xs ${theme.textSecondary}`}>Pousada confortável com pequeno-almoço incluso.</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-cyan-500">~R$ 1.200</div>
              </div>

              <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <HeartIcon className={`w-5 h-5 ${theme.textSecondary}`} />
                  <div>
                    <p className={`font-bold ${theme.textPrimary}`}>Alimentação & Passeios</p>
                    <p className={`text-xs ${theme.textSecondary}`}>Almoços, jantares e ingressos para passeios locais.</p>
                  </div>
                </div>
                <div className="font-bold text-lg text-cyan-500">~R$ 1.500</div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className={`${theme.textSecondary} text-sm`}>
                <strong className="text-emerald-500">Como acumular?</strong> A partir de Julho de 2027 (quando a dívida zera), basta guardarem a sobra extra mensal ou utilizarem uma pequena fração do 13º salário/férias. O vosso império imobiliário não precisará de ser tocado para vocês viverem este sonho!
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
