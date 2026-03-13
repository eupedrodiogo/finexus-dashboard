import React, { useState } from 'react';
import { processImageWithGemini, processExcelFile } from '../services/fileProcessingService';
import { FinancialData } from '../types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Partial<FinancialData>) => void;
    initialFile?: File | null;
    accounts?: Account[];
}

import { FinancialData, Account } from '../types';

export const ImportModal: React.FC<ImportModalProps> = (props) => {
    const { isOpen, onClose, onImport, initialFile, accounts } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    // Default to first account if available when modal opens or accounts change
    React.useEffect(() => {
        if (props.accounts && props.accounts.length > 0 && !selectedAccountId) {
            const defaultAcc = props.accounts.find(a => a.type === 'checking') || props.accounts[0];
            setSelectedAccountId(defaultAcc.id);
        }
    }, [props.accounts]);

    const processFile = async (file: File) => {
        setLoading(true);
        setError(null);
        setFileName(file.name);
        setPreviewData(null);

        try {
            let data;
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                // AI Processing for Images/PDFs
                data = await processImageWithGemini(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                // Excel Processing
                data = await processExcelFile(file);
                // Note: Excel processing currently returns empty object in service, needs logic
                if (Object.keys(data).length === 0) {
                    setError("Processamento de Excel simplificado ainda não mapeou dados automaticamente. (WIP)");
                }
            } else {
                throw new Error("Formato de arquivo não suportado.");
            }

            setPreviewData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao processar arquivo");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (initialFile) {
            processFile(initialFile);
        }
    }, [initialFile]);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handleConfirm = () => {
        if (previewData) {
            // Here we would transform legacy/generic AI structure to FinancialData
            // For now, passing raw or mocking logic
            // TODO: Map 'receitas' and 'deducoes' from AI to FinancialData structure

            // Mock transformation for demonstration based on prompt structure
            // We need to map this to the specific structure expected by App.tsx/utils.ts

            console.log("Importing Data:", previewData);

            // Inject accountId into items
            const enhancedData = { ...previewData };

            if (selectedAccountId) {
                if (enhancedData.receitas) {
                    enhancedData.receitas = enhancedData.receitas.map((i: any) => ({ ...i, accountId: selectedAccountId }));
                }
                if (enhancedData.deducoes) {
                    enhancedData.deducoes = enhancedData.deducoes.map((i: any) => ({ ...i, accountId: selectedAccountId }));
                }
            }

            onImport(enhancedData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <span className="material-symbols-rounded text-indigo-400">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Importação Inteligente</h2>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">GEMINI AI POWERED</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                    {/* File Input */}
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center transition-all hover:border-indigo-500/50 hover:bg-slate-800/30 group cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                {loading ? (
                                    <span className="material-symbols-rounded animate-spin text-indigo-400 text-3xl">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-rounded text-indigo-400 text-3xl">upload_file</span>
                                )}
                            </div>
                            <p className="text-slate-300 font-medium">
                                {loading ? 'Processando com IA...' : 'Arraste ou clique para carregar'}
                            </p>
                            <p className="text-xs text-slate-500">
                                PDF, Imagem (Contracheque) ou Excel
                            </p>
                        </div>
                    </div>

                    {/* Feedback Area */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                            <span className="material-symbols-rounded">error</span>
                            {error}
                        </div>
                    )}

                    {fileName && !loading && !error && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                            <span className="material-symbols-rounded">check_circle</span>
                            Arquivo processado: <span className="font-bold">{fileName}</span>
                        </div>
                    )}

                    {/* Preview Data (JSON Dump for now) */}
                    {/* Preview Data Structured UI */}
                    {previewData && (
                        <div className="space-y-6 animate-slideUp">

                            {/* Receitas Section */}
                            {previewData.receitas && previewData.receitas.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Receitas Identificadas
                                    </h3>
                                    <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                                        {previewData.receitas.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                        <span className="material-symbols-rounded text-lg">arrow_upward</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200 break-words">{item.descricao}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                {item.pessoa || 'Geral'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-emerald-400">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Deducoes Section */}
                            {previewData.deducoes && previewData.deducoes.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Deduções / Despesas
                                    </h3>
                                    <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                                        {previewData.deducoes.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                                        <span className="material-symbols-rounded text-lg">arrow_downward</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200 break-words">{item.descricao}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                {item.pessoa || 'Geral'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-red-400">
                                                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 py-2">
                                <span className="material-symbols-rounded text-slate-500 text-sm">info</span>
                                <p className="text-xs text-slate-500 italic">
                                    Verifique os dados acima antes de confirmar a importação.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Account Selection (Footer Pre-area) */}
                {accounts && accounts.length > 0 && previewData && (
                    <div className="px-6 py-4 bg-slate-800/20 border-t border-slate-700/50">
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Vincular a Conta (Opcional)</label>
                        <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="">Sem vínculo de conta</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.owner === 'joint' ? 'Conjunta' : acc.owner})</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">Ao selecionar uma conta, todos os lançamentos importados afetarão o saldo dela.</p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!previewData || loading}
                        className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold flex items-center gap-2"
                    >
                        <span className="material-symbols-rounded text-lg">save_alt</span>
                        Importar Dados
                    </button>
                </div>

            </div>
        </div>
    );
};
