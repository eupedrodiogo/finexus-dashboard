import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
import { FinancialData, Category, SubCategory } from '../types';

// Gemini API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to get model
const getModel = () => {
    if (!genAI) throw new Error("API Key do Gemini não configurada");
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

export const processImageWithGemini = async (file: File): Promise<any> => {
    try {
        const model = getModel();
        const imagePart = await fileToGenerativePart(file);

        const prompt = `
      Analise este documento financeiro (contracheque, fatura ou planilha).
      Identifique explicitamente a quem pertence o documento (ex: "Pedro" ou "Izabel") procurando por nomes no cabeçalho ou corpo.
      Extraia os dados e retorne APENAS um JSON estritamente formatado com a seguinte estrutura, sem markdown:
      {
        "receitas": [
          { "descricao": "Nome do item (ex: Salário)", "valor": 1000.00, "pessoa": "Pedro" | "Izabel" | "Geral" }
        ],
        "deducoes": [
           { "descricao": "Nome do item (ex: INSS)", "valor": 100.00, "pessoa": "Pedro" | "Izabel" | "Geral" }
        ],
        "despesas": [
           { "descricao": "Nome da despesa", "valor": 50.00, "categoria": "Alimentação | Transporte | etc", "pessoa": "Geral" }
        ]
      }
      Regras:
      1. Se encontrar 'Pedro' no documento, atribua pessoa='Pedro'.
      2. Se encontrar 'Izabel' no documento, atribua pessoa='Izabel'.
      3. Se não identificar ninguém claro, use 'Geral'.
      4. Converta todos os valores para numérico (ponto flutuante).
    `;

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
