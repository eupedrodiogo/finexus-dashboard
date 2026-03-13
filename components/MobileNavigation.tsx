import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationProps {
    currentView: 'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan';
    onChangeView: (view: 'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan') => void;
    onOpenSettings: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentView, onChangeView, onOpenSettings }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, login, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Início', view: 'dashboard' },
        { id: 'masterplan', icon: 'crisis_alert', label: 'Master Plan', view: 'masterplan' },
        { id: 'monthly', icon: 'calendar_month', label: 'Extrato', view: 'monthly' },
    ];

    const handleLogin = async () => {
        try {
            await login();
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Login Error:", error);
            alert("Erro ao fazer login. Tente novamente.");
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <>
            {/* Main Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 z-50 md:hidden pb-safe">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.view as any)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${currentView === item.view ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        {currentView === item.view && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                        )}
                        <span className={`material-symbols-rounded text-2xl mb-0.5 transition-transform ${currentView === item.view ? 'scale-110 icon-filled' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                    </button>
                ))}

                {/* More Menu Buitton */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300`}
                >
                    <span className="material-symbols-rounded text-2xl mb-0.5">menu</span>
                    <span className="text-[10px] font-bold tracking-tight">Menu</span>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-24 border-t border-white/10 shadow-2xl animate-slideUp">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                        <div className="grid grid-cols-4 gap-4">
                            <MenuOption
                                icon="settings"
                                label="Configurar"
                                onClick={() => {
                                    onOpenSettings();
                                    setIsMenuOpen(false);
                                }}
                            />
                            {/* Add more options here if needed, like Annual View, etc */}
                            <MenuOption
                                icon="calendar_today"
                                label="Anual"
                                onClick={() => {
                                    onChangeView('annual');
                                    setIsMenuOpen(false);
                                }}
                            />
                            <MenuOption
                                icon="smart_toy"
                                label="Advisor"
                                onClick={() => {
                                    onChangeView('advisor');
                                    setIsMenuOpen(false);
                                }}
                            />

                            {/* Login/Logout Option */}
                            {user ? (
                                <MenuOption
                                    icon="logout"
                                    label="Sair"
                                    onClick={handleLogout}
                                />
                            ) : (
                                <MenuOption
                                    icon="login"
                                    label="Entrar"
                                    onClick={handleLogin}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const MenuOption: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 active:scale-95 transition-all">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl">{icon}</span>
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">{label}</span>
    </button>
);
