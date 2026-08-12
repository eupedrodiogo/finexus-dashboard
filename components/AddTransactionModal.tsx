import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, CreditCard, Wallet, Calendar, Hash, Repeat, Save, Plus,
  TrendingDown, TrendingUp, ArrowLeftRight, LineChart, ChevronDown, Settings,
  CheckCircle2, Circle, Eye, EyeOff, AlertTriangle, History, Zap, Layers,
  Mic, Loader2, Camera
} from 'lucide-react';
import { FinancialData, Category } from '../types';
import { Transaction } from './TransactionHistory';
import { getOwnerLabel, TRANSFER_SUB_IDS, todayISO, daysAgoISO } from '../utils';
import { CategoryManagerOverlay } from './CategoryManagerOverlay';
import { NumericKeypad } from './NumericKeypad';
import {
  useTransactionMemory, guessTargetFromKeywords, findPotentialDuplicate, TransactionMemoryEntry
} from '../hooks/useTransactionMemory';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { parseVoiceTransaction, VoiceParseContext, VoiceParseResult } from '../services/voiceTransactionService';
import { parseFreeText, looksLikeFreeText, FreeTextResult } from '../services/freeTextTransactionService';
import { processImageWithGemini } from '../services/fileProcessingService';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: FinancialData;
  /** Histórico completo — alimenta a memória de lançamentos (sugestões e atalhos). */
  allData?: { [monthKey: string]: FinancialData };
  onAddTransaction: (transaction: NewTransactionData) => void;
  dataToEdit?: Transaction | null;
  onEditTransaction?: (updated: { id: string } & NewTransactionData) => void;
  initialType?: TransactionType;
  onAddSubCategory?: (categoryId: string, name: string) => void;
  onEditSubCategory?: (categoryId: string, subId: string, newName: string) => void;
  onDeleteSubCategory?: (categoryId: string, subId: string) => void;
}

export interface NewTransactionData {
  description: string;
  amount: number;
  categoryId: string;
  subCategoryId: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  accountId?: string;
  toAccountId?: string;
  installments?: number;
  date: Date;
  isRecurring?: boolean;
  frequency?: 'monthly';
  recurrenceLimit?: number;
  transactionType?: TransactionType;
  isPaid?: boolean;
  isIgnored?: boolean;
}

export type TransactionType = 'expense' | 'income' | 'credit_card' | 'transfer' | 'investment';

interface TypeOption {
  id: TransactionType;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  /** Categorias onde este tipo pode ser lançado (a 1ª é o padrão). Vazio = não usa categoria (transferência). */
  categoryIds: string[];
}

/** Fonte única do visual de cada tipo (gradiente, glow, ícone). Também usada
 *  pelo botão flutuante, para o leque falar a mesma língua do formulário. */
