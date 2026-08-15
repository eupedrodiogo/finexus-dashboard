
import React, { useRef } from 'react';
import { Modal } from './Modal';
import { FinancialData, CreditCard, Goal } from '../types';
import { generateCSV } from '../utils';
import { ALL_BAR_ITEMS } from './MobileNavigation';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allData: { [key: string]: FinancialData };
    goals: Goal[];
    userName: string;
    onUpdateUserName: (name: string) => void;
    onImport: (data: any) => boolean;
    onReset: () => void;
    onForceSync: () => void;
    onPushSync: () => void;
    /** Ids de ALL_BAR_ITEMS visíveis na barra inferior (mobile), na ordem exibida. */
    barOrder: string[];
    onChangeBarOrder: (order: string[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, allData, goals, userName, onUpdateUserName, onImport, onReset, onForceSync, onPushSync, barOrder, onChangeBarOrder }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const visibleBarItems = barOrder
        .map(id => ALL_BAR_ITEMS.find(item => item.id === id))
        .filter((item): item is typeof ALL_BAR_ITEMS[number] => !!item);
    const hiddenBarItems = ALL_BAR_ITEMS.filter(item => !barOrder.includes(item.id));

    const moveBarItem = (id: string, direction: -1 | 1) => {
        const idx = barOrder.indexOf(id);
        const swapWith = idx + direction;
        if (idx === -1 || swapWith < 0 || swapWith >= barOrder.length) return;
        const next = [...barOrder];
        [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
        onChangeBarOrder(next);
    };
    const hideBarItem = (id: string) => onChangeBarOrder(barOrder.filter(i => i !== id));
    const showBarItem = (id: string) => onChangeBarOrder([...barOrder, id]);

    const handleExport = () => {
        const backupData = {
            allData,
            goals,
            userName,
            version: "2.0",
            timestamp: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `finexus_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    if (!event.target?.result) throw new Error("Não foi possível ler o arquivo.");
                    const parsedData = JSON.parse(event.target.result as string);
                    const success = onImport(parsedData);
                    if (success) {
                        onClose();
                    }
                } catch (error) {
                    console.error("[SettingsModal] Erro ao ler/parsear arquivo:", error);
                    alert("Erro ao processar o arquivo. Verifique se é um JSON válido.");
                }
            };
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border-t border-white/10 sm:border-none pointer-events-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Configurações</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personalização e Dados.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <span className="material-symbols-rounded notranslate text-slate-400">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil da Família</label>
                        <div className="flex items-center gap-3">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`} alt="Avatar" className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => onUpdateUserName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 px-3 py-3 text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Nome da Família"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800/50" />

                    {/* Personalizar Menu — quais atalhos aparecem na barra inferior (mobile)
                        e em que ordem. O "+" central não entra aqui, é fixo. */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Personalizar Menu (Barra Inferior)</label>

                        <div className="space-y-2">
                            {visibleBarItems.map((item, idx) => (
                                <div key={item.id} className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                                        <span className="material-symbols-rounded notranslate text-[18px]">{item.icon}</span>
                                    </div>
                                    <p className="flex-1 font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</p>
                                    <button
                                        onClick={() => moveBarItem(item.id, -1)}
                                        disabled={idx === 0}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-symbols-rounded notranslate text-[18px]">arrow_upward</span>
                                    </button>
                                    <button
                                        onClick={() => moveBarItem(item.id, 1)}
                                        disabled={idx === visibleBarItems.length - 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <span className="material-symbols-rounded notranslate text-[18px]">arrow_downward</span>
                                    </button>
                                    <button
                                        onClick={() => hideBarItem(item.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                        title="Ocultar da barra"
                                    >
                                        <span className="material-symbols-rounded notranslate text-[18px]">visibility_off</span>
                                    </button>
                                </div>
                            ))}
                            {visibleBarItems.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-3">Nenhum atalho visível. Adicione algum abaixo.</p>
                            )}
                        </div>

                        {hiddenBarItems.length > 0 && (
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ocultos — toque pra adicionar</p>
                                <div className="flex flex-wrap gap-2">
                                    {hiddenBarItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => showBarItem(item.id)}
                                            className="flex items-center gap-2 pl-2 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-full border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
                                        >
                                            <span className="material-symbols-rounded notranslate text-[16px]">add_circle</span>
                                            <span className="material-symbols-rounded notranslate text-[16px]">{item.icon}</span>
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800/50" />

                    {/* Sync Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nuvem & Backup</label>
                        <button onClick={onForceSync} className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <span className="material-symbols-rounded notranslate">cloud_download</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Baixar da Nuvem</p>
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-bold">Substituir local pelo servidor</p>
                                </div>
                            </div>
                            <span className="material-symbols-rounded notranslate text-slate-400 group-hover:rotate-180 transition-transform duration-700">sync</span>
                        </button>

                        <button onClick={onPushSync} className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                    <span className="material-symbols-rounded notranslate">cloud_upload</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Salvar na Nuvem</p>
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-bold">Enviar dados para conta Google</p>
                                </div>
                            </div>
                            <span className="material-symbols-rounded notranslate text-slate-400 group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                        </button>
                    </div>

                    {/* Data Management Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Backup Local (Arquivo)</label>
                        <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                    <span className="material-symbols-rounded notranslate">download</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Exportar Arquivo</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Salvar JSON local</p>
                                </div>
                            </div>
                            <span className="material-symbols-rounded notranslate text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>

                        <button onClick={() => {
                            const csvContent = generateCSV(allData);
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute("download", `finexus_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }} className="w-full flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors group border border-teal-100 dark:border-teal-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-300">
                                    <span className="material-symbols-rounded notranslate">table_view</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Exportar Relatório (.csv)</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Para Excel/Google Sheets</p>
                                </div>
                            </div>
                            <span className="material-symbols-rounded notranslate text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>

                        <div className="relative">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors group border border-emerald-100 dark:border-emerald-800/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                                        <span className="material-symbols-rounded notranslate">upload</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-700 dark:text-slate-200">Importar Arquivo</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Restaurar de JSON</p>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded notranslate text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                        <button onClick={() => { if (window.confirm('Tem certeza? Isso apagará todos os dados e resetará o aplicativo para o estado inicial.')) { onReset(); onClose(); } }} className="w-full flex items-center justify-center gap-2 p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest">
                            <span className="material-symbols-rounded notranslate text-lg">delete_forever</span>
                            Resetar Aplicativo
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
