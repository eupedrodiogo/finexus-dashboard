
import React, { useState, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FinancialData } from '../types';
import { calculateTotal } from '../utils';

interface SmartAdvisorProps {
  allData: { [key: string]: FinancialData };
  onNavigateToSimulator: (values: { monthly?: number; initial?: number } | null) => void;
  userName?: string;
}

interface AnalysisResult {
  healthScore: number;
  diagnosis: string;
  insights: {
    category: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const SmartAdvisor: React.FC<SmartAdvisorProps> = ({ allData, onNavigateToSimulator, userName = "Família" }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [detailedReport, setDetailedReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const financialContext = useMemo(() => {
    const monthKeys = Object.keys(allData).sort();
    if (monthKeys.length === 0) return null;

    // Latest Month for specific insights
    const latestMonth = allData[monthKeys[monthKeys.length - 1]];
    const grossIncome = calculateTotal(latestMonth.payslipIncome);
    const deductions = calculateTotal(latestMonth.payslipDeductions);
    const netIncome = grossIncome - deductions;
    const basicExpenses = calculateTotal(latestMonth.basicExpenses);
    const varExpenses = calculateTotal(latestMonth.additionalVariableCosts);
    const expenses = basicExpenses + varExpenses;
    const investments = calculateTotal(latestMonth.investments);
    const balance = netIncome - expenses - investments;

    // Average calculation over available history
    let totalNet = 0;
    let totalExp = 0;
    let totalInv = 0;
    monthKeys.forEach(k => {
      const d = allData[k];
      totalNet += (calculateTotal(d.payslipIncome) - calculateTotal(d.payslipDeductions));
      totalExp += (calculateTotal(d.basicExpenses) + calculateTotal(d.additionalVariableCosts));
      totalInv += calculateTotal(d.investments);
    });
    const avgNet = totalNet / monthKeys.length;
    const avgExp = totalExp / monthKeys.length;
    const avgInv = totalInv / monthKeys.length;
    const avgBal = avgNet - avgExp - avgInv;

    let maxExpense = { name: '', value: 0 };
    [...latestMonth.basicExpenses.subCategories, ...latestMonth.additionalVariableCosts.subCategories].forEach(cat => {
      cat.items.forEach(item => {
        if (item.value > maxExpense.value) {
          maxExpense = { name: item.name, value: item.value };
        }
      });
    });

    return {
      income: netIncome,
      expenses,
      balance,
      maxExpense,
      investments,
      avgNet,
      avgExp,
      avgInv,
      avgBal
    };
  }, [allData]);

  const handleGenerateInsight = async () => {
    if (!financialContext) return;
    setIsLoading(true);

    const prompt = `
      Você é um consultor financeiro Finexus experiente aconselhando ${userName}.
      Analise os dados do último mês:
      Renda Líquida: ${financialContext.income}
      Gastos Totais: ${financialContext.expenses}
      Investimentos: ${financialContext.investments}
      Saldo Livre: ${financialContext.balance}
      Maior Gasto Único: ${financialContext.maxExpense.name} (${financialContext.maxExpense.value})

      Gere um diagnóstico de saúde financeira com pontuação de 0 a 100.
      Forneça 3 insights acionáveis e curtos.
      
      Retorne APENAS um JSON válido com esta estrutura:
      {
        "healthScore": 85,
        "diagnosis": "Sua frase de diagnóstico aqui",
        "insights": [
          { "category": "Poupança", "message": "Mensagem aqui", "severity": "low" }
        ]
      }
    `;


    // prompt definition above...

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key não encontrada");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean markdown if present
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultData = JSON.parse(jsonString);

      setAnalysis(resultData);
      setDetailedReport(null);
    } catch (error) {
      console.error("Erro ao gerar análise", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDetailedReport = async () => {
    if (!financialContext) return;
    setIsGeneratingReport(true);

    const prompt = `
        Aja como um planejador financeiro pessoal de elite para ${userName}. Escreva um relatório em Markdown sobre a situação financeira atual.
        
        **Dados Médios (Histórico):**
        - Renda Líquida Média: ${formatCurrency(financialContext.avgNet)}
        - Custo de Vida Médio: ${formatCurrency(financialContext.avgExp)}
        - Capacidade de Aporte Média (Investimentos + Saldo): ${formatCurrency(financialContext.avgInv + financialContext.avgBal)}
        
        **Estrutura do Relatório:**
        1. **Análise de Perfil:** Como ${userName} gasta e poupa? São conservadores ou arrojados?
        2. **Alerta de Risco:** Existe algo preocupante nos gastos? (Ex: gastos fixos muito altos).
        3. **Estratégia de Investimento:** Sugira uma alocação para os ${formatCurrency(financialContext.avgInv + financialContext.avgBal)} disponíveis mensalmente. Cite ativos específicos (Tesouro, FIIs, Ações) de forma educativa.
        
        Use negrito para destaque. Seja direto, educado e profissional. Use o nome ${userName} naturalmente no texto.
    `;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key não encontrada");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setDetailedReport(response.text());
    } catch (error) {
      console.error("Erro ao gerar relatório", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!financialContext) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-slate-900/[0.03] dark:text-white/[0.03] pointer-events-none select-none">
          <span className="material-symbols-rounded notranslate text-[15rem] icon-filled leading-none">psychology</span>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center gap-3">
                Smart Advisor
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Beta IA</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium max-w-lg">
                Diagnóstico financeiro e planejamento estratégico em tempo real para {userName}.
              </p>
            </div>

            {!analysis && (
              <button
                onClick={handleGenerateInsight}
                disabled={isLoading}
                className="group flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <span className="material-symbols-rounded notranslate animate-spin">refresh</span> : <span className="material-symbols-rounded notranslate">play_circle</span>}
                {isLoading ? 'Analisando...' : 'Iniciar Análise'}
              </button>
            )}
          </div>

          {!analysis ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Empty State Placeholders */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center h-48">
                <span className="material-symbols-rounded notranslate text-4xl text-slate-300 mb-2">monitoring</span>
                <p className="text-sm font-bold text-slate-400">Aguardando dados para<br />gerar score de saúde.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center h-48">
                <span className="material-symbols-rounded notranslate text-4xl text-slate-300 mb-2">lightbulb</span>
                <p className="text-sm font-bold text-slate-400">Insights personalizados<br />sobre seus gastos.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center h-48">
                <span className="material-symbols-rounded notranslate text-4xl text-slate-300 mb-2">trending_up</span>
                <p className="text-sm font-bold text-slate-400">Recomendações de<br />investimento.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-scaleIn">
              {/* Score Section */}
              <div className="flex flex-col lg:flex-row gap-10 items-center">
                <div className="relative w-48 h-48 flex-shrink-0 group">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-slate-100 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                    <circle
                      className={`${analysis.healthScore > 70 ? 'text-emerald-500' : analysis.healthScore > 50 ? 'text-amber-500' : 'text-rose-500'
                        } transition-all duration - 1000 ease - out`}
                      strokeWidth="8"
                      strokeDasharray={263.8}
                      strokeDashoffset={263.8 - (263.8 * analysis.healthScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42" cx="50" cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{analysis.healthScore}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Principal</h3>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">"{analysis.diagnosis}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.insights.map((insight, i) => (
                      <div key={i} className={`p - 5 rounded - 2xl border flex flex - col justify - between h - full ${insight.severity === 'high' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'} `}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text - [10px] font - black uppercase tracking - widest ${insight.severity === 'high' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-500'} `}>{insight.category}</span>
                          {insight.severity === 'high' && <span className="material-symbols-rounded notranslate text-rose-500 text-lg">warning</span>}
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{insight.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Detailed Report */}
              <div className="border-t border-slate-200 dark:border-slate-700/50 pt-8">
                {!detailedReport ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleGenerateDetailedReport}
                      disabled={isGeneratingReport}
                      className="flex-1 py-4 px-6 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl font-bold border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-3"
                    >
                      {isGeneratingReport ? <span className="material-symbols-rounded notranslate animate-spin">refresh</span> : <span className="material-symbols-rounded notranslate">article</span>}
                      {isGeneratingReport ? 'Escrevendo Relatório...' : 'Gerar Relatório Detalhado'}
                    </button>
                    <button
                      onClick={() => onNavigateToSimulator({ monthly: Math.max(200, financialContext.avgBal), initial: 0 })}
                      className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-rounded notranslate">calculate</span>
                      Simular Investimentos
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-rounded notranslate text-indigo-500">description</span>
                        Relatório de Estratégia
                      </h3>
                      <button onClick={() => setDetailedReport(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-rounded notranslate">close</span>
                      </button>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:font-medium prose-headings:font-black prose-a:text-indigo-500">
                      {detailedReport.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {line.replace(/\*\*/g, '').replace(/^- /, '• ')}
                        </p>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => onNavigateToSimulator({ monthly: Math.max(200, financialContext.avgBal), initial: 0 })}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        Aplicar Estratégia no Simulador
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
