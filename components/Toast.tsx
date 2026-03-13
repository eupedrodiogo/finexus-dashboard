
import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColors = {
    success: 'bg-emerald-500 shadow-emerald-500/30',
    error: 'bg-rose-500 shadow-rose-500/30',
    info: 'bg-indigo-500 shadow-indigo-500/30'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-lg backdrop-blur-md transform transition-all duration-500 animate-slideIn ${bgColors[toast.type]}`}>
      <span className="material-symbols-rounded notranslate text-xl bg-white/20 p-1 rounded-full">{icons[toast.type]}</span>
      <span className="font-bold text-sm">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="material-symbols-rounded notranslate text-lg">close</span>
      </button>
      <style>{`
         @keyframes slideIn {
           from { opacity: 0; transform: translateY(20px) scale(0.95); }
           to { opacity: 1; transform: translateY(0) scale(1); }
         }
         .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
       `}</style>
    </div>
  );
};
export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 items-center pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className="pointer-events-auto">
        <Toast toast={toast} onClose={onClose} />
      </div>
    ))}
  </div>
);
