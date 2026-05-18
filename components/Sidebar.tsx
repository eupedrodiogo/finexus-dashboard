import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutGrid,
  Compass,
  Receipt,
  Milestone,
  BarChart3,
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  CloudUpload,
  User as UserIcon,
  X,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: any) => void;
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
  icon: any;
  label: string;
  isOpen: boolean;
}> = ({ active, onClick, icon: Icon, label, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3.5 mb-2 rounded-xl transition-all duration-300 group relative
      ${active
        ? 'bg-indigo-600/15 text-indigo-500 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
  >
    <div className={`flex items-center justify-center transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {Icon ? <Icon size={20} strokeWidth={active ? 2.5 : 2} /> : <div className="w-5 h-5 bg-slate-200 rounded" />}
    </div>
    <span className={`ml-4 font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
      {label}
    </span>
    {active && (
      <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isOpen, 
  toggleSidebar, 
  isDarkMode, 
  toggleTheme, 
  onOpenSettings, 
  userName 
}) => {
  const auth = useAuth();
  const user = auth?.user;
  const login = auth?.login;
  const logout = auth?.logout;
  const [isHovered, setIsHovered] = useState(false);

  const sidebarContent = (
    <aside
      id="sidebar-nav"
      onMouseEnter={() => !isOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-full flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl relative z-10 
        ${isOpen 
          ? 'w-full sm:max-w-sm' 
          : 'hidden lg:flex lg:w-20 lg:hover:w-64'
        }`}
    >
      <div className="flex flex-col h-full relative">
        {/* Topo da Sidebar - Aproximado dos ícones conforme solicitado */}
        <div className={`pt-8 pb-2 px-2 flex items-center justify-between ${!isOpen && !isHovered ? 'lg:justify-center' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {(!isOpen && !isHovered) && (
              <div className="relative group animate-fadeIn">
                {/* Aura de Brilho atrás do texto */}
                <div className="absolute -inset-2 bg-indigo-500/10 blur-xl rounded-full animate-pulse"></div>
                
                <div className="relative flex items-center gap-1.5">
                  {/* Ponto de Atenção Pulsante */}
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-ping absolute -left-3"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute -left-3"></div>
                  
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 drop-shadow-sm">
                    Menu
                  </span>
                </div>
              </div>
            )}
          </div>
          {isOpen && (
            <button 
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3">
          {/* User Profile - Premium Identity */}
          {(isOpen || isHovered) && (
            <div className="px-3 mb-8 animate-fadeIn">
              <div className="p-4 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden group/profile">
                {/* Background Decor */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/5 blur-2xl rounded-full group-hover/profile:bg-indigo-500/10 transition-colors" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {user?.displayName?.charAt(0) || userName?.charAt(0) || 'U'}
                      </div>
                    )}
                    {user && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">
                      {user?.displayName || userName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user ? (
                        <>
                          <ShieldCheck size={10} className="text-indigo-500" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Conta Verificada</span>
                        </>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Modo Visitante</span>
                      )}
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center justify-between px-1">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                        ))}
                     </div>
                     <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Família Ativa</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mb-4">
            {(isOpen || isHovered) && <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-4 animate-fadeIn">Menu</p>}
            <nav className="space-y-1">
              <NavItem active={currentView === 'dashboard'} onClick={() => { onChangeView('dashboard'); isOpen && toggleSidebar(); }} icon={LayoutGrid} label="Dashboard" isOpen={isOpen || isHovered} />
              <NavItem active={currentView === 'planner'} onClick={() => { onChangeView('planner'); isOpen && toggleSidebar(); }} icon={Compass} label="Estratégia" isOpen={isOpen || isHovered} />
              <NavItem active={currentView === 'monthly'} onClick={() => { onChangeView('monthly'); isOpen && toggleSidebar(); }} icon={Receipt} label="Lançamentos" isOpen={isOpen || isHovered} />
              {user?.email === 'pedrodiogo.mello@gmail.com' && (
                <NavItem active={currentView === 'masterplan'} onClick={() => { onChangeView('masterplan'); isOpen && toggleSidebar(); }} icon={Milestone} label="Master Plan" isOpen={isOpen || isHovered} />
              )}
              <NavItem active={currentView === 'cards'} onClick={() => { onChangeView('cards'); isOpen && toggleSidebar(); }} icon={CreditCard} label="Cartões" isOpen={isOpen || isHovered} />
            </nav>
          </div>

          {/* Laboratório / Beta */}
          <div className="mt-8 mb-4">
            {(isOpen || isHovered) && (
              <div className="flex items-center gap-2 mb-4 ml-4 animate-fadeIn">
                <ShieldCheck size={12} className="text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/80">Laboratório</p>
              </div>
            )}
            <nav className="space-y-1">
              <NavItem active={currentView === 'advisor'} onClick={() => { onChangeView('advisor'); isOpen && toggleSidebar(); }} icon={Zap} label="IA Advisor" isOpen={isOpen || isHovered} />
              <NavItem active={currentView === 'simulator'} onClick={() => { onChangeView('simulator'); isOpen && toggleSidebar(); }} icon={TrendingUp} label="Simulador" isOpen={isOpen || isHovered} />
              <NavItem active={currentView === 'annual'} onClick={() => { onChangeView('annual'); isOpen && toggleSidebar(); }} icon={BarChart3} label="Relatório Anual" isOpen={isOpen || isHovered} />
              <NavItem active={currentView === 'accounts'} onClick={() => { onChangeView('accounts'); isOpen && toggleSidebar(); }} icon={Wallet} label="Contas" isOpen={isOpen || isHovered} />
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 ${!isOpen && !isHovered ? 'lg:flex lg:flex-col lg:items-center' : ''}`}>
           {(isOpen || isHovered) ? (
             <>
               <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={toggleTheme} className="flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={() => { onOpenSettings?.(); isOpen && toggleSidebar(); }} className="flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                  <Settings size={18} />
                </button>
              </div>
              <button 
                onClick={() => { user ? logout?.() : login?.(); isOpen && toggleSidebar(); }} 
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${user ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}
              >
                {user ? <LogOut size={16} /> : <CloudUpload size={16} />}
                <span>{user ? 'Sair' : 'Login'}</span>
              </button>
             </>
           ) : (
             <button onClick={toggleSidebar} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500">
               <Settings size={20} />
             </button>
           )}
        </div>
      </div>
    </aside>
  );

  // Renderização Responsiva
  return (
    <>
      {/* Desktop Sidebar (Estática no layout) */}
      <div className="hidden lg:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Modal (Portal para cobrir tudo) */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex justify-center items-center p-4 sm:p-6 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-[64px] z-[100]" onClick={toggleSidebar} />
          <div className="relative z-[101] w-full max-w-sm h-full animate-scaleIn">
            {sidebarContent}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

