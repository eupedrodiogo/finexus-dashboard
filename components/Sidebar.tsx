
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: 'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan';
  onChangeView: (view: 'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan') => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenSettings?: () => void;
  userName: string;
}

const NavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  isOpen: boolean;
}> = ({ active, onClick, icon, label, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isOpen ? 'p-4' : 'justify-center p-4'} mb-3 rounded-2xl transition-all duration-300 group relative overflow-hidden
      ${active
        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20'
        : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
  >
    {active && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
    <span className={`material-symbols-rounded notranslate text-2xl transition-all duration-500 relative z-10 ${active ? 'scale-110 icon-filled' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className={`ml-4 font-black text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 relative z-10 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
      {label}
    </span>
    {!isOpen && active && (
      <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none transition-all animate-fadeIn">
        {label}
      </div>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, toggleSidebar, isDarkMode, toggleTheme, onOpenSettings, userName }) => {
  const { user, login, logout } = useAuth();

  return (
    <>
      <div className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar} />
      <aside
        id="sidebar-nav"
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-screen glass-panel border-r border-white/20 dark:border-white/5 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen ? 'w-72 translate-x-0' : 'w-[96px] -translate-x-full lg:translate-x-0'}`}>

        <div className="h-28 flex items-center px-7">
          <div className="flex items-center gap-4 overflow-hidden">
            <img src="/pwa-192x192.png" alt="Logo" className="w-12 h-12 rounded-[1.25rem] shadow-xl flex-shrink-0 group cursor-pointer hover:rotate-3 transition-transform" />
            <div className={`transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
              <h1 className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white">Prospera Nexus</h1>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-5 py-6 overflow-y-auto no-scrollbar">
          <div className={`mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Principal</div>
          <NavItem active={currentView === 'dashboard'} onClick={() => { onChangeView('dashboard'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="grid_view" label="Dashboard" isOpen={isOpen} />
          <NavItem active={currentView === 'masterplan'} onClick={() => { onChangeView('masterplan'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="crisis_alert" label="Master Plan" isOpen={isOpen} />
          <NavItem active={currentView === 'monthly'} onClick={() => { onChangeView('monthly'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="list_alt" label="Lançamentos" isOpen={isOpen} />
          {/* <NavItem active={currentView === 'cards'} onClick={() => { onChangeView('cards'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="credit_card" label="Meus Cartões" isOpen={isOpen} /> */}
          {/* <NavItem active={currentView === 'accounts'} onClick={() => { onChangeView('accounts'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="account_balance_wallet" label="Minhas Contas" isOpen={isOpen} /> */}
          <NavItem active={currentView === 'annual'} onClick={() => { onChangeView('annual'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="insights" label="Análise Anual" isOpen={isOpen} />

          {/*
          <div className={`mt-10 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Inteligência</div>
          <NavItem active={currentView === 'advisor'} onClick={() => { onChangeView('advisor'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="psychology" label="Smart Advisor" isOpen={isOpen} />
          <NavItem active={currentView === 'simulator'} onClick={() => { onChangeView('simulator'); if (window.innerWidth < 1024) toggleSidebar(); }} icon="query_stats" label="Simulador" isOpen={isOpen} />
*/ }
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/10 dark:bg-slate-900/10">
          <button 
            onClick={toggleTheme} 
            className={`w-full flex items-center ${isOpen ? 'p-4' : 'justify-center p-4'} rounded-2xl transition-all duration-300 group
              bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700`}
            title="Alternar Tema"
          >
            <span className="material-symbols-rounded notranslate text-2xl group-hover:rotate-180 transition-transform duration-500">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span className={`ml-4 font-black text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </span>
          </button>

          <button 
            onClick={onOpenSettings} 
            className={`w-full flex items-center ${isOpen ? 'p-4' : 'justify-center p-4'} rounded-2xl transition-all duration-300 group
              bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700`}
            title="Configurações"
          >
            <span className="material-symbols-rounded notranslate text-2xl group-hover:rotate-90 transition-transform duration-500">
              settings
            </span>
            <span className={`ml-4 font-black text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              Configurações
            </span>
          </button>

          {user ? (
            <div className="space-y-2">
              <button className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`} alt="User" className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-lg" />
                <div className={`text-left transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{user.displayName || userName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nuvem Ativada</p>
                </div>
              </button>
              <button onClick={logout} className={`flex items-center gap-3 w-full p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all ${isOpen ? 'px-4' : 'justify-center'}`}>
                <span className="material-symbols-rounded notranslate text-xl">logout</span>
                {isOpen && <span className="text-xs font-bold uppercase tracking-wider">Sair</span>}
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  await login();
                } catch (error: any) {
                  console.error("Login UI Error:", error);
                  alert(`Erro ao iniciar login: ${error.message || 'Erro desconhecido'}\nVerifique se o Popup não foi bloqueado e se a Autenticação Google está ativada no Firebase Console.`);
                }
              }}
              className="flex items-center gap-4 w-full p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all group shadow-lg shadow-indigo-500/20"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-rounded notranslate">cloud_upload</span>
              </div>
              <div className={`text-left transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                <p className="text-sm font-black truncate">Entrar / Backup</p>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-tighter">Sincronizar Nuvem</p>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
