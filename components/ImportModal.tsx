import React, { useState } from 'react';
import { processImageWithGemini, processExcelFile } from '../services/fileProcessingService';
import { FinancialData, Account } from '../types';
import { getOwnerLabel } from '../utils';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Partial<FinancialData>) => void;
    onFullRestore?: (data: { allData: any; goals?: any[] }) => void;
    initialFile?: File | null;
    accounts?: Account[];
}

export const ImportModal: React.FC<ImportModalProps> = (props) => {
    const { isOpen, onClose, onImport, onFullRestore, initialFile, accounts } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any | null>(null);
    const [isFullBackup, setIsFullBackup] = useState(false);
    const [backupSummary, setBackupSummary] = useState<{ months: number; goals: number } | null>(null);
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
        setIsFullBackup(false);
        setBackupSummary(null);

        try {
            let data;
            if (file.name.endsWith('.json') || file.type === 'application/json') {
                // --- RESTAURAÇÃO DE BACKUP FINEXUS ---
                const text = await file.text();
                const parsed = JSON.parse(text);

                if (parsed && parsed.allData && typeof parsed.allData === 'object') {
                    // É um backup completo
                    const months = Object.keys(parsed.allData).length;
                    const goals = Array.isArray(parsed.goals) ? parsed.goals.length : 0;
                    setIsFullBackup(true);
                    setBackupSummary({ months, goals });
                    setPreviewData(parsed);
                } else {
                    throw new Error('JSON inválido: não é um backup Finexus reconhecido (falta a chave "allData").');
                }
            } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                // AI Processing for Images/PDFs
                data = await processImageWithGemini(file);
                setPreviewData(data);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                // Excel Processing
                data = await processExcelFile(file);
                if (Object.keys(data).length === 0) {
                    setError("Processamento de Excel simplificado ainda não mapeou dados automaticamente. (WIP)");
                }
                setPreviewData(data);
            } else {
                throw new Error("Formato de arquivo não suportado. Use .json (backup), .pdf ou imagem.");
            }
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
        if (!previewData) return;

        if (isFullBackup) {
            // Restauração completa: repassa para o handler específico no App
            if (onFullRestore) {
                onFullRestore({ allData: previewData.allData, goals: previewData.goals });
            } else {
                // Fallback: tenta importar só o mês atual via onImport
                console.warn('[ImportModal] onFullRestore não fornecido. Usando fallback.');
            }
            onClose();
            return;
        }

        // Importação AI (PDF/contracheque) — injeta accountId e repassa
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
                            accept=".json,.pdf,.png,.jpg,.jpeg,.xlsx,.xls"
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
                                {loading ? 'Processando...' : 'Arraste ou clique para carregar'}
                            </p>
                            <p className="text-xs text-slate-500">
                                <span className="text-indigo-400 font-semibold">.json</span> (Backup Finexus) · PDF · Imagem · Excel
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

                    {/* Preview: Backup Completo */}
                    {previewData && isFullBackup && backupSummary && (
                        <div className="space-y-4 animate-slideUp">
                            <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <span className="material-symbols-rounded text-indigo-400 text-2xl">restore</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Backup Finexus detectado</p>
                                        <p className="text-xs text-slate-400">Todos os dados serão restaurados</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-900/60 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-indigo-400">{backupSummary.months}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Meses de histórico</p>
                                    </div>
                                    <div className="bg-slate-900/60 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-400">{backupSummary.goals}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Metas financeiras</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <span className="material-symbols-rounded text-amber-400 text-lg">warning</span>
                                <p className="text-xs text-amber-300">
                                    <strong>Atenção:</strong> Esta ação irá <strong>substituir todos os dados atuais</strong> pelos dados do backup.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Preview: Importação AI (contracheque, PDF) */}
                    {previewData && !isFullBackup && (
                        <div className="space-y-6 animate-slideUp">
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
                                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{item.pessoa || 'Geral'}</span>
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
                                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{item.pessoa || 'Geral'}</span>
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
                                <p className="text-xs text-slate-500 italic">Verifique os dados acima antes de confirmar a importação.</p>
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
                                <option key={acc.id} value={acc.id}>{acc.name} ({getOwnerLabel(acc.owner)})</option>
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
