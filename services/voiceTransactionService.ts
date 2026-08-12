import { getModel } from './fileProcessingService';
import { TransactionType } from '../components/AddTransactionModal';
import { todayISO } from '../utils';

export interface VoiceCategoryGroup {
  categoriaId: string;
  titulo: string;
  tipos: TransactionType[];
  subcategorias: { id: string; nome: string }[];
}

export interface VoiceParseContext {
  groups: VoiceCategoryGroup[];
  cartoes: { id: string; nome: string }[];
  contas: { id: string; nome: string }[];
}

export interface VoiceParseResult {
  transcript: string;
  tipo: TransactionType;
  valor: number;
  descricao: string;
  categoriaId?: string | null;
  subcategoriaId?: string | null;
  metodoPagamento?: 'credit' | 'debit' | 'pix' | 'cash' | null;
  cartaoId?: string | null;
  contaId?: string | null;
  parcelas?: number | null;
  data?: string | null;
}

const buildPrompt = (transcript: string, ctx: VoiceParseContext): string => {
  return `
Você transforma uma frase falada em português do Brasil por um usuário em um lançamento financeiro estruturado, para um app de controle financeiro familiar.

Frase transcrita: "${transcript}"
Data de hoje: ${todayISO()}

Categorias e subcategorias disponíveis (escolha usando EXATAMENTE os ids abaixo, nunca invente um id):
${JSON.stringify(ctx.groups)}

Cartões de crédito cadastrados: ${JSON.stringify(ctx.cartoes)}
Contas cadastradas: ${JSON.stringify(ctx.contas)}

Retorne APENAS um JSON válido (sem markdown, sem comentários), no formato:
{
  "tipo": "expense" | "income" | "credit_card" | "transfer" | "investment",
  "valor": 0.00,
  "descricao": "descrição curta do lançamento",
  "categoriaId": "um dos categoriaId da lista acima, ou null",
  "subcategoriaId": "um dos ids de subcategoria da categoria escolhida, ou null",
  "metodoPagamento": "credit" | "debit" | "pix" | "cash" | null,
  "cartaoId": "um dos ids de cartão acima, apenas se citado explicitamente, ou null",
  "contaId": "um dos ids de conta acima, apenas se citado explicitamente, ou null",
  "parcelas": <inteiro de parcelas se mencionado, ex: "em 3 vezes" = 3, ou null>,
  "data": "YYYY-MM-DD, convertendo 'hoje'/'ontem'/'anteontem' em relação à data de hoje; use a data de hoje se não houver menção"
}

Regras:
1. "tipo" = "expense" para gasto do dia a dia sem menção a cartão de crédito; "credit_card" se mencionar cartão de crédito ou parcelamento; "income" para dinheiro recebido (salário, pix recebido, etc); "investment" para aporte/investimento; "transfer" para transferência entre contas.
2. Se "tipo" for "transfer", deixe "categoriaId" e "subcategoriaId" como null (o usuário escolhe as contas manualmente).
3. Caso contrário, "categoriaId" deve ser um item da lista cujo campo "tipos" contenha o tipo escolhido, e "subcategoriaId" deve pertencer a essa categoria.
4. "valor" é sempre número positivo, sem símbolo de moeda nem separador de milhar.
5. Se não conseguir identificar o valor com confiança, use 0.
6. Escolha a subcategoria semanticamente mais próxima do que foi dito; se nenhuma se encaixar bem, deixe null.
`;
};

export const parseVoiceTransaction = async (
  transcript: string,
  ctx: VoiceParseContext
): Promise<VoiceParseResult> => {
  const clean = transcript.trim();
  if (!clean) throw new Error('Não entendi nada. Tente falar novamente.');

  const model = getModel();
  const result = await model.generateContent(buildPrompt(clean, ctx));
  const response = await result.response;
  const text = response.text();
  const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Não consegui interpretar o áudio. Tente novamente com uma frase mais simples.');
  }

  if (!parsed.tipo || typeof parsed.valor !== 'number' || parsed.valor <= 0) {
    throw new Error('Não consegui identificar o valor. Tente algo como "Gastei 50 reais no mercado".');
  }

  return { transcript: clean, ...parsed };
};
