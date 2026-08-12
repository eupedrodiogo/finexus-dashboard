import { useMemo } from 'react';
import { FinancialData, LineItem } from '../types';
import { TRANSFER_SUB_IDS } from '../utils';

/**
 * Memória de lançamentos: um índice montado a partir do histórico já existente
 * em `allData` — nada é gravado a mais. Serve para três coisas no formulário:
 *
 *   1. sugerir a descrição enquanto se digita, já trazendo valor, categoria,
 *      conta/cartão e método do último lançamento igual;
 *   2. escolher a categoria sozinha (o que você fez da última vez ganha; sem
 *      histórico, cai nas regras por palavra-chave);
 *   3. montar os atalhos de lançamento rápido (o que mais se repete).
 */

const CATEGORY_KEYS = [
  'payslipIncome',
  'payslipDeductions',
  'basicExpenses',
  'investments',
  'additionalVariableCosts',
] as const;

/** Meses de histórico considerados. Além disso vira ruído: hábito antigo já mudou. */
const MONTHS_OF_HISTORY = 18;

export interface TransactionMemoryEntry {
  key: string;              // descrição normalizada (chave do índice)
  description: string;      // grafia do lançamento mais recente
  count: number;            // quantas vezes apareceu
  lastValue: number;
  lastUsed: string;         // 'YYYY-MM-DD'
  categoryId: string;
  subCategoryId: string;
  accountId?: string;
  cardId?: string;
  paymentMethod?: LineItem['paymentMethod'];
}

/**
 * "Mercado Extra (2/3)" e "MERCADO extra" viram a mesma chave: sem acento, sem
 * pontuação e sem o sufixo de parcela — senão cada parcela viraria um hábito
 * diferente no índice.
 */
