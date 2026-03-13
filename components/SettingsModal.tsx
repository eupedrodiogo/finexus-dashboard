
import React, { useRef } from 'react';
import { Modal } from './Modal';
import { FinancialData, CreditCard } from '../types';
import { generateCSV } from '../utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    allData: { [key: string]: FinancialData };
    userName: string;
    onUpdateUserName: (name: string) => void;
    onImport: (data: { [key: string]: FinancialData }) => void;
    onReset: () => void;
    onForceSync: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, allData, userName, onUpdateUserName, onImport, onReset, onForceSync }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `prospera_nexus_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                if (event.target?.result) {
                    try {
                        const parsedData = JSON.parse(event.target.result as string);
                        onImport(parsedData);
                        onClose();
                    } catch (e) {
                        alert("Erro ao ler arquivo JSON. Verifique o formato.");
                    }
                }
            };
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">Configurações</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personalização e Dados.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
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
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold text-slate-700 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Nome da Família"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800/50" />

                    <hr className="border-slate-100 dark:border-slate-800/50" />

                    {/* Sync Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nuvem & Backup</label>
                        <button onClick={onForceSync} className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <span className="material-symbols-rounded notranslate">cloud_sync</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Forçar Sincronização</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Baixar dados mais recentes</p>
                                </div>
                            </div>
                            <span className="material-symbols-rounded notranslate text-slate-400 group-hover:rotate-180 transition-transform duration-700">sync</span>
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
                            link.setAttribute("download", `prospera_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
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
                                accept="application/json"
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
