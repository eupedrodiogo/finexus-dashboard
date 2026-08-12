import React, { useRef } from 'react';
import { Delete, ChevronDown } from 'lucide-react';

interface NumericKeypadProps {
  /** Recebe um ou mais dígitos ("7", "00") para acrescentar ao valor. */
  onDigit: (digits: string) => void;
  onBackspace: () => void;
  /** Disparado pelo toque longo no backspace. */
  onClear: () => void;
  onDismiss: () => void;
  onConfirm: () => void;
  confirmDisabled: boolean;
  confirmLabel: string;
  confirmIcon: React.ReactNode;
  gradient: string;
  glow: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Vibração curta a cada tecla. Só existe no Android/Chrome — em iOS o método
// simplesmente não está definido e o teclado segue funcionando sem retorno tátil.
const tap = () => {
  try { navigator.vibrate?.(8); } catch { /* sem suporte a haptics */ }
};

const keyClasses =
  'flex items-center justify-center rounded-2xl py-3 font-black text-xl transition-transform active:scale-95 ' +
  'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100';

/**
 * Teclado numérico exibido dentro do próprio modal em telas pequenas, no lugar
 * do teclado do sistema. Como o teclado nativo cobre o rodapé do bottom sheet,
 * o botão de confirmar mora aqui dentro — assim ele nunca fica escondido.
 */
export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onDigit, onBackspace, onClear, onDismiss, onConfirm,
  confirmDisabled, confirmLabel, confirmIcon, gradient, glow,
}) => {
  const holdTimer = useRef<number | null>(null);

  const startHold = () => {
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      onClear();
      tap();
    }, 550);
  };

  const cancelHold = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  // Impede que a tecla roube o foco do campo de valor ao ser pressionada.
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  const press = (digits: string) => () => { onDigit(digits); tap(); };

  return (
    <div
      className="shrink-0 select-none border-t border-slate-200 dark:border-white/5 px-3 pt-2"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))', touchAction: 'manipulation' }}
    >
      {/* Recolher o teclado para ver o restante do formulário */}
      <button
        type="button"
        onClick={onDismiss}
        onMouseDown={keepFocus}
        aria-label="Recolher teclado"
        className="w-full flex items-center justify-center py-1 mb-1.5 text-slate-400 dark:text-slate-500 active:scale-95 transition-transform"
      >
        <ChevronDown size={16} />
      </button>

      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map(d => (
          <button key={d} type="button" onClick={press(d)} onMouseDown={keepFocus} className={keyClasses}>
            {d}
          </button>
        ))}

        {/* Quase todo lançamento em real termina em ,00 — economiza dois toques */}
        <button type="button" onClick={press('00')} onMouseDown={keepFocus} className={keyClasses}>
          00
        </button>
        <button type="button" onClick={press('0')} onMouseDown={keepFocus} className={keyClasses}>
          0
        </button>
        <button
          type="button"
          onClick={() => { onBackspace(); tap(); }}
          onMouseDown={keepFocus}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          aria-label="Apagar (segure para limpar)"
          className={keyClasses}
        >
          <Delete size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`w-full mt-2 py-3.5 rounded-2xl font-black text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.18em] disabled:cursor-not-allowed ${
          confirmDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500' : 'text-white'
        }`}
        style={confirmDisabled ? {} : { background: gradient, boxShadow: `0 8px 24px ${glow}` }}
      >
        {confirmIcon}
        <span>{confirmLabel}</span>
      </button>
    </div>
  );
};
