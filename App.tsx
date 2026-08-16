import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Wallet, Activity, ArrowUpRight, TrendingUp, MinusCircle, Zap } from 'lucide-react';
import { FinancialData, Goal, ToastMessage, LineItem } from './types';
import { Dashboard } from './components/Dashboard';
import { MonthlyView } from './components/MonthlyView';
import { PlannerView } from './components/PlannerView';
import { AnnualSummary } from './components/AnnualSummary';
import { SmartAdvisor } from './components/SmartAdvisor';
import { InvestmentSimulator } from './components/InvestmentSimulator';
import { Sidebar } from './components/Sidebar';
import { MasterPlan } from './components/MasterPlan';
import { GoalsModal } from './components/GoalsModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastContainer } from './components/Toast';
import { calculateTotal, calculateRealTotal, calculateAccountBalance, calculateMonthlyBalance, TRANSFER_IN, TRANSFER_OUT, TRANSFER_SUB_NAME } from './utils';
import { useAuth } from './contexts/AuthContext';
import { saveUserData, getUserData, subscribeToUserData } from './services/firebaseService';
import { InvestmentAdvisor } from './components/InvestmentAdvisor';
import { MonthNavigator } from './components/MonthNavigator';
import { CreditCardsView } from './components/CreditCardsView';
import { AccountsView } from './components/AccountsView';
import { AddTransactionModal, NewTransactionData, TransactionType } from './components/AddTransactionModal';
import { MobileNavigation, ACTION_ITEMS, ALL_BAR_ITEMS, DEFAULT_BAR_ORDER, BAR_ORDER_STORAGE_KEY } from './components/MobileNavigation';
import { OnboardingModal } from './components/OnboardingModal';
import { InterfaceTour, TourStep } from './components/InterfaceTour';
import { RecurringDeleteModal, RecurringDeletePayload } from './components/RecurringDeleteModal';
import { ImportModal } from './components/ImportModal';

// Restored Components
import { CompactKPIBar } from './components/CompactKPIBar';
import { PlannerHeaderCards } from './components/PlannerHeaderCards';
import { PlannerTabs } from './components/PlannerTabs';
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
        id: 'geralIncome', name: 'Geral', items: []
      }
    ]
  },
  payslipDeductions: {
    id: 'payslipDeductions',
    title: 'DEDUÇÕES',
    headerColor: 'bg-rose-600',
    subCategories: [
      {
        id: 'geralDeductions', name: 'Geral', items: []
      }
    ]
  },
  basicExpenses: {
    id: 'basicExpenses',
    title: 'DESPESA BÁSICA',
    headerColor: 'bg-slate-700',
    budget: 0,
    subCategories: [
      {
        id: 'mainBasic', name: 'Essenciais', items: []
      }
    ]
  },
  investments: {
    id: 'investments',
    title: 'INVESTIMENTOS',
    headerColor: 'bg-emerald-600',
    subCategories: [
      {
        id: 'mainInvest', name: 'Aportes', items: []
      }
    ]
  },
  additionalVariableCosts: {
    id: 'additionalVariableCosts',
    title: 'GASTOS VARIÁVEIS',
    headerColor: 'bg-purple-600',
    subCategories: [
      {
        id: 'mainVar', name: 'Cartão / Outros', items: []
      }
    ]
  },
  cards: [],
  accounts: [],
  joaoVitorReserve: 0,
  joaoVitorTarget: 0
};

const initialGoals: Goal[] = [];

// FAB do desktop: Despesa é o lançamento mais comum, então o botão principal
// já a representa no hover (clique direto, sem precisar abrir o menu). Ela
// também aparece como a ÚLTIMA linha do dropdown — mesma posição em que já
// está, perto do botão — para não ficar solta, desconectada da caixa.
const FAB_EXPENSE_ITEM = ACTION_ITEMS.find(i => i.type === 'expense')!;
const FAB_OTHER_ITEMS  = ACTION_ITEMS.filter(i => i.type !== 'expense');
const FAB_MENU_ITEMS   = [...FAB_OTHER_ITEMS, FAB_EXPENSE_ITEM];