export const normalizeDescription = (raw: string): string =>
  (raw || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\(\s*\d+\s*\/\s*\d+\s*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Rede de segurança para quem ainda não tem histórico: liga o que foi digitado a
 * uma subcategoria existente pelo NOME dela. Se as subcategorias do usuário não
 * tiverem esses nomes, nada acontece — o padrão atual continua valendo.
 */
const KEYWORD_RULES: { typed: RegExp; subName: RegExp }[] = [
  { typed: /(mercado|supermerc|hortifruti|sacolao|feira|acougue|padaria|quitanda)/, subName: /(aliment|mercado|superm|casa|essenc)/ },
  { typed: /(ifood|rappi|restaurante|lanche|pizza|burger|cafe|almoco|jantar|delivery)/, subName: /(aliment|restaur|delivery|lazer|fora)/ },
  { typed: /(uber|99|taxi|onibus|metro|combustivel|gasolina|etanol|posto|estacionamento|pedagio|passagem)/, subName: /(transport|carro|combust|mobilid|locomo)/ },
  { typed: /(farmacia|drogaria|medico|consulta|exame|dentista|terapia|psicolog|plano de saude)/, subName: /(saude|medic|farmac)/ },
  { typed: /(aluguel|condominio|luz|energia|agua|gas|internet|iptu|faxina|manutencao)/, subName: /(moradia|casa|essenc|fixa|utilid|basic)/ },
  { typed: /(netflix|spotify|disney|hbo|prime|assinatura|academia|cinema|streaming|jogo)/, subName: /(lazer|assinatur|entreten|streaming)/ },
  { typed: /(escola|faculdade|curso|livro|mensalidade|material escolar)/, subName: /(educ|escola|curso|estudo)/ },
  { typed: /(salario|pagamento|pro labore|freela|honorario|bonus|comissao|decimo)/, subName: /(salari|renda|receita|geral)/ },
];

export interface TargetGroup {
  categoryId: string;
  subs: { id: string; name: string }[];
}

/** Retorna "categoriaId:subId" quando alguma regra bate, ou null. */
export const guessTargetFromKeywords = (description: string, groups: TargetGroup[]): string | null => {
  const typed = normalizeDescription(description);
  if (typed.length < 3) return null;

  const rule = KEYWORD_RULES.find(r => r.typed.test(typed));
  if (!rule) return null;

  for (const group of groups) {
    const sub = group.subs.find(s => rule.subName.test(normalizeDescription(s.name)));
    if (sub) return `${group.categoryId}:${sub.id}`;
  }
  return null;
};

export interface DuplicateMatch {
  name: string;
  value: number;
  date: string;
  categoryId: string;
  subCategoryId: string;
}

const shiftMonthKey = (monthKey: string, delta: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Mesmo hábito, mesmo valor, data bem próxima: sinal forte de que o lançamento
 * já foi feito antes (comum quando se lança a fatura inteira ou o dia inteiro
 * de uma vez, no modo série). Olha só o mês da data candidata e os vizinhos —
 * duplicata é sempre coisa de dias, nunca de meses de distância.
 */
export const findPotentialDuplicate = (
  allData: { [monthKey: string]: FinancialData },
  candidate: { description: string; amount: number; date: string; excludeId?: string }
): DuplicateMatch | null => {
  const targetKey = normalizeDescription(candidate.description);
  if (targetKey.length < 2 || !candidate.amount) return null;

  const candidateMonthKey = candidate.date.slice(0, 7);
  const candidateTime = new Date(`${candidate.date}T12:00:00`).getTime();
  const monthsToCheck = [shiftMonthKey(candidateMonthKey, -1), candidateMonthKey, shiftMonthKey(candidateMonthKey, 1)];

  for (const monthKey of monthsToCheck) {
    const monthData = allData[monthKey];
    if (!monthData) continue;

    for (const categoryId of CATEGORY_KEYS) {
      const category = monthData[categoryId];
      if (!category?.subCategories) continue;

      for (const sub of category.subCategories) {
        if (TRANSFER_SUB_IDS.includes(sub.id)) continue;

        for (const item of sub.items || []) {
          if (item.isTransfer || !item.value || !item.date) continue;
          if (candidate.excludeId && item.id === candidate.excludeId) continue;
          if (normalizeDescription(item.name) !== targetKey) continue;
          if (Math.abs(item.value - candidate.amount) > 0.005) continue;

          const itemTime = new Date(`${item.date}T12:00:00`).getTime();
          const diffDays = Math.abs(candidateTime - itemTime) / 86400000;
          if (diffDays > 1) continue;

          return { name: item.name, value: item.value, date: item.date, categoryId, subCategoryId: sub.id };
        }
      }
    }
  }

  return null;
};

export interface TransactionMemory {
  entries: TransactionMemoryEntry[];
  /** Lançamento idêntico mais recente, se existir. */
  lookup: (description: string) => TransactionMemoryEntry | undefined;
  /** Sugestões para o texto digitado: começa-com primeiro, depois contém. */
  suggest: (query: string, limit?: number) => TransactionMemoryEntry[];
  /** Hábitos: só o que já se repetiu, ordenado por frequência. */
  favorites: (limit?: number) => TransactionMemoryEntry[];
}

export const useTransactionMemory = (
  allData: { [monthKey: string]: FinancialData }
): TransactionMemory => {
  const entries = useMemo(() => {
    const index = new Map<string, TransactionMemoryEntry>();
    const months = Object.keys(allData || {}).sort().slice(-MONTHS_OF_HISTORY);

    months.forEach(monthKey => {
      const monthData = allData[monthKey];
      if (!monthData) return;

      CATEGORY_KEYS.forEach(categoryId => {
        const category = monthData[categoryId];
        if (!category?.subCategories) return;

        category.subCategories.forEach(sub => {
          if (TRANSFER_SUB_IDS.includes(sub.id)) return;

          (sub.items || []).forEach(item => {
            // Transferências não são hábito de consumo; itens zerados costumam ser
            // linha em branco criada pelo "Adicionar Item".
            if (item.isTransfer || !item.value) return;

            const key = normalizeDescription(item.name);
            if (key.length < 2 || key === 'novo item') return;

            const lastUsed = item.date || `${monthKey}-01`;
            const existing = index.get(key);

            if (!existing) {
              index.set(key, {
                key,
                description: item.name,
                count: 1,
                lastValue: item.value,
                lastUsed,
                categoryId,
                subCategoryId: sub.id,
                accountId: item.accountId,
                cardId: item.cardId,
                paymentMethod: item.paymentMethod,
              });
              return;
            }

            existing.count += 1;
            // O mais recente é que manda nos detalhes: se você mudou o mercado de
            // categoria ou de cartão, a sugestão acompanha.
            if (lastUsed >= existing.lastUsed) {
              existing.description = item.name;
              existing.lastValue = item.value;
              existing.lastUsed = lastUsed;
              existing.categoryId = categoryId;
              existing.subCategoryId = sub.id;
              existing.accountId = item.accountId;
              existing.cardId = item.cardId;
              existing.paymentMethod = item.paymentMethod;
            }
          });
        });
      });
    });

    return [...index.values()].sort((a, b) =>
      b.count - a.count || b.lastUsed.localeCompare(a.lastUsed)
    );
  }, [allData]);

  return useMemo(() => ({
    entries,

    lookup: (description: string) => {
      const key = normalizeDescription(description);
      return key ? entries.find(e => e.key === key) : undefined;
    },

    suggest: (query: string, limit = 5) => {
      const key = normalizeDescription(query);
      if (key.length < 2) return [];

      const startsWith = entries.filter(e => e.key.startsWith(key));
      const contains = entries.filter(e => !e.key.startsWith(key) && e.key.includes(key));
      return [...startsWith, ...contains].slice(0, limit);
    },

    favorites: (limit = 6) => entries.filter(e => e.count > 1).slice(0, limit),
  }), [entries]);
};
