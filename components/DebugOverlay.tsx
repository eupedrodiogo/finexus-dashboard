
import React, { useEffect, useState } from 'react';
import { debugLogs, subscribeToLogs } from '../utils/debugLogger';

export function DebugOverlay() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Initial sync
        setLogs([...debugLogs]);

        const unsubscribe = subscribeToLogs(() => {
            setLogs([...debugLogs]);
        });
        return unsubscribe;
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity"
            >
                🐞
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Debug Logs</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-xs bg-slate-100 dark:bg-slate-950/50">
                    {logs.length === 0 && (
                        <div className="text-center text-slate-400 py-8">No logs yet...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-700 dark:text-slate-300 break-words border-b border-slate-200/50 dark:border-slate-800/50 pb-1">
                            {log}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2">
                    <button
                        onClick={() => {
                            // clear logs
                            debugLogs.length = 0;
                            setLogs([]);
                        }}
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-indigo-500 text-white rounded text-xs"
                    >
                        Reload
                    </button>
                </div>
            </div>
        </div>
    );
}
