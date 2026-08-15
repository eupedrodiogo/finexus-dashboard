import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationProps {
    currentView: 'dashboard' | 'monthly' | 'planner' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan';
    onChangeView: (view: 'dashboard' | 'monthly' | 'planner' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan') => void;
    onOpenSettings: () => void;
    onOpenAddTransaction: (type?: string) => void;
    onOpenImport: () => void;
    onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ── Action items config ────────────────────────────────────────────────────────────
// Exportado para o FAB do desktop (App.tsx) usar exatamente as mesmas cores,
// ícones e ordem do menu "Nova Transação" do celular — uma fonte só, sem risco
// de as duas telas divergirem visualmente com o tempo.
export const ACTION_ITEMS = [
    { label: 'Despesa',       type: 'expense',     icon: 'arrow_downward', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.4)', shadow: 'rgba(244,63,94,0.3)' },
    { label: 'Receita',       type: 'income',      icon: 'arrow_upward',   color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', shadow: 'rgba(16,185,129,0.3)' },
    { label: 'Transferir',    type: 'transfer',    icon: 'swap_horiz',     color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.4)', shadow: 'rgba(14,165,233,0.3)' },
    { label: 'Cartão',        type: 'credit_card', icon: 'credit_card',    color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', shadow: 'rgba(168,85,247,0.3)' },
    { label: 'Investir',      type: 'investment',  icon: 'show_chart',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', shadow: 'rgba(139,92,246,0.3)' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    currentView, onChangeView, onOpenSettings, onOpenAddTransaction, onOpenImport, onShowToast,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, login, logout }     = useAuth();

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const navItemsLeft  = [
        { id: 'dashboard', icon: 'dashboard',    label: 'Início',  view: 'dashboard' },
        { id: 'planner',   icon: 'edit_calendar',label: 'Planejar',view: 'planner'   },
        { id: 'accounts',  icon: 'account_balance', label: 'Contas', view: 'accounts' },
    ];
    const navItemsRight = [
        { id: 'cards',   icon: 'credit_card',  label: 'Cartão',    view: 'cards'  },
        { id: 'monthly', icon: 'receipt_long', label: 'Extrato',   view: 'monthly' },
        { id: 'annual',  icon: 'bar_chart',    label: 'Relatório', view: 'annual'  },
    ];

    // Deslizar de baixo pra cima em qualquer ponto da barra abre a mesma folha
    // do botão "Menu" antigo (agora removido — vira gesto em vez de ícone).
    const touchStartY = useRef<number | null>(null);
    const handleBarTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };
    const handleBarTouchEnd = (e: React.TouchEvent) => {
        if (touchStartY.current === null) return;
        const deltaY = touchStartY.current - e.changedTouches[0].clientY;
        if (deltaY > 40) setIsMenuOpen(true);
        touchStartY.current = null;
    };

    const navigate = (view: typeof currentView) => { onChangeView(view); setIsMenuOpen(false); };

    // Unified labels and icons for all modules
    const mainModules = [
        { id: 'dashboard',  icon: 'dashboard',     label: 'Início',      view: 'dashboard'  as const },
        { id: 'monthly',    icon: 'receipt_long',  label: 'Extrato',     view: 'monthly'    as const },
        { id: 'planner',    icon: 'edit_calendar', label: 'Planejar',    view: 'planner'    as const },
        { id: 'accounts',   icon: 'account_balance', label: 'Contas',     view: 'accounts'  as const },
        { id: 'cards',      icon: 'credit_card',   label: 'Cartões',     view: 'cards'      as const },
    ];

    const extraModules = [
        { id: 'masterplan', icon: 'ads_click',     label: 'Master Plan', view: 'masterplan' as const },
        { id: 'advisor',   icon: 'psychology',      label: 'IA Advisor', view: 'advisor'   as const },
        { id: 'simulator', icon: 'trending_up',     label: 'Simulador',  view: 'simulator' as const },
        { id: 'annual',    icon: 'bar_chart',       label: 'Relatório',  view: 'annual'    as const },
    ];

    const handleLogin = async () => {
        try { await login(); setIsMenuOpen(false); if (onShowToast) onShowToast('Login realizado!', 'success'); }
        catch { if (onShowToast) onShowToast('Erro ao fazer login.', 'error'); }
    };
    const handleLogout = async () => {
        try { await logout(); setIsMenuOpen(false); } catch {}
    };

    return (
        <>
            {/* ══════════════════════════════════════════════════════════════
                BOTTOM BAR (pill flutuante)
            ══════════════════════════════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden pb-safe transition-all duration-400 z-50">
                <div
                    onTouchStart={handleBarTouchStart}
                    onTouchEnd={handleBarTouchEnd}
                    className="relative mx-2 mb-3 h-[62px] flex items-center px-1 rounded-[28px] transition-all duration-400 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06)] border border-slate-200/50 dark:border-transparent"
                >
                    {/* Metade esquerda e direita em containers flex-1 iguais (3 ícones cada) —
                        garante que o vão reservado pro "+" fique exatamente no centro da barra. */}
                    <div className="flex-1 flex items-center justify-around h-full">
                        {navItemsLeft.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChangeView(item.view as any)}
                                className="relative flex flex-col items-center justify-center gap-1 w-12 h-full transition-all active:scale-90"
                            >
                                {currentView === item.view && (
                                    <span className="absolute inset-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15" />
                                )}
                                <span className={`material-symbols-rounded text-[22px] transition-all duration-300 ${currentView === item.view ? 'icon-filled text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-bold tracking-wide ${currentView === item.view ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Vão reservado — o "+" flutua centralizado sobre este espaço, não faz
                        parte do fluxo flex dos ícones de navegação. */}
                    <div className="w-11 h-full shrink-0" />

                    <div className="flex-1 flex items-center justify-around h-full">
                        {navItemsRight.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChangeView(item.view as any)}
                                className="relative flex flex-col items-center justify-center gap-1 w-12 h-full transition-all active:scale-90"
                            >
                                {currentView === item.view && (
                                    <span className="absolute inset-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15" />
                                )}
                                <span className={`material-symbols-rounded text-[22px] transition-all duration-300 ${currentView === item.view ? 'icon-filled text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-bold tracking-wide ${currentView === item.view ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* FAB central — atalho direto pro lançamento mais comum (Despesa).
                        Fica fora do fluxo (absolute), flutuando acima do vão reservado, sempre
                        no centro exato da barra, não importa quantos ícones tenham de cada lado.
                        Quem quiser outro tipo troca dentro do próprio modal, nas abas
                        que já ficam em evidência logo abaixo do cabeçalho. */}
                    <button
                        onClick={() => onOpenAddTransaction('expense')}
                        className="absolute left-1/2 -translate-x-1/2 -top-[22px] flex items-center justify-center active:scale-90 transition-transform"
                    >
                        {/* Anel de glow */}
                        <span
                            className="absolute w-14 h-14 rounded-2xl animate-ping transition-opacity duration-300 opacity-[0.18]"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                        />
                        <span
                            className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-400 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-[0_8px_24px_rgba(99,102,241,0.55)] border-4 border-white dark:border-slate-900"
                        >
                            <span className="material-symbols-rounded text-[28px] text-white">
                                add
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                UNIFIED ACTION & NAVIGATION BOTTOM SHEET
            ══════════════════════════════════════════════════════════════ */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden animate-slideUp bg-white dark:bg-slate-900 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.06),0_-20px_60px_rgba(0,0,0,0.6)] transition-colors duration-300 flex flex-col"
                        style={{
                            maxHeight: '92vh',
                        }}
                    >
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/60 to-transparent flex-shrink-0" />
                        
                        {/* Header and Scrollable Content */}
                        <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
                            <div className="px-5 pt-4">
                                <div className="w-10 h-1 rounded-full mx-auto mb-6 bg-slate-200 dark:bg-slate-700/50" />

                                {/* User & Settings (Top Section) */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <span className="material-symbols-rounded text-white text-[28px]">person</span>
                                        </div>
                                        <div>
                                            <h2 className="text-slate-900 dark:text-white font-black text-lg tracking-tight leading-none">Minha Conta</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold tracking-widest uppercase mt-1.5">Ajustes e Perfil</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 active:scale-90 transition-transform"
                                    >
                                        <span className="material-symbols-rounded text-slate-600 dark:text-slate-400 text-[20px]">settings</span>
                                    </button>
                                </div>

                                {/* Extra Tools / Development */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-rounded text-indigo-500 dark:text-indigo-400 text-[16px]">extension</span>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Ferramentas Extras</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {extraModules.map((mod) => (
                                            <button 
                                                key={mod.id} 
                                                onClick={() => navigate(mod.view)}
                                                className={`flex items-center gap-3 p-3 rounded-[20px] active:scale-95 transition-all border ${
                                                    currentView === mod.view
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 shadow-sm'
                                                    : 'bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                    currentView === mod.view
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-white/5'
                                                }`}>
                                                    <span className={`material-symbols-rounded text-[18px] ${currentView === mod.view ? 'icon-filled' : ''}`}>{mod.icon}</span>
                                                </div>
                                                <span className={`text-[11px] font-bold ${currentView === mod.view ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {mod.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Logout / Login (Subtle) */}
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    {user ? (
                                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-500 dark:text-rose-400 active:opacity-60 transition-opacity">
                                            <span className="material-symbols-rounded text-[18px]">logout</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider">Sair da Conta</span>
                                        </button>
                                    ) : (
                                        <button onClick={handleLogin} className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 active:opacity-60 transition-opacity">
                                            <span className="material-symbols-rounded text-[18px]">login</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider">Entrar com Google</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── LOWER SECTION: PRIMARY NAV & ACTIONS ──────────────────────── */}
                        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 px-5 pt-8 pb-10 shadow-[0_-12px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.3)]">
                            
                            {/* Section 1: Main Navigation (Reachable) */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="material-symbols-rounded text-slate-400 dark:text-slate-500 text-[16px]">explore</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Menu Principal</p>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {mainModules.map((mod) => (
                                        <button 
                                            key={mod.id} 
                                            onClick={() => navigate(mod.view)} 
                                            className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    currentView === mod.view 
                                                    ? 'bg-indigo-600 shadow-[0_8px_16px_rgba(79,70,229,0.4)] text-white' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                                                }`}
                                            >
                                                <span className={`material-symbols-rounded text-[22px] ${currentView === mod.view ? 'icon-filled' : ''}`}>{mod.icon}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold text-center leading-tight ${
                                                currentView === mod.view 
                                                ? 'text-indigo-600 dark:text-indigo-400' 
                                                : 'text-slate-500 dark:text-slate-400'
                                            }`}>{mod.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Quick Actions (Most Reachable) */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="material-symbols-rounded text-indigo-500 dark:text-indigo-400 text-[16px]">add_circle</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80 dark:text-indigo-400/80">Nova Transação</p>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {ACTION_ITEMS.map((item) => (
                                        <button
                                            key={item.type}
                                            onClick={() => { onOpenAddTransaction(item.type); setIsMenuOpen(false); }}
                                            className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
                                        >
                                            <div 
                                                className="w-14 h-14 rounded-[22px] flex items-center justify-center shadow-lg transition-all border-2 relative overflow-hidden"
                                                style={{ 
                                                    backgroundColor: item.bg,
                                                    borderColor: item.border,
                                                    color: item.color,
                                                    boxShadow: `0 8px 24px -6px ${item.shadow}`
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
                                                <span className="material-symbols-rounded text-[28px] icon-filled relative z-10">
                                                    {item.icon}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 tracking-tight">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Importar Extrato + Fechar — mesma linha, aproveitando o espaço que sobrava dos dois lados do "X" */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => { onOpenImport(); setIsMenuOpen(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-symbols-rounded text-[18px]">upload_file</span>
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Importar Extrato</span>
                                </button>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="shrink-0 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl active:scale-90 transition-all hover:rotate-90"
                                >
                                    <span className="material-symbols-rounded text-[24px]">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
