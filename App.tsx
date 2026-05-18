import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData, Goal, ToastMessage, LineItem } from './types';
import { Dashboard } from './components/Dashboard';
import { MonthlyView } from './components/MonthlyView';
import { AnnualSummary } from './components/AnnualSummary';
import { SmartAdvisor } from './components/SmartAdvisor';
import { InvestmentSimulator } from './components/InvestmentSimulator';
import { Sidebar } from './components/Sidebar';
import { MasterPlan } from './components/MasterPlan';
import { GoalsModal } from './components/GoalsModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastContainer } from './components/Toast';
import { calculateTotal, calculateAccountBalance, calculateMonthlyBalance } from './utils';
import { useAuth } from './contexts/AuthContext';
import { saveUserData, getUserData } from './services/firebaseService';
import { InvestmentAdvisor } from './components/InvestmentAdvisor';
import { MonthNavigator } from './components/MonthNavigator';
import { CreditCardsView } from './components/CreditCardsView';
import { AccountsView } from './components/AccountsView';
import { AddTransactionModal, NewTransactionData } from './components/AddTransactionModal';
import { MobileNavigation } from './components/MobileNavigation';
import { OnboardingModal } from './components/OnboardingModal';
import { InterfaceTour, TourStep } from './components/InterfaceTour';

// Restored Components
import { CompactKPIBar } from './components/CompactKPIBar';
import { TransactionFormScreen } from './components/TransactionFormScreen';
import { SmartFinancialHealthCard } from './components/SmartFinancialHealthCard';
import { SavingsCapacityCard } from './components/SavingsCapacityCard';
import { SpendingEfficiencyCard } from './components/SpendingEfficiencyCard';
import { AssetAllocation } from './components/AssetAllocation';
import { ComparisonView } from './components/ComparisonView';

const initialData: FinancialData = {
  payslipIncome: {
    id: 'payslipIncome',
    title: 'RECEITA BRUTA',
    headerColor: 'bg-indigo-600',
    subCategories: [
      {
        id: 'pedroIncome', name: 'Pedro', items: [
          { id: 'pedroSalario', name: 'salario', value: 2400.00, isRecurring: true },
          { id: 'pedroTrienio', name: 'trienio', value: 0 },
        ]
      },
      {
        id: 'izabelIncome', name: 'Izabel', items: [
          { id: 'izabelSalario', name: 'salario', value: 4027.25, isRecurring: true },
          { id: 'izabelAlimentacao', name: 'alimentacao', value: 250.00, isRecurring: true },
        ]
      }
    ]
  },
  payslipDeductions: {
    id: 'payslipDeductions',
    title: 'DEDUÇÕES',
    headerColor: 'bg-rose-600',
    subCategories: [
      {
        id: 'pedroDeductions', name: 'PEDRO', items: [
          { id: 'pedroInss', name: 'inss', value: 220.00, isRecurring: true },
          { id: 'pedroConsignado', name: 'consignado', value: 713.00, isRecurring: true },
        ]
      },
      {
        id: 'izabelDeductions', name: 'IZABEL', items: [
          { id: 'izabel**', name: '**', value: 534.86, isRecurring: true },
          { id: 'izabel***', name: '***', value: 87.83, isRecurring: true },
          { id: 'izabelConsignado', name: 'consignado', value: 1263.00, isRecurring: true },
        ]
      }
    ]
  },
  basicExpenses: {
    id: 'basicExpenses',
    title: 'DESPESA BÁSICA',
    headerColor: 'bg-slate-700',
    budget: 2600.00,
    subCategories: [
      {
        id: 'mainBasic', name: 'Essenciais', items: [
          { id: 'aluguel', name: 'ALUGUEL', value: 800.00, isRecurring: true },
          { id: 'compraMes', name: 'compra mês', value: 600.00 },
          { id: 'combustivel', name: 'combustivel', value: 300.00 },
          { id: 'energia', name: 'energia', value: 150.00, isRecurring: true },
          { id: 'internet', name: 'internet', value: 100.00, isRecurring: true },
        ]
      }
    ]
  },
  investments: {
    id: 'investments',
    title: 'INVESTIMENTOS',
    headerColor: 'bg-emerald-600',
    subCategories: [
      {
        id: 'mainInvest', name: 'Aportes', items: [
          { id: 'selic1', name: 'Tesouro Selic 2031 (Prot. 9654... e 9653...)', value: 368.58, date: '2026-03-04', isRecurring: false },
          { id: 'td1', name: 'COMPRA Tesouro Direto 96751588', value: 923.01, date: '2026-03-09', isRecurring: false },
          { id: 'td2', name: 'COMPRA Tesouro Direto 97018547', value: 1109.51, date: '2026-03-12', isRecurring: false },
        ]
      }
    ]
  },
  additionalVariableCosts: {
    id: 'additionalVariableCosts',
    title: 'GASTOS VARIÁVEIS',
    headerColor: 'bg-purple-600',
    subCategories: [
      {
        id: 'mainVar', name: 'Cartão / Outros', items: [
          { id: 'ifood', name: 'ifood fim de semana', value: 120.00 },
          { id: 'uber', name: 'uber', value: 45.00 },
        ]
      }
    ]
  },
  cards: [],
  accounts: [
    {
      id: 'inter-joint',
      name: 'Banco Inter (Conta Conjunta)',
      type: 'checking',
      owner: 'joint',
      initialBalance: 13.90,
      color: '#ff7a00'
    }
  ]
};

