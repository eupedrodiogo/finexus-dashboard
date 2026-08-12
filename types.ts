
/**
 * Padrão unificado de recorrência:
 *   isRecurring      — flag principal. Se true, o item é propagado para meses futuros.
 *   frequency        — cadência da recorrência. Atualmente apenas 'monthly' é suportado.
 *   recurrenceLimit  — número de meses que deve durar (contando a partir de
 *                      `recurrenceStart`). undefined/null = infinito.
 *   recurrenceStart  — data do lançamento original. Preservada nas cópias
 *                      propagadas para o limite não reiniciar a cada mês.
 */
export interface LineItem {
  id: string;
  name: string;
  value: number;
  isRecurring?: boolean;
  frequency?: 'monthly'; // Cadência da recorrência (padrão: monthly)
  recurrenceLimit?: number; // Nº de meses a propagar (undefined = infinito)
  recurrenceStart?: string; // ISO Date do lançamento original — âncora do limite
  annualRate?: number;
  // Credit Card Fields
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  installments?: {
    current: number;
    total: number;
  };
  date?: string; // ISO Date string YYYY-MM-DD — âncora para recurrenceLimit
  // Account Fields
  accountId?: string;
  isPaid?: boolean;
  isIgnored?: boolean;
  /**
   * Transferência entre contas. Uma transferência gera DUAS pernas com o mesmo
   * `transferId`: a saída (categoria de despesa, conta de origem) e a entrada
   * (payslipIncome, conta de destino). Pernas de transferência movem o saldo das
   * contas mas NÃO entram em receita/despesa do mês — por isso ficam de fora de
   * calculateTotal/calculateRealTotal.
   */
  isTransfer?: boolean;
  transferId?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  items: LineItem[];
}

export interface Category {
  id: string;
  title: string;
  subCategories: SubCategory[];
  headerColor: string;
  budget?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  color: string;
}

export interface FinancialData {
  payslipIncome: Category;
  payslipDeductions: Category;
  basicExpenses: Category;
  investments: Category;
  additionalVariableCosts: Category;
  cards?: CreditCard[];
  accounts?: Account[];
  initialBalanceAdjustment?: number;
  joaoVitorReserve?: number;
  joaoVitorTarget?: number;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CreditCard {
  id: string;
  name: string;
  color: string;
  dueDay: number;
  closingDay: number;
  owner?: 'pedro' | 'izabel' | 'joint';
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'benefits';
  owner: 'pedro' | 'izabel' | 'joint';
  initialBalance: number;
  color: string;
}
