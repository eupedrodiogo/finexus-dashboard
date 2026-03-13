import { Category, FinancialData } from './types';

export const calculateTotal = (category: Category): number => {
  if (!category || !category.subCategories) return 0;
  return category.subCategories.reduce((subTotal, subCat) =>
    subTotal + subCat.items.reduce((itemTotal, item) => itemTotal + item.value, 0), 0);
};

export const calculateRealTotal = (category: Category): number => {
  if (!category || !category.subCategories) return 0;
  return category.subCategories.reduce((subTotal, subCat) =>
    subTotal + subCat.items.reduce((itemTotal, item) => itemTotal + (item.isPaid ? item.value : 0), 0), 0);
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

export const generateCSV = (allData: { [key: string]: FinancialData }): string => {
  const headers = ['Mês', 'Grupo', 'Categoria', 'Item', 'Valor', 'Recorrente?'].join(',');
  const rows: string[] = [];

  Object.entries(allData).forEach(([monthKey, data]) => {
    // Process each category group
    const groups: { [key: string]: Category } = {
      'Receitas': data.payslipIncome,
      'Deduções': data.payslipDeductions,
      'Despesas Básicas': data.basicExpenses,
      'Custos Variáveis': data.additionalVariableCosts,
      'Investimentos': data.investments
    };

    Object.entries(groups).forEach(([groupName, category]) => {
      category.subCategories.forEach(subCat => {
        subCat.items.forEach(item => {
          const row = [
            monthKey,
            groupName,
            category.title,
            subCat.name, // SubCategory is sometimes used as item group
            item.name.replace(/,/g, ' '), // Escape commas
            item.value.toFixed(2),
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
      sub.items.forEach((item) => {
        if (item.accountId === account.id) {
          if (isIncome) {
            balance += item.value;
          } else {
            balance -= item.value;
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