const initialGoals: Goal[] = [
  { id: '1', name: 'Reserva de Emergência', targetValue: 30000, currentValue: 12500, deadline: '2025-12-31', color: '#6366f1' },
  { id: '2', name: 'Viagem Europa', targetValue: 15000, currentValue: 4200, deadline: '2026-06-30', color: '#ec4899' },
  { id: '3', name: 'Troca de Carro', targetValue: 80000, currentValue: 5000, deadline: '2027-12-31', color: '#10b981' },
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('currentView') as any) || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [simulatorInitialValues, setSimulatorInitialValues] = useState<{ monthly?: number, initial?: number } | null>(null);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [transactionForm, setTransactionForm] = useState<{ isOpen: boolean, type?: 'expense' | 'income' | 'credit_card' | 'transfer' }>({ isOpen: false });
  const [isFanOpen, setIsFanOpen] = useState(false);

  // Scroll handler for Executive Header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsOnboardingOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Migration: Backfill missing dates for existing transactions
  useEffect(() => {
    let hasChanges = false;
    const migratedData = structuredClone(allData); // Deep copy to avoid mutating state directly

    Object.keys(migratedData).forEach(monthKey => {
      const monthData = migratedData[monthKey];

      // Helper to migrate categories
      const migrateCategory = (category: any) => {
        if (!category?.subCategories) return;
        category.subCategories.forEach((sub: any) => {
          sub.items.forEach((item: any) => {
            if (!item.date) {
              // Default to 1st of the month if date is missing
              item.date = `${monthKey}-01`;
              hasChanges = true;
            }
          });
        });
      };

      migrateCategory(monthData.payslipIncome);
      migrateCategory(monthData.payslipDeductions);
      migrateCategory(monthData.basicExpenses);
      migrateCategory(monthData.additionalVariableCosts);
      migrateCategory(monthData.investments);
    });

    // Reference: March 2026 logic
    const marchKey = Object.keys(migratedData).find(k => k.includes('2026') && k.includes('03')) || '2026 -03 ';
    
    // One-time cleanup: Delete months after March 2026 as requested by user
    Object.keys(migratedData).forEach(monthKey => {
      const match = monthKey.match(/(\d{4}) -(\d{2}) /);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        if (year > 2026 || (year === 2026 && month > 3)) {
          delete migratedData[monthKey];
          hasChanges = true;
        }
      }
    });

    const marchData = migratedData[marchKey];
    if (marchData) {
      
      // Migration: Extrato 12-02-2026 a 12-03-2026 PDF (Banco Inter)
      const marchDataObj = migratedData[marchKey];
      if (marchDataObj) {
        let addedExtrato = false;
        
        // Add investments
        const aportesSub = marchDataObj.investments?.subCategories?.find((s: any) => s.id === 'mainInvest');
        if (aportesSub && !aportesSub.items.some((i: any) => i.name.includes('Tesouro Selic 2031') || i.name.includes('96751588'))) {
           aportesSub.items.push(
              { id: 'selic1', name: 'Tesouro Selic 2031 (Prot. 9654... e 9653...)', value: 368.58, date: '2026-03-04', isRecurring: false },
              { id: 'td1', name: 'COMPRA Tesouro Direto 96751588', value: 923.01, date: '2026-03-09', isRecurring: false },
              { id: 'td2', name: 'COMPRA Tesouro Direto 97018547', value: 1109.51, date: '2026-03-12', isRecurring: false }
           );
           addedExtrato = true;
        }

        // Add PIX received to Income as additional items since they funded the account
        const pedroIncomeSub = marchDataObj.payslipIncome?.subCategories?.find((s: any) => s.id === 'pedroIncome');
        if (pedroIncomeSub && !pedroIncomeSub.items.some((i: any) => i.name.includes('Aporte Inter (PIX)'))) {
           pedroIncomeSub.items.push(
              { id: 'pix1-pedro', name: 'Aporte Inter (PIX)', value: 415.00, date: '2026-03-04', isRecurring: false }
           );
           addedExtrato = true;
        }

        const izabelIncomeSub = marchDataObj.payslipIncome?.subCategories?.find((s: any) => s.id === 'izabelIncome');
        if (izabelIncomeSub && !izabelIncomeSub.items.some((i: any) => i.name.includes('Aportes Inter (PIX)'))) {
           izabelIncomeSub.items.push(
              { id: 'pix1-izabel', name: 'Aportes Inter (PIX)', value: 2000.00, date: '2026-03-08', isRecurring: false }
           );
           addedExtrato = true;
        }

        // Ensure Inter account exists
        if (!marchDataObj.accounts) marchDataObj.accounts = [];
        if (!marchDataObj.accounts.some((a: any) => a.id === 'inter-joint')) {
           marchDataObj.accounts.push({
             id: 'inter-joint',
             name: 'Banco Inter (Conta Conjunta)',
             type: 'checking',
             owner: 'joint',
             initialBalance: 13.90, // Balance on 12-03-2026
             color: '#ff7a00'
           });
           addedExtrato = true;
        }

        if (addedExtrato) {
           hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      console.log("Migrating data: Backfilling missing dates...");
      setAllData(migratedData);
      localStorage.setItem('prosperaNexusAllData', JSON.stringify(migratedData));
    }
  }, []); // Run once on mount

  const handleCloseOnboarding = (startTour: boolean = false) => {
    setIsOnboardingOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (startTour) {
      // Delay to allow modal to close smoothly
      setTimeout(() => setIsTourActive(true), 800);
    }
  };

  const tourSteps: TourStep[] = [
    {
      targetId: 'kpi-summary',
      title: 'Resumo Financeiro',
      description: 'Aqui você vê uma visão rápida do seu saldo livre, ganhos e gastos do mês atual.',
      position: 'fixed-top',
      view: 'dashboard'
    },
    {
      targetId: 'performance-chart',
      title: 'Evolução Mensal',
      description: 'Acompanhe visualmente como seu patrimônio está evoluindo ao longo dos meses.',
      position: 'fixed-top',
      view: 'dashboard'
    },
    {
      targetId: 'month-view-header',
      title: 'Lançamentos Detalhados',
      description: 'Aqui você gerencia cada centavo. Adicione rendimentos, despesas e investimentos.',
      position: 'fixed-top',
      view: 'monthly'
    },
    /*
    {
      targetId: 'accounts-summary',
      title: 'Gestão de Contas',
      description: 'Mantenha o saldo de todas as suas contas bancárias sincronizado aqui.',
      position: 'fixed-top',
      view: 'accounts'
    },
    */
    {
      targetId: 'sidebar-nav',
      title: 'Navegação Completa',
      description: 'Use a barra lateral para navegar rapidamente entre todos os módulos do sistema.',
      position: 'fixed-top'
    },
    {
      targetId: 'fab-add',
      title: 'Lançamento Rápido',
      description: 'Precisa registrar algo rápido? Use este botão de qualquer lugar do app.',
      position: 'fixed-top'
    }
  ];

  const [currentTourStep, setCurrentTourStep] = useState(0);

  const handleNextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentTourStep + 1];
      if (nextStep.view && nextStep.view !== currentView) {
        setCurrentView(nextStep.view as any);
      }
      setCurrentTourStep(prev => prev + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevTourStep = () => {
    if (currentTourStep > 0) {
      const prevStep = tourSteps[currentTourStep - 1];
      if (prevStep.view && prevStep.view !== currentView) {
        setCurrentView(prevStep.view as any);
      }
      setCurrentTourStep(prev => prev - 1);
    }
  };

  const handleCompleteTour = () => {
    setIsTourActive(false);
    setCurrentTourStep(0);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleSkipTour = () => {
    setIsTourActive(false);
    setCurrentTourStep(0);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const { user } = useAuth();

  // User Profile State
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      const legacyNeo = localStorage.getItem('neoFinUserName');
      const legacyFin = localStorage.getItem('finNexusUserName');

      if (legacyFin) {
        localStorage.setItem('prosperaNexusUserName', legacyFin);
        localStorage.removeItem('finNexusUserName');
        return legacyFin;
      }
      if (legacyNeo) {
        localStorage.setItem('prosperaNexusUserName', legacyNeo);
        localStorage.removeItem('neoFinUserName');
        return legacyNeo;
      }

      return localStorage.getItem('prosperaNexusUserName') || 'Pedro & Izabel';
    }
    return 'Pedro & Izabel';
  });

  useEffect(() => {
    localStorage.setItem('prosperaNexusUserName', userName);
  }, [userName]);

  // Toast Handler
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize Goals from LocalStorage
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== 'undefined') {
      // Data Migration
      const legacyNeo = localStorage.getItem('neoFinGoals');
      const legacyFin = localStorage.getItem('finNexusGoals');

      if (legacyFin) {
        localStorage.setItem('prosperaNexusGoals', legacyFin);
        localStorage.removeItem('finNexusGoals');
      } else if (legacyNeo) {
        localStorage.setItem('prosperaNexusGoals', legacyNeo);
        localStorage.removeItem('neoFinGoals');
      }

      const saved = localStorage.getItem('prosperaNexusGoals');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse goals", e);
        }
      }
    }
    return initialGoals;
  });

  // Save Goals Effect
  useEffect(() => {
    localStorage.setItem('prosperaNexusGoals', JSON.stringify(goals));
  }, [goals]);

  // Goals Handlers
  const handleAddGoal = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
    showToast('Meta criada com sucesso!', 'success');
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    showToast('Meta atualizada!', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Meta removida.', 'info');
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const getMonthKey = (date: Date) => `${date.getFullYear()} -${String(date.getMonth() + 1).padStart(2, '0')} `;

  // Helper to get previous month key for carry-over logic
  const getPreviousMonthKey = (date: Date) => {
    const prevDate = new Date(date);
    prevDate.setMonth(date.getMonth() - 1);
    return `${prevDate.getFullYear()} -${String(prevDate.getMonth() + 1).padStart(2, '0')} `;
  };

  const currentMonthKey = getMonthKey(currentDate);

  const normalizeAllData = (data: any) => {
    if (!data) return {};
    const normalized: any = {};
    Object.keys(data).forEach(key => {
      // Only keep keys that look like YYYY -MM (our month key format)
      if (key.match(/^\d{4}\s*-\s*\d{2}/)) {
        normalized[key] = data[key];
      }
    });
    return normalized;
  };

  // Initialize AllData from LocalStorage
  const [allData, setAllData] = useState<{ [key: string]: FinancialData }>(() => {
    if (typeof window !== 'undefined') {
      // Data Migration (Simple check)
      const legacyNeo = localStorage.getItem('neoFinAllData');
      const legacyFin = localStorage.getItem('finNexusAllData');

      if (legacyFin) {
        localStorage.setItem('prosperaNexusAllData', legacyFin);
        localStorage.removeItem('finNexusAllData');
      } else if (legacyNeo) {
        localStorage.setItem('prosperaNexusAllData', legacyNeo);
        localStorage.removeItem('neoFinAllData');
      }

      const saved = localStorage.getItem('prosperaNexusAllData');
      if (saved) {
        try {
          return normalizeAllData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse financial data", e);
        }
      }
    }
    // Default fallback
    return { [currentMonthKey]: initialData };
  });

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Save AllData Effect
  useEffect(() => {
    localStorage.setItem('prosperaNexusAllData', JSON.stringify(allData));

    // Auto-save to Cloud if logged in and NOT currently syncing (avoid overwriting cloud with stale local data)
    if (user && !isSyncing) {
      const timeoutId = setTimeout(() => {
        saveUserData(user.uid, { allData, goals, userName });
      }, 2000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [allData, goals, userName, user, isSyncing]);

  // Cloud Sync Logic (Extracted for reuse)
  const syncFromCloud = async (isManual = false) => {
    if (!user) return;

    setIsSyncing(true);
    if (isManual) showToast('Iniciando sincronização forçada...', 'info');
    else showToast('Sincronizando com a nuvem...', 'info');

    try {
      const cloudData: any = await getUserData(user.uid);

      if (cloudData) {
        // We found data in the cloud! Update local state.
        if (cloudData.allData) setAllData(normalizeAllData(cloudData.allData));
        if (cloudData.goals) setGoals(cloudData.goals);
        if (cloudData.userName) setUserName(cloudData.userName);
        showToast('Dados atualizados da nuvem!', 'success');
      } else {
        // No cloud data found.
        if (isManual) {
          // If manual force sync and no data, maybe we should upload? 
          // For now, let's just say "No cloud data found, uploading local..."
          await saveUserData(user.uid, { allData, goals, userName });
          showToast('Nuvem estava vazia. Backup local enviado!', 'success');
        } else {
          // First login auto-sync: upload local data
          await saveUserData(user.uid, { allData, goals, userName });
          showToast('Backup inicial criado na nuvem!', 'success');
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      showToast('Erro ao sincronizar. Tente novamente.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial Cloud Sync Effect
  useEffect(() => {
    if (user) {
      syncFromCloud(false);
    }
  }, [user]);

  const handleForceSync = () => {
    syncFromCloud(true);
  };

  // Smart Month Logic: if current month data missing, clone previous month (keeping only recurring items)
  const currentData = useMemo(() => {
    if (allData[currentMonthKey]) {
      return allData[currentMonthKey];
    }

    const prevKey = getPreviousMonthKey(currentDate);
    if (allData[prevKey]) {
      // Clone previous month structure
      const newData = JSON.parse(JSON.stringify(allData[prevKey]));
      // Reset non-recurring items to 0
      Object.keys(newData).forEach(catKey => {
        const category = newData[catKey as keyof FinancialData];
        if (category && category.subCategories) {
          category.subCategories.forEach((sub: any) => {
            sub.items.forEach((item: any) => {
              if (!item.isRecurring) {
                item.value = 0;
              }
            });
          });
        }
      });
      return newData;
    }

    return JSON.parse(JSON.stringify(initialData));
  }, [allData, currentMonthKey]);

  const propagateRecurringItemsToFuture = (sourceData: FinancialData, sourceMonthKey: string, fullData: { [key: string]: FinancialData }) => {
    const clonedData = { ...fullData, [sourceMonthKey]: sourceData };
    const sortedKeys = Object.keys(clonedData).sort();
    const startIndex = sortedKeys.indexOf(sourceMonthKey);

    if (startIndex === -1 || startIndex === sortedKeys.length - 1) return clonedData;

    for (let i = startIndex; i < sortedKeys.length - 1; i++) {
      const currentMonth = clonedData[sortedKeys[i]];
      const nextKey = sortedKeys[i + 1];
      const nextMonth = JSON.parse(JSON.stringify(clonedData[nextKey]));
      let hasChanges = false;

      Object.keys(currentMonth).forEach(catKey => {
        const cat = currentMonth[catKey as keyof FinancialData];
        if (cat?.subCategories) {
          cat.subCategories.forEach((sub: any) => {
            sub.items.forEach((item: any) => {
              if (item.isRecurring) {
                const nextCat = nextMonth[catKey as keyof FinancialData];
                const nextSub = nextCat?.subCategories?.find((s: any) => s.id === sub.id);
                if (nextSub) {
                  const exists = nextSub.items.find((ni: any) => ni.id === item.id);
                  if (!exists) {
                    let nextDate = item.date;
                    if (nextDate && typeof nextDate === 'string') {
                      const yearMatch = nextKey.match(/(\d{4})/);
                      const monthMatch = nextKey.match(/-(\d{2})/);
                      if (yearMatch && monthMatch) {
                        nextDate = `${yearMatch[1]}-${monthMatch[1]}-01`;
                      }
                    }
                    nextSub.items.push({ ...item, isPaid: false, date: nextDate });
                    hasChanges = true;
                  }
                }
              }
            });
          });
        }
      });

      if (hasChanges) {
        clonedData[nextKey] = nextMonth;
      }
    }
    return clonedData;
  };

  const updateData = (newData: FinancialData) => {
    setAllData(prev => propagateRecurringItemsToFuture(newData, currentMonthKey, prev));
  };

  // Data Management Handlers
  const handleImportData = (data: { [key: string]: FinancialData }) => {
    setAllData(data);
    showToast('Dados importados com sucesso!', 'success');
  };

  const handleSmartImport = (importedData: any) => {
    // Deep clone current data to avoid mutation issues
    const newData = JSON.parse(JSON.stringify(currentData));

    let itemsAdded = 0;

    // Helper to add items to a category with smart person matching
    const addToCategory = (category: any, items: any[], type: 'income' | 'deduction' | 'expense') => {
      if (!items || items.length === 0) return;

      items.forEach((item: any) => {
        const person = item.pessoa || 'Geral';
        let targetSubId = '';

        // Determine target subcategory based on person and type
        if (type === 'income') {
          if (person === 'Pedro') targetSubId = 'pedroIncome';
          else if (person === 'Izabel') targetSubId = 'izabelIncome';
        } else if (type === 'deduction') {
          if (person === 'Pedro') targetSubId = 'pedroDeductions';
          else if (person === 'Izabel') targetSubId = 'izabelDeductions';
        }

        let targetSub = targetSubId ? category.subCategories.find((s: any) => s.id === targetSubId) : null;

        // Fallback to "Importados" if specific person subcategory not found
        if (!targetSub) {
          targetSub = category.subCategories.find((s: any) => s.name === 'Importados');
          if (!targetSub) {
            targetSub = { id: `imported-${Date.now()}`, name: 'Importados', items: [] };
            category.subCategories.push(targetSub);
          }
        }

        targetSub.items.push({
          id: `smart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.descricao || item.name || 'Item Importado',
          value: typeof item.valor === 'string' ? parseFloat(item.valor) : (item.valor || 0),

          isRecurring: false, // Default to false for imported items
          accountId: item.accountId, // Preserve account link
          paymentMethod: item.accountId ? 'debit' : undefined // Default to debit/cash if account is linked
        });
        itemsAdded++;
      });
    };

    // Handle Receitas (Income)
    if (importedData.receitas) {
      addToCategory(newData.payslipIncome, importedData.receitas, 'income');
    }

    // Handle Deduções (Deductions)
    if (importedData.deducoes) {
      addToCategory(newData.payslipDeductions, importedData.deducoes, 'deduction');
    }

    // Handle Despesas (Expenses)
    if (importedData.despesas) {
      addToCategory(newData.additionalVariableCosts, importedData.despesas, 'expense');
    }

    if (itemsAdded > 0) {
      updateData(newData);
      showToast(`${itemsAdded} itens importados com sucesso!`, 'success');
    } else {
      showToast('Nenhum dado reconhecido para importar.', 'info');
    }
  };

  // NEW FUNCTION: Handle Add Transaction
  const handleAddTransaction = (tx: NewTransactionData) => {
    const newAllData = JSON.parse(JSON.stringify(allData)); // Deep clone to be safe
    let toastMessage = 'Transação adicionada!';

    const addLineItem = (targetKey: string, categoryId: string, subId: string, item: Partial<LineItem>) => {
      // Ensure month exists
      if (!newAllData[targetKey]) {
        // Clone structure from initialData if missing
        newAllData[targetKey] = JSON.parse(JSON.stringify(initialData));
      }

      const category = newAllData[targetKey][categoryId as keyof FinancialData];
      if (!category) return; // Should not happen

      const subCategory = category.subCategories.find((s: any) => s.id === subId);
      if (subCategory) {
        subCategory.items.push({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          value: 0, // Fallback
          ...item,
        } as LineItem);
      }
    };

    if (tx.paymentMethod === 'credit' && tx.cardId && tx.installments) {
      const card = newAllData[currentMonthKey]?.cards?.find((c: any) => c.id === tx.cardId) ||
        initialData.cards?.find(c => c.id === tx.cardId); // Fallback to find card def

      if (!card) {
        showToast('Erro: Cartão não encontrado.', 'error');
        return;
      }

      const purchaseDate = new Date(tx.date);
      // Logic to find First Due Month
      // If purchase day >= closingDay, it goes to next month relative to purchase date
      let refMonth = purchaseDate.getMonth();
      let refYear = purchaseDate.getFullYear();

      if (purchaseDate.getDate() >= card.closingDay) {
        refMonth++; // Move to next month cycle
      }

      // Now calculate the specific Due Date based on Due Day vs Closing Day
      // If Due Day < Closing Day (e.g. Closing 25th, Due 5th), the due date is in the month AFTER the cycle closes.
      // e.g. Cycle closes Jan 25th. Due date is Feb 5th. 
      // If refMonth is Jan (from cycle calc above), then Due Month is Feb.
      if (card.dueDay < card.closingDay) {
        refMonth++;
      }

      // Create base date for calculation
      let currentDueDate = new Date(refYear, refMonth, card.dueDay);

      for (let i = 0; i < tx.installments; i++) {
        const installmentDate = new Date(currentDueDate);
        installmentDate.setMonth(currentDueDate.getMonth() + i);

        const targetKey = getMonthKey(installmentDate);
        const label = tx.installments > 1 ? `${tx.description} (${i + 1}/${tx.installments})` : tx.description;

        addLineItem(targetKey, tx.categoryId, tx.subCategoryId, {
          name: label,
          value: tx.amount / tx.installments,
          paymentMethod: 'credit',
          cardId: tx.cardId,
          installments: { current: i + 1, total: tx.installments },
          date: installmentDate.toISOString().split('T')[0] // Persist installment date
        });
      }
      toastMessage = `Compra lançada em ${tx.installments}x no ${card.name}!`;

    } else {
      // Debit / Cash / Pix
      // Use the selected date's month or current view? 
      // Ideally use the selected date in the modal.
      const targetViewKey = getMonthKey(tx.date);
      addLineItem(targetViewKey, tx.categoryId, tx.subCategoryId, {
        name: tx.description,
        value: tx.amount,
        paymentMethod: tx.paymentMethod,
        accountId: tx.accountId,
        date: tx.date.toISOString().split('T')[0], // Persist transaction date
        isRecurring: tx.isRecurring || false
      });
      
      const finalData = propagateRecurringItemsToFuture(newAllData[targetViewKey], targetViewKey, newAllData);
      setAllData(finalData);
      showToast(toastMessage, 'success');
      return; // Skip normal setAllData below
    }

    setAllData(newAllData);
    showToast(toastMessage, 'success');
  };




  const handleResetData = () => {
    setAllData({ [currentMonthKey]: initialData });
    setGoals(initialGoals);
    localStorage.removeItem('prosperaNexusAllData');
    localStorage.removeItem('prosperaNexusGoals');
    showToast('Dados resetados para o padrão.', 'info');
  };


  const updateItem = (categoryId: keyof FinancialData, subCategoryId: string, itemId: string, updates: Partial<LineItem>) => {
    const category = currentData[categoryId];
    const newSubCategories = category.subCategories.map(sub => {
      if (sub.id !== subCategoryId) return sub;
      return {
        ...sub,
        items: sub.items.map(item => (item.id === itemId ? { ...item, ...updates } : item))
      };
    });
    updateData({ ...currentData, [categoryId]: { ...category, subCategories: newSubCategories } });
  };

  const handleSubCategoryNameChange = (categoryId: keyof FinancialData, subCategoryId: string, newName: string) => {
    const category = currentData[categoryId];
    const newSubCategories = category.subCategories.map(sub =>
      sub.id === subCategoryId ? { ...sub, name: newName } : sub
    );
    updateData({ ...currentData, [categoryId]: { ...category, subCategories: newSubCategories } });
  };

  const handleDeleteSubCategory = (categoryId: keyof FinancialData, subCategoryId: string) => {
    const category = currentData[categoryId];
    const newSubCategories = category.subCategories.filter(sub => sub.id !== subCategoryId);
    updateData({ ...currentData, [categoryId]: { ...category, subCategories: newSubCategories } });
    showToast('Subcategoria removida.', 'info');
  };

  const totals = useMemo(() => {
    const grossIncome = calculateTotal(currentData.payslipIncome);
    const deductions = calculateTotal(currentData.payslipDeductions);
    const netIncome = grossIncome - deductions;
    const basicExpenses = calculateTotal(currentData.basicExpenses);
    const additionalVariableCosts = calculateTotal(currentData.additionalVariableCosts);
    const investments = calculateTotal(currentData.investments);
    const totalExpenses = basicExpenses + additionalVariableCosts;

    // Real Calculations (isPaid === true)
    const realGrossIncome = (currentData.payslipIncome?.subCategories?.reduce((acc, sub) => acc + (sub.items?.reduce((s, i) => s + (i.isPaid ? i.value : 0), 0) || 0), 0)) || 0;
    const realDeductions = (currentData.payslipDeductions?.subCategories?.reduce((acc, sub) => acc + (sub.items?.reduce((s, i) => s + (i.isPaid ? i.value : 0), 0) || 0), 0)) || 0;
    const realBasicExpenses = (currentData.basicExpenses?.subCategories?.reduce((acc, sub) => acc + (sub.items?.reduce((s, i) => s + (i.isPaid ? i.value : 0), 0) || 0), 0)) || 0;
    const realVars = (currentData.additionalVariableCosts?.subCategories?.reduce((acc, sub) => acc + (sub.items?.reduce((s, i) => s + (i.isPaid ? i.value : 0), 0) || 0), 0)) || 0;
    const realInvest = (currentData.investments?.subCategories?.reduce((acc, sub) => acc + (sub.items?.reduce((s, i) => s + (i.isPaid ? i.value : 0), 0) || 0), 0)) || 0;
    const realTotalExpenses = realBasicExpenses + realVars;
    const realNetIncome = realGrossIncome - realDeductions;

    // Calculate Individual Net Incomes
    const pedroGross = currentData.payslipIncome?.subCategories?.find(s => s.id === 'pedroIncome')?.items?.reduce((sum, i) => sum + i.value, 0) || 0;
    const pedroDeds = currentData.payslipDeductions?.subCategories?.find(s => s.id === 'pedroDeductions')?.items?.reduce((sum, i) => sum + i.value, 0) || 0;
    const pedroNetIncome = pedroGross - pedroDeds;

    const izabelGross = currentData.payslipIncome?.subCategories?.find(s => s.id === 'izabelIncome')?.items?.reduce((sum, i) => sum + i.value, 0) || 0;
    const izabelDeds = currentData.payslipDeductions?.subCategories?.find(s => s.id === 'izabelDeductions')?.items?.reduce((sum, i) => sum + i.value, 0) || 0;
    const izabelNetIncome = izabelGross - izabelDeds;

    // Calculate Monthly Result
    const monthlyBalance = netIncome - totalExpenses - investments;

    // Calculate Accumulated Previous Balance
    const sortedKeys = Object.keys(allData).sort();
    let previousBalance = 0;
    const currentRealMonthKey = new Date().toISOString().slice(0, 7);
    const earliestSavedKey = sortedKeys.length > 0 ? sortedKeys[0] : null;
    const startKey = (earliestSavedKey && earliestSavedKey < currentRealMonthKey) ? earliestSavedKey : currentRealMonthKey;
    const debugSteps: string[] = [];

    if (startKey < currentMonthKey) {
      const [startYear, startMonth] = startKey.split('-').map(Number);
      const [targetYear, targetMonth] = currentMonthKey.split('-').map(Number);
      let iteratorDate = new Date(startYear, startMonth - 1, 2);
      const targetDate = new Date(targetYear, targetMonth - 1, 2);
      const normalizedDataMap: Record<string, FinancialData> = {};
      Object.keys(allData).forEach(key => normalizedDataMap[key.replace(/\s/g, '')] = allData[key]);

      while (iteratorDate < targetDate) {
        const loopKey = `${iteratorDate.getFullYear()}-${String(iteratorDate.getMonth() + 1).padStart(2, '0')}`;
        const monthData = normalizedDataMap[loopKey] || initialData;
        const monthlyResult = calculateMonthlyBalance(monthData);
        previousBalance += monthlyResult;
        debugSteps.push(`Mês: ${loopKey} | Res: ${monthlyResult.toFixed(2)} | Acum: ${previousBalance.toFixed(2)}`);
        iteratorDate.setMonth(iteratorDate.getMonth() + 1);
      }
    }

    const accumulatedBalance = previousBalance + monthlyBalance;

    return {
      grossIncome, deductions, netIncome, basicExpenses,
      additionalVariableCosts, investments, totalExpenses,
      balance: accumulatedBalance,
      monthlyBalance,
      previousBalance,
      debugSteps,
      pedroNetIncome,
      izabelNetIncome,
      realGrossIncome,
      realTotalExpenses,
      realInvest,
      realDeductions,
      realBalance: previousBalance + (realNetIncome - realTotalExpenses - realInvest),
      realNetIncome
    };
  }, [currentData, allData, currentMonthKey]);

  const accountsTotal = useMemo(() => {
    return (currentData.accounts || []).reduce((acc, account) => acc + calculateAccountBalance(account, currentData), 0);
  }, [currentData]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') newDate.setMonth(prev.getMonth() - 1);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard
          data={currentData}
          totals={totals}
          allData={allData}
          currentMonth={currentDate}
          goals={goals}
          onManageGoals={() => setIsGoalsModalOpen(true)}
          onImport={handleSmartImport}
          accountsTotal={accountsTotal}
        />;
      case 'monthly':
        return <MonthlyView
          data={currentData}
          totals={totals}
          onPreviousMonth={() => handleMonthChange('prev')}
          onNextMonth={() => handleMonthChange('next')}
          onUpdate={updateData}
          onNavigate={(dir) => handleMonthChange(dir)}
          currentMonth={currentDate}
          handleAddItem={(cat, subId) => {
            const catData = currentData[cat as keyof FinancialData];
            const subCats = catData.subCategories.map(s => s.id === subId ? { ...s, items: [...s.items, { id: `item-${Date.now()}`, name: 'Novo Item', value: 0 }] } : s);
            updateData({ ...currentData, [cat]: { ...catData, subCategories: subCats } });
          }}
          handleDeleteItem={(cat: any, subId: any, itemId: any) => {
            const catData = currentData[cat as keyof FinancialData];
            const subCats = catData.subCategories.map(s => s.id === subId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s);
            updateData({ ...currentData, [cat]: { ...catData, subCategories: subCats } });
          }}
          handleValueChange={(cat: any, subId: any, itemId: any, val: any) => updateItem(cat, subId, itemId, { value: val })}
          handleNameChange={(cat: any, sub: any, id: any, val: any) => updateItem(cat, sub, id, { name: val })}
          handleCategoryTitleChange={(cat: any, val: any) => updateData({ ...currentData, [cat]: { ...currentData[cat], title: val } })}
          handleBudgetChange={(cat: any, val: any) => updateData({ ...currentData, [cat]: { ...currentData[cat], budget: val } })}
          handleRateChange={(cat: any, sub: any, id: any, val: any) => updateItem(cat, sub, id, { annualRate: val })}
          handleToggleRecurring={(cat: any, subId: any, itemId: any) => {
            const item = currentData[cat as keyof FinancialData].subCategories.find(s => s.id === subId)?.items.find(i => i.id === itemId);
            if (item) updateItem(cat as keyof FinancialData, subId, itemId, { isRecurring: !item.isRecurring });
          }}
          handleTogglePaid={(cat: any, subId: any, itemId: any) => {
            const item = currentData[cat as keyof FinancialData].subCategories.find(s => s.id === subId)?.items.find(i => i.id === itemId);
            if (item) updateItem(cat as keyof FinancialData, subId, itemId, { isPaid: !item.isPaid });
          }}
          itemToDelete={null}
          onConfirmDelete={() => { }}
          onCancelDelete={() => { }}
          onImport={handleSmartImport}
          handleSubCategoryNameChange={handleSubCategoryNameChange}
          handleDeleteSubCategory={handleDeleteSubCategory}
        />;
      case 'annual':
        return <AnnualSummary
          allData={allData}
          currentYear={currentDate.getFullYear()}
        />;
      case 'cards':
        return <CreditCardsView
          cards={currentData.cards || []}
          onUpdateCards={(newCards) => updateData({ ...currentData, cards: newCards })}
          allData={allData}
          currentMonth={currentDate.toISOString().slice(0, 7)}
        />;
      case 'accounts':
        return <AccountsView
          data={currentData}
          onUpdate={updateData}
          isMobile={window.innerWidth < 1024}
        />;
        {/*
      case 'advisor':
        return <SmartAdvisor
          allData={allData}
          userName={userName}
          onNavigateToSimulator={(values) => {
            setSimulatorInitialValues(values);
            setCurrentView('simulator');
          }}
        />;
      case 'simulator':
        return <InvestmentSimulator
          initialMonthlyContribution={simulatorInitialValues?.monthly}
          initialStartValue={simulatorInitialValues?.initial}
          onShowToast={showToast}
        />;
*/}
      case 'masterplan':
        return <MasterPlan isDarkMode={isDarkMode} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        id="sidebar-nav"
        className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300"
      >
        <Sidebar
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          userName={userName}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full transition-all duration-500 pb-24 md:pb-6">
        <div className="max-w-[1600px] w-full p-4 md:p-10 transition-all duration-500">

          <header 
            data-scrolled={isScrolled}
            className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-transparent data-[scrolled=true]:border-slate-200 dark:data-[scrolled=true]:border-slate-800 data-[scrolled=true]:shadow-sm -mx-4 md:-mx-10 px-4 md:px-10 py-4 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="transition-all duration-500 transform data-[scrolled=true]:scale-90">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <span className="md:hidden w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">F</span>
                    {currentView === 'dashboard' ? `Dashboard` :
                      currentView === 'monthly' ? 'Lançamentos' :
                        currentView === 'annual' ? 'Relatórios' :
                          currentView === 'cards' ? 'Cartões' :
                            currentView === 'accounts' ? 'Contas' : ''}
                  </h1>
                </div>
                
                {/* Desktop Sticky KPI Bar */}
                <div className={`hidden lg:block transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <CompactKPIBar totals={totals} />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none">
                  <MonthNavigator
                    currentMonth={currentDate}
                    onPrevious={() => handleMonthChange('prev')}
                    onNext={() => handleMonthChange('next')}
                  />
                </div>
                <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
                  <span className="material-symbols-rounded text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Sticky KPI Bar */}
            <div className={`lg:hidden mt-4 transition-all duration-500 ${isScrolled ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
              <CompactKPIBar totals={totals} />
            </div>
          </header>

          <div className="py-6">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Navigation - Only visible on mobile */}
      <MobileNavigation
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <GoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        allData={allData}
        userName={userName}
        onUpdateUserName={setUserName}
        onImport={handleImportData}
        onReset={handleResetData}
        onForceSync={handleForceSync}
      />

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        currentData={currentData}
        onAddTransaction={handleAddTransaction}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={(startTour) => handleCloseOnboarding(startTour)}
      />

      <InterfaceTour
        steps={tourSteps}
        isActive={isTourActive}
        currentStepIdx={currentTourStep}
        onNext={handleNextTourStep}
        onPrev={handlePrevTourStep}
        onComplete={handleCompleteTour}
        onSkip={handleSkipTour}
      />

      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-[40] flex flex-col gap-3">
        {/* Fan Menu Options */}
        {isFanOpen && (
          <div className="flex flex-col gap-3 mb-2 animate-fadeIn">
            {[
              { id: 'income', icon: 'trending_up', label: 'Receita', color: 'bg-emerald-500' },
              { id: 'credit_card', icon: 'credit_card', label: 'Cartão', color: 'bg-purple-500' },
              { id: 'transfer', icon: 'sync_alt', label: 'Transf.', color: 'bg-amber-500' },
            ].map((item, i) => (
              <button
                key={item.id}
                onClick={() => {
                  setTransactionForm({ isOpen: true, type: item.id as any });
                  setIsFanOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${item.color} animate-slideUp`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="material-symbols-rounded text-xl">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Floating Action Button */}
        <button
          id="fab-add"
          onClick={() => {
            if (isFanOpen) {
              setTransactionForm({ isOpen: true, type: 'expense' });
              setIsFanOpen(false);
            } else {
              setIsFanOpen(true);
            }
          }}
          className={`pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 active:scale-90 ${
            isFanOpen ? 'bg-rose-500 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <span className="material-symbols-rounded text-3xl text-white">
            {isFanOpen ? 'close' : 'add'}
          </span>
        </button>

        {transactionForm.isOpen && (
          <TransactionFormScreen
            isOpen={transactionForm.isOpen}
            onClose={() => setTransactionForm({ isOpen: false })}
            onSave={(data) => {
              // Convert TransactionForm data to AddTransactionModal format
              const mapping: any = {
                expense: { categoryId: 'additionalVariableCosts', subCategoryId: 'mainVar', paymentMethod: 'debit' },
                income: { categoryId: 'payslipIncome', subCategoryId: 'pedroIncome', paymentMethod: 'debit' },
                credit_card: { categoryId: 'additionalVariableCosts', subCategoryId: 'mainVar', paymentMethod: 'credit' },
                transfer: { categoryId: 'additionalVariableCosts', subCategoryId: 'mainVar', paymentMethod: 'debit' },
              };
              const config = mapping[data.type] || mapping.expense;
              handleAddTransaction({
                ...data,
                ...config,
                date: new Date(data.date),
                installments: data.installments || 1
              });
              setTransactionForm({ isOpen: false });
            }}
            initialType={transactionForm.type as any}
            accounts={currentData.accounts || []}
            creditCards={currentData.cards || []}
          />
        )}

        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
