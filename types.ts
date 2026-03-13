
export interface LineItem {
  id: string;
  name: string;
  value: number;
  isRecurring?: boolean;
  annualRate?: number;
  // Credit Card Fields
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  installments?: {
    current: number;
    total: number;
  };
  date?: string; // ISO Date string YYYY-MM-DD
  // Account Fields
  accountId?: string;
  isPaid?: boolean;
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
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash';
  owner: 'pedro' | 'izabel' | 'joint';
  initialBalance: number;
  color: string;
}
