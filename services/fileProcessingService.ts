import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
import { FinancialData, Category, SubCategory } from '../types';

// Gemini API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to get model
export const getModel = () => {
    if (!genAI) throw new Error("API Key do Gemini não configurada");
    // Alias mantido pelo Google (sempre aponta para o flash atual) em vez de
    // uma versão fixa — versões datadas (ex.: "gemini-2.0-flash") são
    // aposentadas com o tempo e quebram o app até alguém trocar o nome à mão.
    return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
};

// Helper to convert file to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64Content = base64data.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const processExcelFile = async (file: File): Promise<Partial<FinancialData>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // This is a basic mapping, for now we just return the raw data structure
                // In a real scenario, we would map columns "Valor", "Descrição", "Categoria"

                // TODO: Implement smart mapping logic based on column headers
                // For now, returning empty to trigger manual review or basic mapping in UI
                resolve({});
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};

// Tipo de documento enviado no import inteligente
export type ImportDocType = 'auto' | 'payslip' | 'receipt';

const COMMON_RULES = `
      Regras gerais:
      1. Se encontrar 'Pedro' no documento, atribua pessoa='Pedro'.
      2. Se encontrar 'Izabel' no documento, atribua pessoa='Izabel'.
      3. Se não identificar ninguém claro, use 'Geral'.
      4. Converta todos os valores para numérico (ponto flutuante, sem símbolo de moeda e sem separador de milhar).
      5. Datas sempre no formato ISO YYYY-MM-DD. Se não houver data, omita o campo.
      6. Retorne APENAS o JSON, sem markdown e sem comentários.
`;

const PROMPTS: Record<ImportDocType, string> = {
    payslip: `
      Analise este CONTRACHEQUE / HOLERITE / COMPROVANTE DE RENDIMENTO (documento de ENTRADA).
      Identifique explicitamente a quem pertence o documento (ex: "Pedro" ou "Izabel") procurando por nomes no cabeçalho ou corpo.
      Separe os proventos (o que soma) das deduções (o que é descontado do salário).
      Estrutura do JSON de resposta:
      {
        "receitas": [
          { "descricao": "Nome do provento (ex: Salário Base)", "valor": 1000.00, "pessoa": "Pedro" | "Izabel" | "Geral", "data": "YYYY-MM-DD" }
        ],
        "deducoes": [
           { "descricao": "Nome do desconto (ex: INSS)", "valor": 100.00, "pessoa": "Pedro" | "Izabel" | "Geral", "data": "YYYY-MM-DD" }
        ],
        "despesas": []
      }
      Regras específicas:
      - NÃO inclua totais/subtotais (ex: "Total de Proventos", "Líquido a Receber") como itens.
      - Valores de deduções sempre positivos (o sinal é tratado pelo app).
${COMMON_RULES}`,

    receipt: `
      Analise esta NOTA FISCAL / RECIBO / COMPROVANTE DE PAGAMENTO / BOLETO (documento de SAÍDA).
      Extraia os gastos como despesas. Cada item vira um lançamento de saída.
      Estrutura do JSON de resposta:
      {
        "receitas": [],
        "deducoes": [],
        "despesas": [
           { "descricao": "Nome da despesa", "valor": 50.00, "categoria": "Alimentação | Transporte | Moradia | Saúde | Lazer | Educação | Outros", "pessoa": "Pedro" | "Izabel" | "Geral", "data": "YYYY-MM-DD", "estabelecimento": "Nome da loja/prestador" }
        ]
      }
      Regras específicas:
      - Se o documento for um cupom fiscal com muitos produtos miúdos, agrupe em UM único lançamento com a descrição do estabelecimento (ex: "Supermercado X") e o valor TOTAL pago.
      - Se for uma nota com poucos serviços/itens relevantes, liste cada um separadamente.
      - Use o valor efetivamente PAGO (total líquido, já com descontos aplicados). Nunca some o total junto com os itens individuais.
      - A data deve ser a data de emissão/pagamento do documento.
${COMMON_RULES}`,

    auto: `
      Analise este documento financeiro e descubra sozinho o tipo dele
      (contracheque/holerite = entrada; nota fiscal, recibo, boleto ou comprovante de pagamento = saída; fatura ou extrato = mistura de ambos).
      Identifique explicitamente a quem pertence o documento (ex: "Pedro" ou "Izabel") procurando por nomes no cabeçalho ou corpo.
      Estrutura do JSON de resposta (use array vazio para o que não se aplicar):
      {
        "receitas": [
          { "descricao": "Nome do item (ex: Salário)", "valor": 1000.00, "pessoa": "Pedro" | "Izabel" | "Geral", "data": "YYYY-MM-DD" }
        ],
        "deducoes": [
           { "descricao": "Nome do item (ex: INSS)", "valor": 100.00, "pessoa": "Pedro" | "Izabel" | "Geral", "data": "YYYY-MM-DD" }
        ],
        "despesas": [
           { "descricao": "Nome da despesa", "valor": 50.00, "categoria": "Alimentação | Transporte | etc", "pessoa": "Geral", "data": "YYYY-MM-DD" }
        ]
      }
      Regras específicas:
      - NÃO inclua totais/subtotais como itens.
${COMMON_RULES}`,
};

export const processImageWithGemini = async (file: File, docType: ImportDocType = 'auto'): Promise<any> => {
    try {
        const model = getModel();
        const imagePart = await fileToGenerativePart(file);

        const prompt = PROMPTS[docType] || PROMPTS.auto;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido na IA";
        throw new Error(`Falha na IA: ${errorMessage}`);
    }
};