export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'dashboard' | 'monthly' | 'annual' | 'advisor' | 'simulator' | 'cards' | 'accounts' | 'masterplan' | 'planner'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('currentView') as any) || 'dashboard';
    }
    return 'dashboard';
  });
  const [activeTab, setActiveTab] = useState<'payslip' | 'expenses' | 'investments'>('payslip');

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [simulatorInitialValues, setSimulatorInitialValues] = useState<{ monthly?: number, initial?: number } | null>(null);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [transactionForm, setTransactionForm] = useState<{ isOpen: boolean, type?: TransactionType }>({ isOpen: false });
  const [isFanOpen, setIsFanOpen] = useState(false);

  // Scroll handler for Executive Header is now tracked directly via main element's onScroll

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

      return localStorage.getItem('prosperaNexusUserName') || 'PRIMEIRO ACESSO';
    }
    return 'PRIMEIRO ACESSO';
  });

  useEffect(() => {
    localStorage.setItem('prosperaNexusUserName', userName);
  }, [userName]);

  // Personalização da barra inferior (mobile): quais atalhos aparecem e em que ordem.
  // Ids inválidos (de uma versão antiga de ALL_BAR_ITEMS) são descartados na leitura.
  const [barOrder, setBarOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BAR_ORDER_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const validIds = new Set(ALL_BAR_ITEMS.map(i => i.id));
            const filtered = parsed.filter((id: string) => validIds.has(id));
            if (filtered.length > 0) return filtered;
          }
        } catch (e) {
          console.error('Failed to parse bar order', e);
        }
      }
    }
    return DEFAULT_BAR_ORDER;
  });

  useEffect(() => {
    localStorage.setItem(BAR_ORDER_STORAGE_KEY, JSON.stringify(barOrder));
  }, [barOrder]);

  // Tamanho de fonte do app inteiro. A tipografia aqui é toda em px fixo (Tailwind
  // arbitrary values, ex: text-[9px]), não em rem — então mudar o font-size da raiz
  // não teria efeito nela. `zoom` escala tudo (fonte, ícones, espaçamentos) de uma vez,
  // do mesmo jeito que o zoom nativo do navegador, sem precisar reescrever cada
  // componente pra uma escala relativa.
  const FONT_SCALE_VALUES = { small: 0.9, medium: 1, large: 1.15 } as const;
  const [fontScale, setFontScale] = useState<keyof typeof FONT_SCALE_VALUES>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('prosperaNexusFontScale');
      if (saved === 'small' || saved === 'medium' || saved === 'large') return saved;
    }
    return 'medium';
  });
  useEffect(() => {
    localStorage.setItem('prosperaNexusFontScale', fontScale);
  }, [fontScale]);

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

  // Formato canônico da chave de mês: 'YYYY-MM'.
  // Versões anteriores gravavam 'YYYY -MM ' (com espaços), o que nunca batia com as
  // chaves montadas sem espaço em AnnualSummary e CreditCardsView.
  const stripSpaces = (value: string) => value.replace(/\s/g, '');

  const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  // Helper to get previous month key for carry-over logic
  const getPreviousMonthKey = (date: Date) => {
    const prevDate = new Date(date);
    prevDate.setMonth(date.getMonth() - 1);
    return getMonthKey(prevDate);
  };

  const currentMonthKey = getMonthKey(currentDate);

  // Datas de item gravadas a partir da chave antiga herdaram os espaços ('2026 -08 -01')
  const normalizeMonthData = (monthData: any) => {
    if (!monthData) return monthData;
    ['payslipIncome', 'payslipDeductions', 'basicExpenses', 'additionalVariableCosts', 'investments'].forEach(catKey => {
      monthData[catKey]?.subCategories?.forEach((sub: any) => {
        sub.items?.forEach((item: any) => {
          if (typeof item.date === 'string' && /\s/.test(item.date)) {
            item.date = stripSpaces(item.date);
          }
        });
      });
    });
    return monthData;
  };

  const normalizeAllData = (data: any) => {
    if (!data) return {};
    const normalized: any = {};
    Object.keys(data).forEach(key => {
      // Aceita o formato atual ('YYYY-MM') e o legado ('YYYY -MM ')
      if (!key.match(/^\d{4}\s*-\s*\d{2}/)) return;
      const cleanKey = stripSpaces(key);
      // Se as duas variantes coexistirem, a já normalizada tem prioridade
      if (normalized[cleanKey] && key !== cleanKey) return;
      normalized[cleanKey] = normalizeMonthData(data[key]);
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
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState(false);
  const sessionId = useMemo(() => Math.random().toString(36).substring(2, 15), []);
  const isUpdatingFromCloudRef = useRef(false);

  // Save AllData Effect
  useEffect(() => {
    localStorage.setItem('prosperaNexusAllData', JSON.stringify(allData));

    // Auto-save to Cloud if logged in and has loaded initial data
    if (user && hasLoadedFromCloud) {
      if (isUpdatingFromCloudRef.current) {
        // This render was triggered by a cloud update. Don't echo it back!
        isUpdatingFromCloudRef.current = false;
        return;
      }

      const timeoutId = setTimeout(() => {
        saveUserData(user.uid, { allData, goals, userName, lastWriter: sessionId })
          .catch((err) => {
            console.error('Falha ao salvar na nuvem:', err);
            showToast('Falha ao sincronizar com a nuvem. Verifique sua conexão.', 'error');
          });
      }, 2000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [allData, goals, userName, user, hasLoadedFromCloud, sessionId]);

  // Cloud Sync Logic (Extracted for reuse)
  const syncFromCloud = async (isManual = false) => {
    if (!user) return;

    if (isManual) showToast('Iniciando sincronização forçada...', 'info');

    try {
      const cloudData: any = await getUserData(user.uid);

      if (cloudData) {
        // We found data in the cloud! Update local state.
        isUpdatingFromCloudRef.current = true;
        if (cloudData.allData) setAllData(normalizeAllData(cloudData.allData));
        if (cloudData.goals) setGoals(cloudData.goals);
        if (cloudData.userName) setUserName(cloudData.userName);
        if (isManual) showToast('Dados atualizados da nuvem!', 'success');
      } else {
        // No cloud data found.
        if (isManual) {
          await saveUserData(user.uid, { allData, goals, userName, lastWriter: sessionId });
          showToast('Nuvem estava vazia. Backup local enviado!', 'success');
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      showToast('Erro ao sincronizar. Tente novamente.', 'error');
    } finally {
      setHasLoadedFromCloud(true);
    }
  };

  // Real-time Cloud Sync Effect (replaces Initial Cloud Sync)
  useEffect(() => {
    if (!user) return;

    let isFirstLoad = true;

    const unsubscribe = subscribeToUserData(user.uid, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        
        // Ignore echoes of our own local writes to prevent overwriting ongoing typing!
        if (cloudData.lastWriter === sessionId) {
          if (isFirstLoad) {
            setHasLoadedFromCloud(true);
            isFirstLoad = false;
          }
          return;
        }

        // It's from another device or first load. Update state!
        isUpdatingFromCloudRef.current = true;
        if (cloudData.allData) setAllData(normalizeAllData(cloudData.allData));
        if (cloudData.goals) setGoals(cloudData.goals);
        if (cloudData.userName) setUserName(cloudData.userName);
        
        if (isFirstLoad) {
          showToast('Dados sincronizados!', 'success');
          isFirstLoad = false;
        } else {
          showToast('Atualizado de outro dispositivo!', 'info');
        }
      } else {
        if (isFirstLoad) {
          isFirstLoad = false;
        }
      }
      setHasLoadedFromCloud(true);
    });

    return () => unsubscribe();
  }, [user, sessionId]);

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

  // Ao propagar, o item mantém o dia do mês original (vencimento do cartão, dia do
  // aluguel...), limitado ao último dia do mês de destino — dia 31 vira 30 em novembro.
  const shiftDateToMonth = (isoDate: string | undefined, monthKey: string) => {
    if (!isoDate || typeof isoDate !== 'string') return isoDate;
    const day = Number(isoDate.split('-')[2]);
    const [year, month] = monthKey.split('-').map(Number);
    if (!day || !year || !month) return `${monthKey}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    return `${monthKey}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
  };

  const monthsBetween = (fromMonthKey: string, toMonthKey: string) => {
    const [fromYear, fromMonth] = fromMonthKey.split('-').map(Number);
    const [toYear, toMonth] = toMonthKey.split('-').map(Number);
    return (toYear - fromYear) * 12 + (toMonth - fromMonth);
  };

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
        const cat = currentMonth[catKey as keyof FinancialData] as any;
        if (cat?.subCategories) {
          cat.subCategories.forEach((sub: any) => {
            sub.items.forEach((item: any) => {
              if (item.isRecurring) {
                const nextCat = nextMonth[catKey as keyof FinancialData];
                const nextSub = nextCat?.subCategories?.find((s: any) => s.id === sub.id);
                if (nextSub) {
                  const exists = nextSub.items.find((ni: any) => ni.id === item.id);
                  if (!exists) {
                    // Âncora da recorrência: fica gravada na cópia para o limite de
                    // meses contar sempre a partir do lançamento original, e não
                    // reiniciar a cada mês propagado.
                    const anchor: string | undefined = item.recurrenceStart || item.date;
                    if (item.recurrenceLimit && anchor &&
                        monthsBetween(anchor.slice(0, 7), nextKey) >= item.recurrenceLimit) {
                      return; // recorrência já cumpriu o número de meses contratado
                    }

                    nextSub.items.push({
                      ...item,
                      isPaid: false,
                      // O dia vem da âncora, não da cópia anterior: um vencimento
                      // dia 31 volta a ser 31 em dezembro depois de virar 30 em novembro.
                      date: shiftDateToMonth(anchor || item.date, nextKey),
                      recurrenceStart: anchor,
                    });
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
          paymentMethod: item.accountId ? 'debit' : undefined, // Default to debit/cash if account is linked
          date: item.data || undefined, // Data do documento (nota/recibo/contracheque)
          isPaid: item.isPaid === true ? true : undefined // Comprovante de pagamento já entra quitado
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

  // Handle SubCategory Management
  const handleAddSubCategory = (categoryId: string, name: string) => {
    const newAllData = JSON.parse(JSON.stringify(allData));
    const newId = `sub-${Date.now()}`;
    const newSubCategory = { id: newId, name, items: [] };

    // Update in all months
    Object.keys(newAllData).forEach(monthKey => {
      const cat = newAllData[monthKey][categoryId as keyof FinancialData];
      if (cat && (cat as any).subCategories) {
        (cat as any).subCategories.push(JSON.parse(JSON.stringify(newSubCategory)));
      }
    });

    setAllData(newAllData);
    showToast('Categoria adicionada com sucesso!', 'success');
  };

  const handleEditSubCategory = (categoryId: string, subId: string, newName: string) => {
    const newAllData = JSON.parse(JSON.stringify(allData));

    Object.keys(newAllData).forEach(monthKey => {
      const cat = newAllData[monthKey][categoryId as keyof FinancialData];
      if (cat && (cat as any).subCategories) {
        const sub = (cat as any).subCategories.find((s: any) => s.id === subId);
        if (sub) {
          sub.name = newName;
        }
      }
    });

    setAllData(newAllData);
    showToast('Categoria renomeada!', 'success');
  };

  const handleDeleteSubCategory = (categoryId: string, subId: string) => {
    const newAllData = JSON.parse(JSON.stringify(allData));

    Object.keys(newAllData).forEach(monthKey => {
      const cat = newAllData[monthKey][categoryId as keyof FinancialData];
      if (cat && (cat as any).subCategories) {
        const subIndex = (cat as any).subCategories.findIndex((s: any) => s.id === subId);
        if (subIndex > -1) {
          const itemsToMove = (cat as any).subCategories[subIndex].items || [];
          (cat as any).subCategories.splice(subIndex, 1);
          
          if (itemsToMove.length > 0) {
            // Move items to the first available subcategory or create a 'Geral' one
            if ((cat as any).subCategories.length === 0) {
              (cat as any).subCategories.push({ id: `geral-${Date.now()}`, name: 'Geral', items: [] });
            }
            (cat as any).subCategories[0].items.push(...itemsToMove);
          }
        }
      }
    });

    setAllData(newAllData);
    showToast('Categoria excluída.', 'success');
  };

  // NEW FUNCTION: Handle Add Transaction
  const handleAddTransaction = (tx: NewTransactionData) => {
    const newAllData = JSON.parse(JSON.stringify(allData)); // Deep clone to be safe
    let toastMessage = 'Transação adicionada!';
    // Mês a partir do qual a recorrência é propagada para o futuro
    let propagateFromKey = '';

    const toISO = (d: Date) => d.toISOString().split('T')[0];

    const addLineItem = (
      targetKey: string,
      categoryId: string,
      subId: string,
      item: Partial<LineItem>,
      fallbackSubName?: string
    ) => {
      // Ensure month exists
      if (!newAllData[targetKey]) {
        // Clone structure from initialData if missing
        newAllData[targetKey] = JSON.parse(JSON.stringify(initialData));
      }

      const category = newAllData[targetKey][categoryId as keyof FinancialData];
      if (!category) return; // Should not happen

      // Meses futuros criados a partir do template podem não ter a subcategoria
      // escolhida (ex.: parcela que cai lá na frente). Antes o item era descartado
      // em silêncio; agora a subcategoria é recriada com o mesmo id.
      let subCategory = category.subCategories.find((s: any) => s.id === subId);
      if (!subCategory) {
        const sourceName = (currentData[categoryId as keyof FinancialData] as any)
          ?.subCategories?.find((s: any) => s.id === subId)?.name;
        subCategory = { id: subId, name: fallbackSubName || sourceName || 'Geral', items: [] };
        category.subCategories.push(subCategory);
      }

      subCategory.items.push({
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        value: 0, // Fallback
        ...item,
      } as LineItem);
    };

    // --- TRANSFERÊNCIA ENTRE CONTAS ---------------------------------------
    // Gera duas pernas com o mesmo transferId: saída na conta de origem e
    // entrada na conta de destino. Ambas ficam marcadas com isTransfer, então
    // movem o saldo das contas sem virar receita/despesa do mês.
    if (tx.transactionType === 'transfer') {
      if (!tx.accountId || !tx.toAccountId || tx.accountId === tx.toAccountId) {
        showToast('Selecione contas de origem e destino diferentes.', 'error');
        return;
      }

      const accountsList = currentData.accounts || [];
      const fromAccount = accountsList.find(a => a.id === tx.accountId);
      const toAccount = accountsList.find(a => a.id === tx.toAccountId);
      const targetKey = getMonthKey(tx.date);
      const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const leg: Partial<LineItem> = {
        value: tx.amount,
        date: toISO(tx.date),
        paymentMethod: tx.paymentMethod,
        isTransfer: true,
        transferId,
        isPaid: tx.isPaid !== undefined ? tx.isPaid : true,
        isRecurring: tx.isRecurring || false,
        recurrenceLimit: tx.recurrenceLimit,
        recurrenceStart: tx.isRecurring ? toISO(tx.date) : undefined,
      };

      addLineItem(targetKey, TRANSFER_OUT.categoryId, TRANSFER_OUT.subId, {
        ...leg,
        name: `${tx.description} → ${toAccount?.name || 'Destino'}`,
        accountId: tx.accountId,
      }, TRANSFER_SUB_NAME);

      addLineItem(targetKey, TRANSFER_IN.categoryId, TRANSFER_IN.subId, {
        ...leg,
        name: `${tx.description} ← ${fromAccount?.name || 'Origem'}`,
        accountId: tx.toAccountId,
      }, TRANSFER_SUB_NAME);

      toastMessage = `Transferência de ${fromAccount?.name || 'origem'} para ${toAccount?.name || 'destino'} registrada!`;
      propagateFromKey = targetKey;

    // --- CARTÃO DE CRÉDITO -------------------------------------------------
    } else if (tx.paymentMethod === 'credit' && tx.cardId && tx.installments) {
      const card = (newAllData[currentMonthKey]?.cards || currentData.cards || [])
        .find((c: any) => c.id === tx.cardId);

      if (!card) {
        showToast('Erro: Cartão não encontrado.', 'error');
        return;
      }

      const purchaseDate = new Date(tx.date);
      // Logic to find First Due Month
      // If purchase day >= closingDay, it goes to next month relative to purchase date
      let refMonth = purchaseDate.getMonth();
      const refYear = purchaseDate.getFullYear();

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

      // Vencimento no dia do cartão, sem estourar o mês (dia 31 em mês de 30 dias
      // viraria o dia 1º do mês seguinte e jogaria a parcela na fatura errada).
      const dueDateFor = (offset: number) => {
        const lastDay = new Date(refYear, refMonth + offset + 1, 0).getDate();
        return new Date(refYear, refMonth + offset, Math.min(card.dueDay, lastDay));
      };

      const isSubscription = tx.installments === 1 && !!tx.isRecurring;

      for (let i = 0; i < tx.installments; i++) {
        const installmentDate = dueDateFor(i);
        const targetKey = getMonthKey(installmentDate);
        const label = tx.installments > 1 ? `${tx.description} (${i + 1}/${tx.installments})` : tx.description;

        addLineItem(targetKey, tx.categoryId, tx.subCategoryId, {
          name: label,
          value: tx.amount / tx.installments,
          paymentMethod: 'credit',
          cardId: tx.cardId,
          installments: { current: i + 1, total: tx.installments },
          date: toISO(installmentDate), // Persist installment date
          isPaid: tx.isPaid || false,
          isIgnored: tx.isIgnored || false,
          // Parcelamento já ocupa os meses futuros; só compra à vista recorrente
          // (assinatura no cartão) precisa ser propagada.
          isRecurring: isSubscription,
          recurrenceLimit: isSubscription ? tx.recurrenceLimit : undefined,
          recurrenceStart: isSubscription ? toISO(installmentDate) : undefined,
        });

        if (i === 0) propagateFromKey = targetKey;
      }
      toastMessage = tx.installments > 1
        ? `Compra lançada em ${tx.installments}x no ${card.name}!`
        : `Compra lançada no ${card.name}!`;

    // --- DÉBITO / PIX / DINHEIRO ------------------------------------------
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
        date: toISO(tx.date), // Persist transaction date
        isRecurring: tx.isRecurring || false,
        isPaid: tx.isPaid !== undefined ? tx.isPaid : false,
        isIgnored: tx.isIgnored || false,
        recurrenceLimit: tx.recurrenceLimit,
        recurrenceStart: tx.isRecurring ? toISO(tx.date) : undefined
      });
      propagateFromKey = targetViewKey;
    }

    if (propagateFromKey && newAllData[propagateFromKey]) {
      setAllData(propagateRecurringItemsToFuture(newAllData[propagateFromKey], propagateFromKey, newAllData));
    } else {
      setAllData(newAllData);
    }
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

  // --- Ações em Massa ---
  // `updates` aceita um objeto (aplicado a todos) ou uma função (calculado por item,
  // usado por reajustes percentuais que dependem do valor atual de cada item).
  const bulkUpdateItems = (
    categoryId: keyof FinancialData,
    subCategoryId: string,
    itemIds: string[],
    updates: Partial<LineItem> | ((item: LineItem) => Partial<LineItem>)
  ) => {
    if (!itemIds || itemIds.length === 0) return;
    const category = currentData[categoryId] as any;
    if (!category?.subCategories) return;

    const ids = new Set(itemIds);
    const newSubCategories = category.subCategories.map((sub: any) => {
      if (sub.id !== subCategoryId) return sub;
      return {
        ...sub,
        items: sub.items.map((item: LineItem) =>
          ids.has(item.id)
            ? { ...item, ...(typeof updates === 'function' ? updates(item) : updates) }
            : item
        )
      };
    });

    updateData({ ...currentData, [categoryId]: { ...category, subCategories: newSubCategories } });
  };

  const getSelectedItems = (categoryId: string, subCategoryId: string, itemIds: string[]): LineItem[] => {
    const category = currentData[categoryId as keyof FinancialData] as any;
    const sub = category?.subCategories?.find((s: any) => s.id === subCategoryId);
    if (!sub) return [];
    return sub.items.filter((i: LineItem) => itemIds.includes(i.id));
  };

  const handleBulkUpdate = (categoryId: string, subCategoryId: string, itemIds: string[], updates: any) => {
    if (!itemIds || itemIds.length === 0) return;
    bulkUpdateItems(categoryId as keyof FinancialData, subCategoryId, itemIds, updates);
    showToast(`${itemIds.length} ${itemIds.length === 1 ? 'item atualizado' : 'itens atualizados'}.`, 'success');
  };

  // Alterna: se todos já estão ignorados, volta a contabilizar; senão, ignora todos.
  const handleBulkIgnore = (categoryId: string, subCategoryId: string, itemIds: string[]) => {
    const selected = getSelectedItems(categoryId, subCategoryId, itemIds);
    if (selected.length === 0) return;

    const nextIgnored = !selected.every(i => i.isIgnored);
    bulkUpdateItems(categoryId as keyof FinancialData, subCategoryId, itemIds, { isIgnored: nextIgnored });
    showToast(
      nextIgnored
        ? `${selected.length} ${selected.length === 1 ? 'item ignorado' : 'itens ignorados'} nos cálculos.`
        : `${selected.length} ${selected.length === 1 ? 'item voltou' : 'itens voltaram'} a contar.`,
      'info'
    );
  };

  // --- Exclusão com alcance multi-mês ---
  // Itens recorrentes são propagados para os meses futuros mantendo o mesmo id,
  // então apagar só o mês atual deixava cópias órfãs adiante.
  const findAffectedMonths = (categoryId: string, subCategoryId: string, itemIds: string[]) => {
    const ids = new Set(itemIds);
    const months = new Set<string>();

    const hasAnyItem = (monthData: any) => {
      const sub = monthData?.[categoryId]?.subCategories?.find((s: any) => s.id === subCategoryId);
      return !!sub?.items?.some((i: LineItem) => ids.has(i.id));
    };

    // O mês atual pode ser derivado do anterior e ainda não existir em allData
    if (hasAnyItem(currentData)) months.add(currentMonthKey);
    Object.keys(allData).forEach(mk => { if (hasAnyItem(allData[mk])) months.add(mk); });

    return [...months].sort();
  };

  const applyDeleteAcrossMonths = (categoryId: string, subCategoryId: string, itemIds: string[], monthKeys: string[]) => {
    const ids = new Set(itemIds);

    const removeFrom = (monthData: FinancialData) => {
      const category = (monthData as any)[categoryId];
      if (!category?.subCategories) return monthData;
      const newSubCategories = category.subCategories.map((sub: any) =>
        sub.id === subCategoryId
          ? { ...sub, items: sub.items.filter((i: LineItem) => !ids.has(i.id)) }
          : sub
      );
      return { ...monthData, [categoryId]: { ...category, subCategories: newSubCategories } };
    };

    // Não passa por updateData de propósito: propagar aqui reinseriria o que acabou de sair.
    setAllData(prev => {
      const next = { ...prev };
      monthKeys.forEach(mk => {
        if (mk === currentMonthKey) {
          next[mk] = removeFrom(currentData) as FinancialData;
        } else if (next[mk]) {
          next[mk] = removeFrom(next[mk]) as FinancialData;
        }
      });
      return next;
    });
  };

  const [deleteRequest, setDeleteRequest] = useState<{
    categoryId: string;
    subCategoryId: string;
    itemIds: string[];
    itemName: string;
    itemDate?: string;
    affectedMonths: string[];
  } | null>(null);

  const requestDeleteItems = (categoryId: string, subCategoryId: string, itemIds: string[]) => {
    if (!itemIds || itemIds.length === 0) return;

    const affectedMonths = findAffectedMonths(categoryId, subCategoryId, itemIds);
    const otherMonths = affectedMonths.filter(m => m !== currentMonthKey);

    // Existe só no mês atual: nada a perguntar
    if (otherMonths.length === 0) {
      applyDeleteAcrossMonths(categoryId, subCategoryId, itemIds, [currentMonthKey]);
      showToast(`${itemIds.length} ${itemIds.length === 1 ? 'item excluído' : 'itens excluídos'}.`, 'success');
      return;
    }

    const sub = (currentData as any)[categoryId]?.subCategories?.find((s: any) => s.id === subCategoryId);
    const items = sub?.items?.filter((i: LineItem) => itemIds.includes(i.id)) || [];

    setDeleteRequest({
      categoryId,
      subCategoryId,
      itemIds,
      itemName: items.length === 1 ? items[0].name : `${itemIds.length} itens selecionados`,
      itemDate: items[0]?.date,
      affectedMonths
    });
  };

  const handleConfirmRecurringDelete = (payload: RecurringDeletePayload) => {
    if (!deleteRequest) return;
    const { categoryId, subCategoryId, itemIds, affectedMonths } = deleteRequest;

    let months: string[];
    if (payload.mode === 'single') {
      months = [currentMonthKey];
    } else if (payload.mode === 'from-here') {
      months = affectedMonths.filter(m => m >= currentMonthKey);
    } else {
      months = payload.selectedMonths || [];
    }

    if (months.length > 0) {
      applyDeleteAcrossMonths(categoryId, subCategoryId, itemIds, months);
      showToast(
        months.length === 1
          ? `${itemIds.length} ${itemIds.length === 1 ? 'item excluído' : 'itens excluídos'} deste mês.`
          : `Excluído de ${months.length} meses.`,
        'success'
      );
    }

    setDeleteRequest(null);
  };

  const handleBulkDeleteItem = (categoryId: string, subCategoryId: string, itemIds: string[]) => {
    requestDeleteItems(categoryId, subCategoryId, itemIds);
  };

  const handleSubCategoryNameChange = (categoryId: keyof FinancialData, subCategoryId: string, newName: string) => {
    const category = currentData[categoryId];
    const newSubCategories = category.subCategories.map(sub =>
      sub.id === subCategoryId ? { ...sub, name: newName } : sub
    );
    updateData({ ...currentData, [categoryId]: { ...category, subCategories: newSubCategories } });
  };

  const totals = useMemo(() => {
    const grossIncome = calculateTotal(currentData.payslipIncome);
    const deductions = calculateTotal(currentData.payslipDeductions);
    const netIncome = grossIncome - deductions;
    const basicExpenses = calculateTotal(currentData.basicExpenses);
    const additionalVariableCosts = calculateTotal(currentData.additionalVariableCosts);
    const investments = calculateTotal(currentData.investments);
    const totalExpenses = basicExpenses + additionalVariableCosts;

    // Real Calculations (isPaid === true) — calculateRealTotal descarta itens
    // ignorados e pernas de transferência, igual ao planejado acima.
    const realGrossIncome = calculateRealTotal(currentData.payslipIncome);
    const realDeductions = calculateRealTotal(currentData.payslipDeductions);
    const realBasicExpenses = calculateRealTotal(currentData.basicExpenses);
    const realVars = calculateRealTotal(currentData.additionalVariableCosts);
    const realInvest = calculateRealTotal(currentData.investments);
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
    const currentRealMonthKey = getMonthKey(new Date());
    const earliestSavedKey = sortedKeys.length > 0 ? sortedKeys[0] : null;
    const startKey = (earliestSavedKey && earliestSavedKey < currentRealMonthKey) ? earliestSavedKey : currentRealMonthKey;
    const debugSteps: string[] = [];

    if (startKey < currentMonthKey) {
      const [startYear, startMonth] = startKey.split('-').map(Number);
      const [targetYear, targetMonth] = currentMonthKey.split('-').map(Number);
      let iteratorDate = new Date(startYear, startMonth - 1, 2);
      const targetDate = new Date(targetYear, targetMonth - 1, 2);

      while (iteratorDate < targetDate) {
        const loopKey = getMonthKey(iteratorDate);
        const monthData = allData[loopKey] || initialData;
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
          accountsTotal={accountsTotal}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onPreviousMonth={() => handleMonthChange('prev')}
          onNextMonth={() => handleMonthChange('next')}
          userName={userName}
          isSyncing={!!user}
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
          handleDeleteItem={(cat: any, subId: any, itemId: any) => requestDeleteItems(cat, subId, [itemId])}
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
          currentMonth={currentMonthKey}
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
      case 'planner':
        return <PlannerView
          data={currentData}
          totals={totals}
          handleValueChange={updateItem}
          handleNameChange={(cat: any, sub: any, id: any, val: any) => updateItem(cat, sub, id, { name: val })}
          handleCategoryTitleChange={(cat: any, val: any) => updateData({ ...currentData, [cat]: { ...currentData[cat], title: val } })}
          handleBudgetChange={(cat: any, val: any) => updateData({ ...currentData, [cat]: { ...currentData[cat], budget: val } })}
          handleRateChange={(cat: any, sub: any, id: any, val: any) => updateItem(cat, sub, id, { annualRate: val })}
          handleAddItem={(cat, subId, newItemId?: string) => {
            const catData = currentData[cat as keyof FinancialData];
            const subCats = catData.subCategories.map(s => s.id === subId ? { ...s, items: [...s.items, { id: newItemId || `item-${Date.now()}`, name: 'Novo Item', value: 0 }] } : s);
            updateData({ ...currentData, [cat]: { ...catData, subCategories: subCats } });
          }}
          handleDeleteItem={(cat: any, subId: any, itemId: any) => requestDeleteItems(cat, subId, [itemId])}
          handleToggleRecurring={(cat: any, subId: any, itemId: any) => {
            const item = currentData[cat as keyof FinancialData].subCategories.find(s => s.id === subId)?.items.find(i => i.id === itemId);
            if (item) updateItem(cat as keyof FinancialData, subId, itemId, { isRecurring: !item.isRecurring });
          }}
          handleTogglePaid={(cat: any, subId: any, itemId: any) => {
            const item = currentData[cat as keyof FinancialData].subCategories.find(s => s.id === subId)?.items.find(i => i.id === itemId);
            if (item) updateItem(cat as keyof FinancialData, subId, itemId, { isPaid: !item.isPaid });
          }}
          handleToggleIgnored={(cat: any, subId: any, itemId: any) => {
            const item = currentData[cat as keyof FinancialData].subCategories.find(s => s.id === subId)?.items.find(i => i.id === itemId);
            if (item) updateItem(cat as keyof FinancialData, subId, itemId, { isIgnored: !item.isIgnored });
          }}
          handleBulkDeleteItem={handleBulkDeleteItem}
          handleBulkIgnore={handleBulkIgnore}
          handleBulkUpdate={handleBulkUpdate}
          itemToDelete={null}
          onConfirmDelete={() => { }}
          onCancelDelete={() => { }}
          handleSubCategoryNameChange={handleSubCategoryNameChange}
          handleDeleteSubCategory={handleDeleteSubCategory}
          onUpdateItem={updateItem}
          currentMonth={currentDate}
          onPreviousMonth={() => handleMonthChange('prev')}
          onNextMonth={() => handleMonthChange('next')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isScrolled={isScrolled}
          isPedro={userName !== 'Visitante' && userName.toLowerCase().includes('pedro')}
        />;
      case 'masterplan':
        return <MasterPlan isDarkMode={isDarkMode} />;
      default: return null;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500"
      style={{ zoom: FONT_SCALE_VALUES[fontScale] } as React.CSSProperties}
    >

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        id="sidebar-nav"
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shrink-0"
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
          userName={userName + " (v2.2)"}
        />
      </aside>

      {/* Main Content Area */}
      <main 
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 20)}
        className="flex-1 overflow-y-auto w-full transition-all duration-500 pb-24 md:pb-6"
      >
        <div className="max-w-[1600px] w-full p-4 md:p-10 transition-all duration-500">

          {currentView !== 'dashboard' && (
            <header 
              data-scrolled={isScrolled}
              className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-950 -mx-4 md:-mx-10 px-4 md:px-10 -mt-4 pt-4 md:-mt-10 md:pt-10 pb-4 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="transition-all duration-500 transform data-[scrolled=true]:scale-90 flex items-center gap-3">
                    <span className="md:hidden w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 shrink-0">
                      <span className="material-symbols-rounded text-[22px]">
                        {currentView === 'monthly' ? 'receipt_long' :
                          currentView === 'annual' ? 'bar_chart' :
                            currentView === 'cards' ? 'credit_card' :
                              currentView === 'accounts' ? 'account_balance' :
                                currentView === 'planner' ? 'insights' : 'apps'}
                      </span>
                    </span>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                        {currentView === 'monthly' ? 'Lançamentos' :
                          currentView === 'annual' ? 'Relatórios' :
                            currentView === 'cards' ? 'Cartões' :
                              currentView === 'accounts' ? 'Contas' :
                                currentView === 'planner' ? 'Estratégia' : ''}
                      </h1>
                      {currentView === 'planner' && (
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Planeje suas metas e acompanhe sua performance financeira
                        </p>
                      )}
                    </div>
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

              {/* Mobile Sticky KPI Bar REMOVED */}
              
              {/* Main KPI Grid - Sticky in Header for Planner View */}
              {currentView === 'planner' && (
                <div className={`mt-4 transition-all duration-500`}>
                    <PlannerHeaderCards totals={totals} isScrolled={isScrolled} />
                    <PlannerTabs activeTab={activeTab} setActiveTab={setActiveTab} isScrolled={isScrolled} />
                </div>
              )}
            </header>
          )}

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
        onOpenAddTransaction={(type) => setTransactionForm({ isOpen: true, type: type as TransactionType })}
        onOpenImport={() => setIsImportModalOpen(true)}
        barOrder={barOrder}
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
        barOrder={barOrder}
        onChangeBarOrder={setBarOrder}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
      />

      {/* Importação Inteligente — contracheque (entrada) ou nota/recibo (saída).
          Ponto único de entrada, acessado pelo menu do "+". */}
      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(data) => {
            handleSmartImport(data);
            setIsImportModalOpen(false);
          }}
          onFullRestore={({ allData: restoredData, goals: restoredGoals }) => {
            handleImportData(restoredData);
            if (restoredGoals) setGoals(restoredGoals);
            setIsImportModalOpen(false);
          }}
          accounts={currentData.accounts}
        />
      )}

      {transactionForm.isOpen && (
        <AddTransactionModal
          isOpen={transactionForm.isOpen}
          onClose={() => setTransactionForm({ isOpen: false })}
          initialType={transactionForm.type}
          currentData={currentData}
          allData={allData}
          onAddTransaction={handleAddTransaction}
          onAddSubCategory={handleAddSubCategory}
          onEditSubCategory={handleEditSubCategory}
          onDeleteSubCategory={handleDeleteSubCategory}
          onOpenImport={() => {
            setTransactionForm({ isOpen: false });
            setIsImportModalOpen(true);
          }}
        />
      )}

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

      <RecurringDeleteModal
        isOpen={!!deleteRequest}
        onClose={() => setDeleteRequest(null)}
        onConfirm={handleConfirmRecurringDelete}
        itemName={deleteRequest?.itemName || ''}
        itemDate={deleteRequest?.itemDate}
        affectedMonths={deleteRequest?.affectedMonths || []}
        currentMonthKey={currentMonthKey}
      />

      {/* No celular quem lança é o botão + da barra inferior, então o FAB fica oculto.
          No desktop a barra inferior não existe (md:hidden) — sem o FAB não sobraria
          nenhuma porta de entrada para o formulário de lançamento.
          Cores e ícones vêm de ACTION_ITEMS — o mesmo menu "Nova Transação" do
          celular — para os dois tamanhos de tela falarem a mesma língua visual.
          Só existe UM elemento por vez neste canto: o "+" OU a caixa, nunca os
          dois ao mesmo tempo. Como os dois são ancorados no mesmo bottom-6/
          right-6, a caixa (mais alta) cresce ocupando exatamente o espaço que
          o botão ocultado deixou — sem gap, sem zona morta de hover, porque
          não há mais dois elementos disputando espaço, só uma troca de forma. */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[40] flex-col items-end gap-3">
        <div onMouseEnter={() => setIsFanOpen(true)} onMouseLeave={() => setIsFanOpen(false)}>
          {isFanOpen ? (
            <div className="w-48 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl animate-slideInCol">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Nova Transação</p>
              </div>
              <div className="py-1.5">
                {FAB_MENU_ITEMS.map(item => (
                  <button
                    key={item.type}
                    onClick={() => {
                      setTransactionForm({ isOpen: true, type: item.type as TransactionType });
                      setIsFanOpen(false);
                    }}
                    // Despesa fecha a lista com uma linha separadora — essa
                    // última linha ocupa o canto onde o "+" ficava em repouso.
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                      item.type === 'expense' ? 'border-t border-slate-100 dark:border-white/5 mt-1.5 pt-2.5' : ''
                    }`}
                  >
                    {/* Mesmo tratamento "duotone" do card de "Nova Transação" no
                        celular (fundo translúcido + borda + sombra na cor do
                        tipo) — agora que tudo mora dentro de uma caixa opaca,
                        dá pra copiar o estilo do mobile sem risco de contraste. */}
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2"
                      style={{
                        backgroundColor: item.bg,
                        borderColor: item.border,
                        color: item.color,
                        boxShadow: `0 6px 14px -4px ${item.shadow}`,
                      }}
                    >
                      <span className="material-symbols-rounded text-[20px] icon-filled">{item.icon}</span>
                    </span>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                  </button>
                ))}

                {/* Importar Extrato — ação de lote, separada dos lançamentos unitários acima */}
                <button
                  onClick={() => {
                    setIsImportModalOpen(true);
                    setIsFanOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 border-t border-slate-100 dark:border-white/5 mt-1.5 pt-2.5"
                >
                  <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-rounded text-[20px]">upload_file</span>
                  </span>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Importar Extrato</span>
                </button>
              </div>
            </div>
          ) : (
            // Repouso: só o "+" (gradiente índigo→roxo, igual ao FAB central do
            // celular). Some inteiro assim que o hover troca para a caixa acima
            // — não fica um segundo elemento por baixo disputando o mesmo canto.
            <button
              id="fab-add"
              onClick={() => {
                setTransactionForm({ isOpen: true, type: 'expense' });
                setIsFanOpen(false);
              }}
              aria-label="Nova despesa — passe o mouse para ver os outros tipos"
              className="pointer-events-auto relative w-16 h-16 rounded-[26px] flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow: '0 10px 30px rgba(99,102,241,0.5)',
              }}
            >
              <span
                className="absolute inset-0 rounded-[26px] animate-ping opacity-[0.18]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              />
              <span className="material-symbols-rounded relative z-10 text-[30px] text-white">add</span>
            </button>
          )}
        </div>

        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
}
