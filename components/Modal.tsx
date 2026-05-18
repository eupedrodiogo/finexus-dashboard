import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[50000] flex justify-center items-end sm:items-center sm:p-4 transition-all duration-500 animate-fadeIn pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop com Blur Profundo idêntico ao menu de gestão */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-[64px] z-[50001]" 
        onClick={onClose}
      />

      <div
        className="relative z-[50002] w-full max-w-md transform transition-all duration-500 animate-scaleIn pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>,
    document.body
  );
};
