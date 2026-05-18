import { Category, FinancialData } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const calculateTotal = (category: Category): number => {
  if (!category || !category.subCategories) return 0;
  return category.subCategories.reduce((subTotal, subCat) => {
    const items = subCat.items || [];
    return subTotal + items.reduce((itemTotal, item) => itemTotal + (item.isIgnored ? 0 : (item.value || 0)), 0);
  }, 0);
};

export const calculateRealTotal = (category: Category): number => {
  if (!category || !category.subCategories) return 0;
  return category.subCategories.reduce((subTotal, subCat) => {
    const items = subCat.items || [];
    return subTotal + items.reduce((itemTotal, item) => itemTotal + (!item.isIgnored && item.isPaid ? (item.value || 0) : 0), 0);
  }, 0);
};

export const calculateMonthlyBalance = (data: FinancialData): number => {
  if (!data) return 0;
  const grossIncome = calculateTotal(data.payslipIncome);
  const deductions = calculateTotal(data.payslipDeductions);
  const netIncome = grossIncome - deductions;
  const basicExpenses = calculateTotal(data.basicExpenses);
  const additionalVariableCosts = calculateTotal(data.additionalVariableCosts);
  const investments = calculateTotal(data.investments);
  const totalExpenses = basicExpenses + additionalVariableCosts;

  return netIncome - totalExpenses - investments;
};

export const calculateRealMonthlyBalance = (data: FinancialData): number => {
  if (!data) return 0;
  const realGrossIncome = calculateRealTotal(data.payslipIncome);
  const realDeductions = calculateRealTotal(data.payslipDeductions);
  const realNetIncome = realGrossIncome - realDeductions;
  const realBasicExpenses = calculateRealTotal(data.basicExpenses);
  const realVars = calculateRealTotal(data.additionalVariableCosts);
  const realInvest = calculateRealTotal(data.investments);
  const realTotalExpenses = realBasicExpenses + realVars;

  return realNetIncome - realTotalExpenses - realInvest;
};

export const generateCSV = (allData: { [key: string]: FinancialData }): string => {
  const headers = ['Mês', 'Grupo', 'Categoria', 'Item', 'Valor', 'Recorrente?'].join(',');
  const rows: string[] = [];

  Object.entries(allData).forEach(([monthKey, data]) => {
    // Process each category group
    const groups: { [key: string]: Category } = {
      'Receitas': data.payslipIncome,
      'Deduções': data.payslipDeductions,
      'Despesas Básicas': data.basicExpenses,
      'Despesas Variáveis': data.additionalVariableCosts,
      'Investimentos': data.investments
    };

    Object.entries(groups).forEach(([groupName, category]) => {
      if (!category?.subCategories) return;
      category.subCategories.forEach(subCat => {
        if (!subCat?.items) return;
        subCat.items.forEach(item => {
          const row = [
            monthKey,
            groupName,
            category.title || '',
            subCat.name || '', 
            (item.name || '').replace(/,/g, ' '), 
            (item.value || 0).toFixed(2),
            item.isRecurring ? 'Sim' : 'Não'
          ].join(',');
          rows.push(row);
        });
      });
    });
  });

  return [headers, ...rows].join('\n');
};

export const calculateAccountBalance = (account: import('./types').Account, data: FinancialData): number => {
  let balance = account.initialBalance || 0;

  const processItems = (category: Category | undefined, isIncome: boolean) => {
    if (!category || !category.subCategories) return;
    category.subCategories.forEach((sub) => {
      if (!sub?.items) return;
      sub.items.forEach((item) => {
        // Only count items that are linked to this account AND marked as paid AND NOT ignored
        if (item.accountId === account.id && item.isPaid && !item.isIgnored) {
          if (isIncome) {
            balance += (item.value || 0);
          } else {
            balance -= (item.value || 0);
          }
        }
      });
    });
  };

  processItems(data.payslipIncome, true);
  processItems(data.payslipDeductions, false);
  processItems(data.basicExpenses, false);
  processItems(data.investments, false);
  processItems(data.additionalVariableCosts, false);

  return balance;
};

export const getOwnerLabel = (key: string, isPedro: boolean = true) => {
  if (key === 'pedro') return isPedro ? 'Pedro' : 'Membro 1';
  if (key === 'izabel') return isPedro ? 'Izabel' : 'Membro 2';
  return 'Conjunta';
};

export const getAnonymizedLabel = (label: string, isPedro: boolean) => {
  if (isPedro) return label;
  const lower = label.toLowerCase();
  if (lower === 'pedro') return 'Membro 1';
  if (lower === 'izabel') return 'Membro 2';
  if (lower.includes('joão vitor') || lower.includes('joao vitor')) return 'Dependente';
  if (lower.includes('pedro') && lower.includes('izabel')) return 'Família';
  return label;
};