export const TYPE_OPTIONS: TypeOption[] = [
  { id: 'expense',     label: 'Despesa',      icon: TrendingDown,   gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', glow: 'rgba(244,63,94,0.4)',   categoryIds: ['additionalVariableCosts', 'basicExpenses'] },
  { id: 'income',      label: 'Receita',       icon: TrendingUp,     gradient: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.4)',  categoryIds: ['payslipIncome'] },
  { id: 'credit_card', label: 'Cartão',        icon: CreditCard,     gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', glow: 'rgba(99,102,241,0.4)',  categoryIds: ['additionalVariableCosts', 'basicExpenses'] },
  { id: 'transfer',    label: 'Transferência', icon: ArrowLeftRight, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.4)',  categoryIds: [] },
  { id: 'investment',  label: 'Investimento',  icon: LineChart,      gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow: 'rgba(139,92,246,0.4)',  categoryIds: ['investments'] },
];

const LABELS: Record<TransactionType, { question: string; sub: string }> = {
  expense:     { question: 'Quanto você gastou?',     sub: 'Despesa' },
  income:      { question: 'Quanto você recebeu?',    sub: 'Receita' },
  credit_card: { question: 'Valor da compra?',        sub: 'Cartão de Crédito' },
  transfer:    { question: 'Valor da transferência?', sub: 'Entre Contas' },
  investment:  { question: 'Valor do aporte?',        sub: 'Investimento' },
};

const inputClasses = "w-full outline-none px-4 py-2.5 text-[13px] font-bold rounded-[14px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all";

const DATE_SHORTCUTS = [
  { label: 'Hoje',      value: () => todayISO() },
  { label: 'Ontem',     value: () => daysAgoISO(1) },
  { label: 'Anteontem', value: () => daysAgoISO(2) },
];

// O valor é digitado em centavos (1234 → 12,34), como no teclado numérico:
// o usuário nunca precisa digitar vírgula nem se preocupar com formatação.
const centsToNumber = (cents: string) => Number(cents || '0') / 100;
const formatCents = (cents: string) =>
  centsToNumber(cents).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Abaixo desta largura o teclado do sistema cobriria o rodapé do bottom sheet
// (junto com o botão de confirmar), então usamos o teclado próprio do app.
const COMPACT_BREAKPOINT = 768;
const MAX_AMOUNT_DIGITS = 11;

// Valores longos precisam encolher para caber na largura do celular
const amountFontClass = (cents: string) =>
  cents.length > 8 ? 'text-3xl' : cents.length > 6 ? 'text-4xl' : 'text-5xl';

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen, onClose, currentData, allData, onAddTransaction, dataToEdit, onEditTransaction, initialType,
  onAddSubCategory, onEditSubCategory, onDeleteSubCategory
}) => {
  const [txType, setTxType]           = useState<TransactionType>(initialType || 'expense');
  const [description, setDescription] = useState('');
  const [amountCents, setAmountCents] = useState('');
  // Destino do lançamento no formato "categoriaId:subcategoriaId"
  const [target, setTarget]           = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit'|'debit'|'pix'|'cash'>('debit');
  const [cardId, setCardId]           = useState('');
  const [accountId, setAccountId]     = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [installments, setInstallments] = useState(1);
  const [date, setDate]               = useState(todayISO());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceLimit, setRecurrenceLimit] = useState<number | ''>('');
  const [isPaid, setIsPaid]           = useState(false);
  const [isIgnored, setIsIgnored]     = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < COMPACT_BREAKPOINT);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Memória de lançamentos
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Sugestão destacada pelas setas do teclado (-1 = nenhuma)
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [serialMode, setSerialMode] = useState(false);   // lançar vários seguidos
  const [serialCount, setSerialCount] = useState(0);
  // Duplicata: some do 1º clique se o usuário mudar qualquer campo relevante,
  // então precisa ser confirmada de novo — não é um "não perguntar mais".
  const [duplicateIgnored, setDuplicateIgnored] = useState(false);
  // Enquanto o usuário não escolher a categoria na mão, a memória pode escolher por ele
  const targetTouchedRef = useRef(false);
  const memory = useTransactionMemory(allData || {});

  // Lançamento por voz: reconhece a fala, manda o texto para a IA interpretar
  // e preenche o formulário — a confirmação final continua manual.
  const speech = useSpeechRecognition();
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'processing'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const lastProcessedTranscriptRef = useRef('');

  // Lançamento por foto: tira/escolhe uma imagem do recibo e a IA extrai
  // valor, descrição e data — mesma revisão manual antes de confirmar.
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'processing'>('idle');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const currentType = TYPE_OPTIONS.find(t => t.id === txType)!;
  const label       = LABELS[txType];
  const amount      = centsToNumber(amountCents);

  const accounts = currentData.accounts || [];
  const cards    = currentData.cards    || [];

  // Grupos de destino: para despesas, "Despesa Básica" e "Gastos Variáveis" aparecem
  // juntos, para o lançamento essencial não precisar ser reclassificado depois.
  const targetGroups = useMemo(() => {
    return currentType.categoryIds
      .map(catId => {
        const cat = currentData[catId as keyof FinancialData] as Category | undefined;
        // As subcategorias de transferência são geridas pelo próprio tipo
        // "Transferência" — não servem de destino para um lançamento comum.
        const subs = (cat?.subCategories || []).filter(s => !TRANSFER_SUB_IDS.includes(s.id));
        return { categoryId: catId, title: cat?.title || catId, subs };
      })
      .filter(group => group.subs.length > 0);
  }, [currentType, currentData]);

  const [targetCategoryId, targetSubId] = target.split(':');
  const activeSubs = useMemo(
    () => targetGroups.find(g => g.categoryId === targetCategoryId)?.subs || [],
    [targetGroups, targetCategoryId]
  );

  // ── Memória de lançamentos ──────────────────────────────────────────────────

  const suggestions = useMemo(
    () => (dataToEdit ? [] : memory.suggest(description, 4)),
    [memory, description, dataToEdit]
  );
  const favorites = useMemo(
    () => (dataToEdit ? [] : memory.favorites(6)),
    [memory, dataToEdit]
  );

  /** De onde veio o lançamento anterior → em que aba ele deve ser recriado. */
  const entryType = (entry: TransactionMemoryEntry): TransactionType => {
    if (entry.cardId) return 'credit_card';
    if (entry.categoryId === 'investments') return 'investment';
    if (entry.categoryId === 'payslipIncome') return 'income';
    return 'expense';
  };

  /**
   * Repete um lançamento do histórico: além da descrição, traz valor, categoria,
   * conta/cartão e método. `withAmount` fica falso na sugestão por digitação, para
   * não sobrescrever um valor que a pessoa acabou de digitar.
   */
  const applyEntry = (entry: TransactionMemoryEntry, withAmount: boolean) => {
    setTxType(entryType(entry));
    setDescription(entry.description);
    setTarget(`${entry.categoryId}:${entry.subCategoryId}`);
    targetTouchedRef.current = true;
    if (withAmount || !amountCents) setAmountCents(String(Math.round(entry.lastValue * 100)));
    if (entry.cardId) setCardId(entry.cardId);
    if (entry.accountId) setAccountId(entry.accountId);
    if (entry.paymentMethod && entry.paymentMethod !== 'credit') setPaymentMethod(entry.paymentMethod);
    setInstallments(1);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  // ── Lançamento por voz ──────────────────────────────────────────────────────

  // Categorias fixas do app (ver FinancialData em types.ts), com o(s) tipo(s) de
  // lançamento a que cada uma se aplica — é o "cardápio" de ids válidos que a IA
  // pode escolher ao interpretar a fala.
  const voiceContext: VoiceParseContext = useMemo(() => {
    const sources: { catId: keyof FinancialData; tipos: TransactionType[] }[] = [
      { catId: 'additionalVariableCosts', tipos: ['expense', 'credit_card'] },
      { catId: 'basicExpenses',           tipos: ['expense', 'credit_card'] },
      { catId: 'payslipIncome',           tipos: ['income'] },
      { catId: 'investments',             tipos: ['investment'] },
    ];
    const groups = sources
      .map(({ catId, tipos }) => {
        const cat = currentData[catId] as Category | undefined;
        const subs = (cat?.subCategories || []).filter(s => !TRANSFER_SUB_IDS.includes(s.id));
        return { categoriaId: catId, titulo: cat?.title || catId, tipos, subcategorias: subs.map(s => ({ id: s.id, nome: s.name })) };
      })
      .filter(g => g.subcategorias.length > 0);

    return {
      groups,
      cartoes: cards.map(c => ({ id: c.id, nome: c.name })),
      contas: accounts.map(a => ({ id: a.id, nome: a.name })),
    };
  }, [currentData, cards, accounts]);

  /** Aplica o que a IA entendeu da fala nos campos do formulário — nada é
   *  enviado sozinho, o usuário revisa e confirma como em qualquer lançamento. */
  const applyVoiceResult = (result: VoiceParseResult) => {
    if (result.tipo) setTxType(result.tipo);
    if (result.valor > 0) setAmountCents(String(Math.round(result.valor * 100)));
    if (result.descricao) setDescription(result.descricao);
    if (result.categoriaId && result.subcategoriaId) {
      setTarget(`${result.categoriaId}:${result.subcategoriaId}`);
      targetTouchedRef.current = true;
    }
    if (result.metodoPagamento) setPaymentMethod(result.metodoPagamento);
    if (result.cartaoId) setCardId(result.cartaoId);
    if (result.contaId) setAccountId(result.contaId);
    if (result.parcelas && result.parcelas > 1) setInstallments(result.parcelas);
    if (result.data) setDate(result.data);
  };

  // ── Parser de texto livre ────────────────────────────────────────────────────
  // Par local do lançamento por voz: mesma ideia (preenche os campos, nunca
  // envia sozinho), mas via regex — instantâneo, sem rede e sem custo. Ativa
  // ao colar ou ao apertar Enter na descrição com algo que pareça um valor.

  const applyFreeTextResult = (result: FreeTextResult) => {
    if (result.transactionType) setTxType(result.transactionType);
    setAmountCents(String(Math.round(result.amount * 100)));
    setDescription(result.description);
    if (result.paymentMethod) setPaymentMethod(result.paymentMethod);
    if (result.cardId) setCardId(result.cardId);
    if (result.accountId) setAccountId(result.accountId);
    if (result.installments) setInstallments(result.installments);
    if (result.date) setDate(result.date);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const freeTextContext = useMemo(() => ({
    cards: cards.map(c => ({ id: c.id, name: c.name })),
    accounts: accounts.map(a => ({ id: a.id, name: a.name })),
  }), [cards, accounts]);

  /** Tenta interpretar `text` como lançamento corrido; devolve se aplicou algo. */
  const tryApplyFreeText = (text: string): boolean => {
    if (dataToEdit || isTransfer || !looksLikeFreeText(text)) return false;
    const result = parseFreeText(text, freeTextContext);
    if (!result) return false;
    applyFreeTextResult(result);
    return true;
  };

  const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (tryApplyFreeText(pasted)) e.preventDefault();
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Só intercepta o Enter quando o valor ainda não foi preenchido à mão —
    // depois disso, Enter volta a significar "confirmar o lançamento" (ver
    // handleKeyDown mais abaixo, que trata o resto do teclado do modal).
    if (e.key !== 'Enter' || amountCents) return;
    if (tryApplyFreeText(description)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMicClick = () => {
    if (speech.isListening) { speech.stop(); return; }
    if (!speech.isSupported) {
      setVoiceError('Reconhecimento de voz não é suportado neste navegador. Tente Chrome, Edge ou Safari.');
      return;
    }
    setVoiceError(null);
    setPhotoError(null);
    speech.start();
  };

  // Quando a captura termina com um texto novo, manda para a IA interpretar.
  useEffect(() => {
    if (speech.isListening) return;
    const t = speech.transcript.trim();
    if (!t || t === lastProcessedTranscriptRef.current) return;
    lastProcessedTranscriptRef.current = t;

    let cancelled = false;
    (async () => {
      setVoiceStatus('processing');
      setVoiceError(null);
      try {
        const result = await parseVoiceTransaction(t, voiceContext);
        if (!cancelled) applyVoiceResult(result);
      } catch (err: any) {
        if (!cancelled) setVoiceError(err?.message || 'Erro ao interpretar o áudio.');
      } finally {
        if (!cancelled) setVoiceStatus('idle');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.isListening, speech.transcript]);

  useEffect(() => {
    if (!speech.error) return;
    const messages: Record<string, string> = {
      'not-allowed': 'Permita o uso do microfone para lançar por voz.',
      'no-speech': 'Não ouvi nada. Tente novamente.',
      'network': 'Sem conexão para o reconhecimento de voz.',
      'unsupported': 'Reconhecimento de voz não é suportado neste navegador.',
      'unknown': 'Não foi possível usar o microfone.',
    };
    setVoiceError(messages[speech.error] || messages.unknown);
  }, [speech.error]);

  // Fecha o microfone se o modal for fechado no meio de uma captura
  useEffect(() => {
    if (!isOpen && speech.isListening) speech.stop();
  }, [isOpen]);

  // ── Lançamento por foto (recibo/nota/contracheque) ──────────────────────────
  // Mesma ideia da voz — só preenche os campos, nada é enviado sozinho — mas
  // reaproveita o processImageWithGemini que já existia para a Importação
  // Inteligente do Dashboard; aqui é sempre UM lançamento por foto, não um lote.

  const handlePhotoFile = async (file: File) => {
    setPhotoStatus('processing');
    setPhotoError(null);
    setVoiceError(null);
    try {
      const data = await processImageWithGemini(file, 'auto');
      // Prioriza despesa (o caso mais comum de "tirar foto da nota"); sem
      // despesa, tenta receita. Deduções ficam de fora — pertencem ao fluxo
      // de contracheque completo (receita + dedução juntas) do Importar Extrato.
      const despesa = data?.despesas?.[0];
      const receita = !despesa ? data?.receitas?.[0] : null;
      const item = despesa || receita;

      if (!item || !(item.valor > 0)) {
        setPhotoError('Não consegui identificar um valor nessa imagem. Tente uma foto mais nítida.');
        return;
      }

      setTxType(despesa ? 'expense' : 'income');
      setAmountCents(String(Math.round(item.valor * 100)));
      setDescription(item.estabelecimento ? `${item.descricao} — ${item.estabelecimento}` : item.descricao);
      if (item.data) setDate(item.data);
      setShowSuggestions(false);
    } catch (err: any) {
      setPhotoError(err?.message || 'Erro ao ler a imagem.');
    } finally {
      setPhotoStatus('idle');
    }
  };

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher o mesmo arquivo de novo depois
    if (file) handlePhotoFile(file);
  };

  // Categoria automática: o que você fez da última vez com essa descrição vence;
  // sem histórico, tenta pelas palavras-chave. Só age enquanto a categoria não
  // tiver sido escolhida na mão.
  useEffect(() => {
    if (!isOpen || dataToEdit || txType === 'transfer' || targetTouchedRef.current) return;
    if (description.trim().length < 3 || targetGroups.length === 0) return;

    const remembered = memory.lookup(description);
    const guess = remembered && remembered.categoryId && remembered.subCategoryId
      ? `${remembered.categoryId}:${remembered.subCategoryId}`
      : guessTargetFromKeywords(description, targetGroups);

    if (!guess) return;
    const [catId, subId] = guess.split(':');
    const valid = targetGroups.some(g => g.categoryId === catId && g.subs.some(s => s.id === subId));
    if (valid && guess !== target) setTarget(guess);
  }, [description, isOpen, dataToEdit, txType, targetGroups, memory, target]);

  // Mantém o destino sempre válido para o tipo selecionado
  useEffect(() => {
    if (!isOpen || targetGroups.length === 0) return;
    const stillValid = targetGroups.some(g =>
      g.categoryId === targetCategoryId && g.subs.some(s => s.id === targetSubId)
    );
    if (!stillValid) {
      const first = targetGroups[0];
      setTarget(`${first.categoryId}:${first.subs[0].id}`);
    }
  }, [isOpen, targetGroups, targetCategoryId, targetSubId]);

  // Transferência normalmente já foi executada quando você lança — nasce como
  // "Pago" para o saldo das contas refletir na hora.
  useEffect(() => {
    if (!isOpen || dataToEdit) return;
    setIsPaid(txType === 'transfer');
  }, [txType, isOpen, dataToEdit]);

  useEffect(() => {
    if (!isOpen) return;
    if (dataToEdit) {
      setDescription(dataToEdit.name);
      setAmountCents(String(Math.round((dataToEdit.value || 0) * 100)));
      if (dataToEdit.date) setDate(dataToEdit.date);
      const match = dataToEdit.catKey
        ? TYPE_OPTIONS.find(t => t.categoryIds.includes(dataToEdit.catKey as string))
        : undefined;
      if (dataToEdit.cardId) {
        setCardId(dataToEdit.cardId);
        setTxType('credit_card');
      } else if (match) {
        setTxType(match.id);
      }
      if (dataToEdit.catKey && dataToEdit.subId) setTarget(`${dataToEdit.catKey}:${dataToEdit.subId}`);
      if (dataToEdit.paymentMethod) setPaymentMethod(dataToEdit.paymentMethod as any);
      if (dataToEdit.accountId) setAccountId(dataToEdit.accountId);
      if (dataToEdit.isRecurring !== undefined) setIsRecurring(dataToEdit.isRecurring);
      if (dataToEdit.recurrenceLimit) setRecurrenceLimit(dataToEdit.recurrenceLimit);
      if ((dataToEdit as any).isPaid !== undefined) setIsPaid(!!(dataToEdit as any).isPaid);
      if ((dataToEdit as any).isIgnored !== undefined) setIsIgnored(!!(dataToEdit as any).isIgnored);
    } else if (initialType) {
      setTxType(initialType);
    }
  }, [isOpen, dataToEdit, initialType]);

  useEffect(() => {
    if (!isOpen) {
      setDescription(''); setAmountCents(''); setPaymentMethod('debit');
      setAccountId(''); setToAccountId(''); setCardId(''); setTarget('');
      setInstallments(1); setIsRecurring(false); setRecurrenceLimit('');
      setIsPaid(false); setIsIgnored(false);
      setDate(todayISO());
      setShowSuggestions(false); setActiveSuggestion(-1);
      setSerialMode(false); setSerialCount(0);
      setDuplicateIgnored(false);
      setVoiceStatus('idle'); setVoiceError(null);
      setPhotoStatus('idle'); setPhotoError(null);
      lastProcessedTranscriptRef.current = '';
      targetTouchedRef.current = false;
      if (!dataToEdit && !initialType) setTxType('expense');
    }
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, dataToEdit]);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < COMPACT_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Em tela pequena o valor é a primeira coisa a preencher, então o teclado já
  // nasce aberto. Ele se recolhe sozinho quando o foco vai para outro campo.
  useEffect(() => {
    setIsKeypadOpen(isOpen && isCompact);
  }, [isOpen, isCompact]);

  const pushDigits = (digits: string) => setAmountCents(prev => {
    const next = (prev + digits).replace(/^0+/, '');
    return next.length > MAX_AMOUNT_DIGITS ? prev : next;
  });
  const popDigit = () => setAmountCents(prev => prev.slice(0, -1));

  // Teclado físico (tablet com teclado acoplado) continua funcionando mesmo com
  // o campo em readOnly, que é o que impede o teclado do sistema de subir.
  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      pushDigits(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      popDigit();
    }
  };

  const isCredit    = txType === 'credit_card';
  const isTransfer  = txType === 'transfer';
  const isInstalled = isCredit && installments > 1;
  // Parcelamento já se repete sozinho — recorrência só faz sentido em compra à vista.
  const canRecur    = !isInstalled;

  // Mesmo hábito, mesmo valor, data próxima (±1 dia) já lançado antes — comum
  // quando se lança a fatura ou o dia inteiro em série e um item se repete por
  // engano. Transferência fica de fora: as duas pernas já têm valor e data
  // idênticos por natureza, dariam falso positivo constante.
  const duplicate = useMemo(() => {
    if (dataToEdit || isTransfer || amount <= 0 || !description.trim() || !date) return null;
    return findPotentialDuplicate(allData || {}, {
      description, amount, date, excludeId: dataToEdit?.id,
    });
  }, [allData, description, amount, date, isTransfer, dataToEdit]);

  // Qualquer mudança nos campos que compõem a duplicata invalida a confirmação
  // anterior — "lançar mesmo assim" vale para AQUELE lançamento, não para
  // qualquer coisa que o usuário digitar depois.
  useEffect(() => {
    setDuplicateIgnored(false);
  }, [description, amount, date]);

  const isDisabled =
    amount <= 0 || !description.trim() ||
    (isCredit && !cardId) ||
    (isTransfer && (!accountId || !toAccountId || accountId === toAccountId)) ||
    (!isTransfer && !targetSubId) ||
    (!!duplicate && !duplicateIgnored);

  const handleSubmit = () => {
    if (isDisabled) return;

    const payload: NewTransactionData = {
      description: description.trim(),
      amount,
      categoryId:    isTransfer ? '' : targetCategoryId,
      subCategoryId: isTransfer ? '' : targetSubId,
      paymentMethod: isCredit ? 'credit' : paymentMethod,
      cardId:        isCredit ? cardId : undefined,
      accountId:     isCredit ? undefined : (accountId || undefined),
      toAccountId:   isTransfer ? toAccountId : undefined,
      installments:  isCredit ? installments : undefined,
      date:          new Date(date + 'T12:00:00'),
      isRecurring:   canRecur ? isRecurring : false,
      recurrenceLimit: (canRecur && isRecurring && recurrenceLimit !== '') ? Number(recurrenceLimit) : undefined,
      transactionType: txType,
      isPaid,
      isIgnored: isTransfer ? false : isIgnored,
    };

    if (dataToEdit && onEditTransaction) {
      onEditTransaction({ id: dataToEdit.id, ...payload });
      onClose();
      return;
    }

    onAddTransaction(payload);

    // Modo série: mantém data, categoria, conta/cartão e tipo; limpa só o que
    // muda de um lançamento para o outro. É o caminho para lançar a fatura
    // inteira ou o dia inteiro sem reabrir o formulário toda vez.
    if (serialMode) {
      setAmountCents('');
      setDescription('');
      setShowSuggestions(false);
      setSerialCount(c => c + 1);
      if (isCompact) setIsKeypadOpen(true);
      else amountInputRef.current?.focus();
      return;
    }

    onClose();
  };

  /**
   * Teclado do computador: Enter confirma de qualquer campo, Esc fecha. Com a
   * lista de sugestões aberta, as setas navegam e Enter escolhe a destacada —
   * só depois disso o Enter volta a significar "confirmar".
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // O gerenciador de categorias é um modal por cima, com os atalhos dele
    if (isCategoryManagerOpen) return;

    const listOpen = showSuggestions && suggestions.length > 0;

    if (e.key === 'Escape') {
      e.stopPropagation();
      if (listOpen) { setShowSuggestions(false); setActiveSuggestion(-1); }
      else onClose();
      return;
    }

    if (listOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActiveSuggestion(prev => {
        const next = prev + delta;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
      return;
    }

    if (e.key === 'Enter') {
      if (listOpen && activeSuggestion >= 0) {
        e.preventDefault();
        applyEntry(suggestions[activeSuggestion], false);
        return;
      }
      // Enter dentro de <select> ou <textarea> pertence ao próprio campo
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'SELECT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const showAccountPicker = !isCredit && !isTransfer;
  const needsAccountWarning = showAccountPicker && isPaid && !accountId && accounts.length > 0;

  const confirmLabel = dataToEdit
    ? 'Salvar Edição'
    : (serialMode ? 'Confirmar e continuar' : 'Confirmar Lançamento');
  const confirmIcon  = dataToEdit ? <Save size={16} /> : <Plus size={16} />;
  const showKeypad   = isCompact && isKeypadOpen;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-[420px] z-10 flex flex-col bg-white dark:bg-[#0d1526] rounded-t-[28px] border-t border-x border-slate-200 dark:border-white/5"
        style={{
          boxShadow: '0 -8px 40px rgba(0,0,0,0.1)',
          maxHeight: '92vh',
        }}
      >
        {/* Linha de destaque no topo */}
        <div
          className="h-px w-full rounded-t-[28px]"
          style={{ background: currentType.gradient }}
        />

        {/* Glow de fundo contextual */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none -mr-8 -mt-8"
          style={{
            background: currentType.glow.replace('0.4', '0.06'),
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Handle (mobile) */}
            <div className="sm:hidden w-8 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:hidden w-8 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-3 ml-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: currentType.gradient, boxShadow: `0 4px 16px ${currentType.glow}` }}
            >
              <currentType.icon size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-base text-slate-800 dark:text-white leading-none tracking-tight">
                {dataToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 text-slate-500">{label.sub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-transform bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
          >
            <X size={15} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* ── Type Selector ── */}
        {!dataToEdit && (
          <div className="px-4 pt-4 pb-0 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TYPE_OPTIONS.map(opt => {
                const active = txType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTxType(opt.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all active:scale-95 border ${active ? 'border-white/15' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'}`}
                    style={active ? {
                      background: opt.gradient,
                      boxShadow: `0 4px 16px ${opt.glow}`
                    } : {}}
                  >
                    <opt.icon size={15} className={active ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                    <span className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Form ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
          onFocusCapture={e => {
            // Qualquer campo que não seja o valor precisa do teclado do sistema
            // (ou de um seletor nativo) — o teclado do app sai da frente.
            if (isCompact && e.target !== amountInputRef.current) setIsKeypadOpen(false);
          }}
        >

          {/* Atalhos: o que mais se repete no histórico, em um toque */}
          {favorites.length > 0 && !amountCents && !description && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 ml-0.5">
                <Zap size={10} />
                Lançamento rápido
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {favorites.map(entry => (
                  <button
                    key={entry.key}
                    onClick={() => applyEntry(entry, true)}
                    className="flex-shrink-0 flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-indigo-500/40"
                  >
                    <span className="text-xs font-bold whitespace-nowrap text-slate-700 dark:text-slate-200">{entry.description}</span>
                    <span className="text-[10px] font-black tracking-wider text-slate-400">
                      {entry.lastValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Valor + Descrição */}
          <div
            className="rounded-2xl p-4 text-center space-y-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
          >
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label.question}</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-800 dark:text-slate-200 font-black text-xl">R$</span>
              <input
                ref={amountInputRef}
                type="text"
                inputMode={isCompact ? 'none' : 'numeric'}
                readOnly={isCompact}
                value={amountCents ? formatCents(amountCents) : ''}
                onChange={e => setAmountCents(e.target.value.replace(/\D/g, '').slice(0, MAX_AMOUNT_DIGITS))}
                onKeyDown={isCompact ? handleAmountKeyDown : undefined}
                // Tocar no valor traz o teclado de volta depois de recolhido
                onClick={() => { if (isCompact) setIsKeypadOpen(true); }}
                placeholder="0,00" autoFocus={!isCompact}
                className={`bg-transparent ${amountFontClass(amountCents)} font-black focus:outline-none w-full text-center tracking-tighter transition-[font-size] ${isCompact ? 'caret-transparent cursor-pointer' : ''} ${amountCents ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-white/10'}`}
              />
            </div>
            {/* Descrição com memória: sugere o que já foi lançado antes e traz
                valor, categoria e conta junto. */}
            <div className="relative">
              <input
                type="text" value={description}
                onChange={e => { setDescription(e.target.value); setShowSuggestions(true); setActiveSuggestion(-1); }}
                onFocus={() => setShowSuggestions(true)}
                // O clique na sugestão precisa acontecer antes de a lista sumir
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onPaste={handleDescriptionPaste}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Descrição... (ou cole/digite 'mercado 50 pix ontem')"
                autoComplete="off"
                className={`w-full text-center font-bold text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all rounded-xl py-2.5 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 ${speech.isSupported ? 'pr-[4.5rem]' : 'pr-11'}`}
              />

              {/* Foto do recibo/nota/contracheque: mesma ideia da voz, mas lida
                  com uma imagem — reaproveita o processImageWithGemini que já
                  existia na Importação Inteligente do Dashboard. */}
              <input
                ref={photoInputRef}
                type="file" accept="image/*" capture="environment"
                onChange={handlePhotoInputChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoStatus === 'processing'}
                title="Ler recibo por foto"
                className={`absolute ${speech.isSupported ? 'right-10' : 'right-1.5'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-60 ${
                  photoStatus === 'processing'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-indigo-500'
                }`}
              >
                {photoStatus === 'processing' ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>

              {speech.isSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={voiceStatus === 'processing'}
                  title={speech.isListening ? 'Parar gravação' : 'Lançar por voz'}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-60 ${
                    speech.isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : voiceStatus === 'processing'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-indigo-500'
                  }`}
                >
                  {voiceStatus === 'processing' ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
                </button>
              )}

              {/* Banner de status/erro — voz e foto nunca rodam ao mesmo tempo
                  na prática, então uma prioridade simples entre as duas basta. */}
              {(speech.isListening || voiceStatus === 'processing' || voiceError || photoStatus === 'processing' || photoError) && (
                <div className={`absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl px-3 py-2 flex items-center gap-2 border text-[11px] font-semibold ${
                  (voiceError || photoError) && !speech.isListening && voiceStatus !== 'processing' && photoStatus !== 'processing'
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-white dark:bg-[#131c30] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}>
                  {speech.isListening && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span className="flex-1 truncate text-left">{speech.interimTranscript || speech.transcript || 'Ouvindo... fale o lançamento'}</span>
                    </>
                  )}
                  {!speech.isListening && voiceStatus === 'processing' && (
                    <>
                      <Loader2 size={12} className="animate-spin text-indigo-500 shrink-0" />
                      <span>Interpretando com IA...</span>
                    </>
                  )}
                  {!speech.isListening && voiceStatus !== 'processing' && photoStatus === 'processing' && (
                    <>
                      <Loader2 size={12} className="animate-spin text-indigo-500 shrink-0" />
                      <span>Lendo a imagem...</span>
                    </>
                  )}
                  {!speech.isListening && voiceStatus !== 'processing' && photoStatus !== 'processing' && (voiceError || photoError) && (
                    <>
                      <AlertTriangle size={12} className="shrink-0" />
                      <span className="flex-1 text-left">{voiceError || photoError}</span>
                    </>
                  )}
                </div>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl overflow-hidden bg-white dark:bg-[#131c30] border border-slate-200 dark:border-white/10 shadow-xl">
                  {suggestions.map((entry, idx) => (
                    <button
                      key={entry.key}
                      onMouseDown={e => e.preventDefault()}
                      onMouseEnter={() => setActiveSuggestion(idx)}
                      onClick={() => applyEntry(entry, false)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 ${
                        idx === activeSuggestion ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <History size={12} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{entry.description}</span>
                      </span>
                      <span className="text-[11px] font-black text-slate-400 shrink-0">
                        {entry.lastValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Destino: categoria + subcategoria (todos os tipos exceto transferência) */}
          {!isTransfer && (
            <Field label="Categoria" icon={<ChevronDown size={10} />}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={target}
                    onChange={e => { targetTouchedRef.current = true; setTarget(e.target.value); }}
                    className={`appearance-none cursor-pointer uppercase tracking-wider pr-9 ${inputClasses}`}
                  >
                    {targetGroups.length === 0 && <option value="" disabled>Nenhuma categoria</option>}
                    {targetGroups.length === 1
                      ? targetGroups[0].subs.map(s => (
                          <option key={s.id} value={`${targetGroups[0].categoryId}:${s.id}`} className="bg-white text-slate-800 dark:bg-[#0d1526] dark:text-white">
                            {s.name}
                          </option>
                        ))
                      : targetGroups.map(group => (
                          <optgroup key={group.categoryId} label={group.title}>
                            {group.subs.map(s => (
                              <option key={s.id} value={`${group.categoryId}:${s.id}`} className="bg-white text-slate-800 dark:bg-[#0d1526] dark:text-white">
                                {s.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                {onAddSubCategory && onEditSubCategory && onDeleteSubCategory && (
                  <button
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="w-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-indigo-600 transition-all active:scale-95"
                    title="Gerenciar Categorias"
                  >
                    <Settings size={16} />
                  </button>
                )}
              </div>
            </Field>
          )}

          {/* Conta (débito / pix / dinheiro) */}
          {showAccountPicker && accounts.length > 0 && (
            <Field label="Conta" icon={<Wallet size={10} />}>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {accounts.map(acc => (
                  <button key={acc.id} onClick={() => setAccountId(accountId === acc.id ? '' : acc.id)}
                    className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${accountId === acc.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                      <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* CREDIT CARD: cartão + parcelas */}
          {isCredit && (
            <>
              {cards.length > 0 ? (
                <Field label="Selecione o Cartão" icon={<CreditCard size={10} />}>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {cards.map(card => (
                      <button key={card.id} onClick={() => setCardId(card.id)}
                        className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${cardId === card.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${card.color}`} />
                          <span className="text-xs font-bold whitespace-nowrap">{card.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(card.owner || 'pedro')}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              ) : (
                <div className="rounded-xl px-4 py-3 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                  Nenhum cartão cadastrado. Adicione um em <strong>Cartões</strong> no menu.
                </div>
              )}
              <Field label="Parcelas" icon={<Hash size={10} />}>
                <div className="relative">
                  <select value={installments} onChange={e => setInstallments(parseInt(e.target.value))}
                    className={`appearance-none cursor-pointer pr-9 ${inputClasses}`}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i+1} value={i+1} className="bg-white text-slate-800 dark:bg-[#0d1526] dark:text-white">
                        {i+1}x {i > 0 && amount > 0 ? `(R$ ${(amount / (i+1)).toFixed(2)})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </Field>
            </>
          )}

          {/* TRANSFER: origem → destino */}
          {isTransfer && (
            accounts.length >= 2 ? (
              <>
                <Field label="Conta Origem" icon={<Wallet size={10} />}>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {accounts.filter(a => a.id !== toAccountId).map(acc => (
                      <button key={acc.id} onClick={() => setAccountId(acc.id)}
                        className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${accountId === acc.id ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                          <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                  <ArrowLeftRight size={13} className="text-amber-500" />
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </div>

                <Field label="Conta Destino" icon={<Wallet size={10} />}>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {accounts.filter(a => a.id !== accountId).map(acc => (
                      <button key={acc.id} onClick={() => setToAccountId(acc.id)}
                        className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 border ${toAccountId === acc.id ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || '#64748b' }} />
                          <span className="text-xs font-bold whitespace-nowrap">{acc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getOwnerLabel(acc.owner)}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed px-0.5">
                  Transferência move saldo entre as suas contas: não entra como receita nem como despesa do mês.
                </p>
              </>
            ) : (
              <div className="rounded-xl px-4 py-3 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                Você precisa de pelo menos 2 contas cadastradas para fazer transferências.
              </div>
            )
          )}

          {/* Data */}
          <Field label="Data" icon={<Calendar size={10} />}>
            {/* Quase todo lançamento é de hoje ou de ontem — o seletor de data
                continua ali para o resto. */}
            <div className="flex gap-1.5 mb-1.5">
              {DATE_SHORTCUTS.map(shortcut => {
                const value = shortcut.value();
                const active = date === value;
                return (
                  <button
                    key={shortcut.label}
                    onClick={() => setDate(value)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border ${
                      active
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400'
                    }`}
                  >
                    {shortcut.label}
                  </button>
                );
              })}
            </div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} />
          </Field>

          {/* Estado / Recorrência / Contabilização */}
          <div className={`grid gap-2 ${isTransfer ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <StatusToggle
              active={isPaid}
              onClick={() => setIsPaid(!isPaid)}
              activeClasses="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              icon={isPaid ? <CheckCircle2 size={15} fill="currentColor" /> : <Circle size={15} />}
              label={isPaid ? 'Pago' : 'Pendente'}
            />
            {canRecur ? (
              <StatusToggle
                active={isRecurring}
                onClick={() => setIsRecurring(!isRecurring)}
                activeClasses="bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                icon={<Repeat size={15} />}
                label="Recorrente"
              />
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center leading-tight">
                {installments}x já se repete
              </div>
            )}
            {!isTransfer && (
              <StatusToggle
                active={isIgnored}
                onClick={() => setIsIgnored(!isIgnored)}
                activeClasses="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                icon={isIgnored ? <EyeOff size={15} /> : <Eye size={15} />}
                label={isIgnored ? 'Ignorado' : 'Contabilizar'}
              />
            )}
          </div>

          {canRecur && isRecurring && (
            <Field label="Limite de Meses (vazio = vitalício)" icon={null}>
              <input
                type="number" min={1} value={recurrenceLimit}
                onChange={e => setRecurrenceLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ex: 12"
                className={inputClasses}
              />
            </Field>
          )}

          {/* Lançar em série: confirmar não fecha o formulário, mantém data,
              categoria, conta/cartão e tipo e já limpa valor e descrição. */}
          {!dataToEdit && (
            <button
              type="button"
              onClick={() => setSerialMode(!serialMode)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] ${
                serialMode
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
              }`}
            >
              <Layers size={14} />
              <span>
                {serialMode
                  ? (serialCount > 0 ? `Em série · ${serialCount} lançado${serialCount > 1 ? 's' : ''}` : 'Em série · o form fica aberto')
                  : 'Lançar vários seguidos'}
              </span>
            </button>
          )}

          {duplicate && !duplicateIgnored && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-relaxed">
                  Parece que isso já foi lançado: <strong>{duplicate.name}</strong>{' '}
                  {duplicate.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{' '}
                  em {new Date(duplicate.date + 'T12:00:00').toLocaleDateString('pt-BR')}.
                </p>
                <button
                  type="button"
                  onClick={() => setDuplicateIgnored(true)}
                  className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 underline decoration-dotted underline-offset-2"
                >
                  Lançar mesmo assim
                </button>
              </div>
            </div>
          )}

          {needsAccountWarning && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-relaxed">
                Marcado como pago sem conta vinculada — o saldo das contas não vai se mexer.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── (vira teclado numérico quando ele está aberto) */}
        {showKeypad ? (
          <NumericKeypad
            onDigit={pushDigits}
            onBackspace={popDigit}
            onClear={() => setAmountCents('')}
            onDismiss={() => setIsKeypadOpen(false)}
            onConfirm={handleSubmit}
            confirmDisabled={isDisabled}
            confirmLabel={confirmLabel}
            confirmIcon={confirmIcon}
            gradient={currentType.gradient}
            glow={currentType.glow}
          />
        ) : (
          <div className="px-4 pb-6 pt-3 shrink-0 border-t border-slate-200 dark:border-white/5">
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`w-full py-4 rounded-2xl font-black text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.18em] disabled:cursor-not-allowed ${isDisabled ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500' : 'text-white'}`}
              style={isDisabled ? {} : {
                background: currentType.gradient,
                boxShadow: `0 8px 24px ${currentType.glow}`,
              }}
            >
              {confirmIcon}
              <span>{confirmLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Manager Modal Overlay */}
      {isCategoryManagerOpen && targetCategoryId && onAddSubCategory && onEditSubCategory && onDeleteSubCategory && (
        <CategoryManagerOverlay
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={activeSubs}
          categoryId={targetCategoryId}
          typeLabel={targetGroups.find(g => g.categoryId === targetCategoryId)?.title || label.sub}
          onAdd={onAddSubCategory}
          onEdit={onEditSubCategory}
          onDelete={onDeleteSubCategory}
          gradient={currentType.gradient}
          glow={currentType.glow}
        />
      )}
    </div>,
    document.body
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    {label.trim() && (
      <label className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 ml-0.5">
        {icon}
        {label}
      </label>
    )}
    {children}
  </div>
);

const StatusToggle: React.FC<{
  active: boolean;
  onClick: () => void;
  activeClasses: string;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, activeClasses, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
      active ? activeClasses : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
