import { TransactionType } from '../components/AddTransactionModal';
import { todayISO, daysAgoISO } from '../utils';

/**
 * Parser de texto livre: puramente local (regex, sem API, sem latência, sem
 * custo) — o par oposto do lançamento por voz, que já existe e usa IA. Serve
 * pra digitar rápido ("mercado 235,90 crédito nubank 3x ontem") ou colar o
 * texto de uma notificação de banco/Pix e deixar o formulário se preencher
 * sozinho. Nunca envia nada — só sugere os campos, o usuário sempre revisa.
 */

export interface FreeTextContext {
  cards: { id: string; name: string }[];
  accounts: { id: string; name: string }[];
}

export interface FreeTextResult {
  description: string;
  amount: number;
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'cash';
  cardId?: string;
  accountId?: string;
  installments?: number;
  date?: string; // YYYY-MM-DD
  transactionType?: TransactionType;
}

/** Tira pontuação nas pontas e acentos, pra comparar "crédito" com "credito". */
const norm = (s: string) =>
  s.replace(/^[.,;:!?]+|[.,;:!?]+$/g, '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const toAmount = (token: string): number | null => {
  const t = token.replace(/^r\$\s*/i, '').replace(/^[.,;:!?]+|[.,;:!?]+$/g, '');
  if (/^\d+$/.test(t)) return parseInt(t, 10); // inteiro puro = reais sem centavos
  const comma = t.match(/^(\d{1,3}(?:\.\d{3})*),(\d{2})$/); // 235,90 ou 1.234,56
  if (comma) return parseFloat(`${comma[1].replace(/\./g, '')}.${comma[2]}`);
  const dot = t.match(/^(\d+)\.(\d{2})$/); // 235.90 (formato US, aceito também)
  if (dot) return parseFloat(t);
  return null;
};

const INCOME_VERBS = ['recebi', 'recebido', 'caiu', 'entrou'];
const INVESTMENT_VERBS = ['investi', 'aportei', 'invisti'];

/**
 * Só vale a pena tentar interpretar se o texto tiver cara de lançamento
 * (um número em algum lugar) — evita disparar o parser numa descrição comum.
 */
export const looksLikeFreeText = (raw: string): boolean => /\d/.test(raw);

export const parseFreeText = (raw: string, ctx: FreeTextContext): FreeTextResult | null => {
  const text = raw.trim();
  if (!text) return null;

  const rawTokens = text.split(/\s+/).filter(Boolean);
  const normTokens = rawTokens.map(norm);
  const consumed = new Array(rawTokens.length).fill(false);

  let installments: number | undefined;
  let date: string | undefined;
  let paymentMethod: FreeTextResult['paymentMethod'];
  let cardId: string | undefined;
  let accountId: string | undefined;
  let typeHint: TransactionType | undefined;

  // 1. Parcelas: "3x" (junto) ou "3 x" (separado) — antes do valor, pra não
  //    confundir o número de parcelas com o valor da compra.
  for (let i = 0; i < rawTokens.length; i++) {
    if (consumed[i]) continue;
    const t = normTokens[i];
    const glued = t.match(/^(\d{1,2})x$/);
    if (glued) {
      installments = parseInt(glued[1], 10);
      consumed[i] = true;
      break;
    }
    if (/^\d{1,2}$/.test(t) && normTokens[i + 1] === 'x') {
      installments = parseInt(t, 10);
      consumed[i] = true; consumed[i + 1] = true;
      break;
    }
  }

  // 2. Data: relativa (hoje/ontem/anteontem) ou dd/mm(/aaaa)
  for (let i = 0; i < rawTokens.length; i++) {
    if (consumed[i]) continue;
    const t = normTokens[i];
    if (t === 'hoje') { date = todayISO(); consumed[i] = true; break; }
    if (t === 'ontem') { date = daysAgoISO(1); consumed[i] = true; break; }
    if (t === 'anteontem') { date = daysAgoISO(2); consumed[i] = true; break; }
    const dm = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (dm) {
      const day = parseInt(dm[1], 10), month = parseInt(dm[2], 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        const year = dm[3] ? (dm[3].length === 2 ? 2000 + parseInt(dm[3], 10) : parseInt(dm[3], 10)) : new Date().getFullYear();
        date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        consumed[i] = true;
        break;
      }
    }
  }

  // 3. Método de pagamento
  for (let i = 0; i < rawTokens.length; i++) {
    if (consumed[i]) continue;
    const t = normTokens[i];
    if (t === 'credito') { paymentMethod = 'credit'; consumed[i] = true; break; }
    if (t === 'debito') { paymentMethod = 'debit'; consumed[i] = true; break; }
    if (t === 'pix') { paymentMethod = 'pix'; consumed[i] = true; break; }
    if (t === 'dinheiro' || t === 'especie') { paymentMethod = 'cash'; consumed[i] = true; break; }
  }

  // 4. Cartão pelo nome (ex.: "Nubank") — sinaliza crédito automaticamente
  for (const card of ctx.cards) {
    const cardNorm = norm(card.name);
    if (!cardNorm) continue;
    const idx = normTokens.findIndex((t, i) => !consumed[i] && t === cardNorm);
    if (idx !== -1) {
      cardId = card.id;
      consumed[idx] = true;
      if (!paymentMethod) paymentMethod = 'credit';
      break;
    }
  }

  // 5. Conta pelo nome — só importa se não caiu em cartão
  if (!cardId) {
    for (const acc of ctx.accounts) {
      const accNorm = norm(acc.name);
      if (!accNorm) continue;
      const idx = normTokens.findIndex((t, i) => !consumed[i] && t === accNorm);
      if (idx !== -1) { accountId = acc.id; consumed[idx] = true; break; }
    }
  }

  // 6. Verbos que indicam o tipo — consumidos porque não rendem uma boa
  //    descrição sozinhos ("recebi" não é nome de lançamento; "salário" é).
  for (let i = 0; i < rawTokens.length; i++) {
    if (consumed[i]) continue;
    const t = normTokens[i];
    if (INCOME_VERBS.includes(t)) { typeHint = 'income'; consumed[i] = true; }
    else if (INVESTMENT_VERBS.includes(t)) { typeHint = 'investment'; consumed[i] = true; }
  }

  // 7. Valor: primeiro token remanescente com cara de dinheiro
  let amount = 0;
  for (let i = 0; i < rawTokens.length; i++) {
    if (consumed[i]) continue;
    const val = toAmount(rawTokens[i]);
    if (val !== null && val > 0) { amount = val; consumed[i] = true; break; }
  }

  if (amount <= 0) return null; // sem valor identificado, não há o que aplicar

  const transactionType: TransactionType =
    (installments && installments > 1) || cardId || paymentMethod === 'credit'
      ? 'credit_card'
      : typeHint || 'expense';

  const description = rawTokens
    .filter((_, i) => !consumed[i])
    .join(' ')
    .trim();

  return {
    description: description ? description.charAt(0).toUpperCase() + description.slice(1) : '',
    amount,
    paymentMethod: transactionType === 'credit_card' ? 'credit' : paymentMethod,
    cardId,
    accountId,
    installments: installments && installments > 1 ? installments : undefined,
    date,
    transactionType,
  };
};
