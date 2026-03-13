
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimulationResult {
  name: string;
  id: string;
  chartData: { year: number; totalInvestido: number; valorAcumulado: number; juros: number }[];
  finalValue: number;
  totalInvested: number;
  totalInterest: number;
}

interface SavedSimulation {
  id: string;
  name: string;
  initialInvestment: string;
  monthlyContribution: string;
  investmentType: string;
  interestRate: string;
  period: string;
}


interface InvestmentSimulatorProps {
  initialMonthlyContribution?: number;
  initialStartValue?: number;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const investmentOptions = [
  { id: 'cdb', name: 'CDB / Renda Fixa', rate: 10.4 },
  { id: 'tesouro_selic', name: 'Tesouro Selic', rate: 10.5 },
  { id: 'ifix', name: 'Fundos Imobiliários (IFIX)', rate: 11.0 },
  { id: 'ibovespa', name: 'Ações (Ibovespa)', rate: 12.0 },
  { id: 'poupanca', name: 'Poupança', rate: 6.0 },
  { id: 'personalizado', name: 'Personalizado', rate: 8.0 }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const KpiCard: React.FC<{ title: string; value: string; colorClass?: string }> = ({ title, value, colorClass = 'text-light-text dark:text-dark-text' }) => (
  <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center">
    <h3 className="text-sm font-medium text-light-subtle dark:text-dark-subtle">{title}</h3>
    <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
  </div>
);

export const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ initialMonthlyContribution, initialStartValue, onShowToast }) => {
  const [initialInvestment, setInitialInvestment] = useState((initialStartValue ?? 1000).toString());
  const [monthlyContribution, setMonthlyContribution] = useState((initialMonthlyContribution ?? 200).toString());
  const [investmentType, setInvestmentType] = useState('cdb');
  const [interestRate, setInterestRate] = useState(investmentOptions.find(opt => opt.id === 'cdb')?.rate.toString() || '10.4');
  const [period, setPeriod] = useState('10');
  const [result, setResult] = useState<SimulationResult[] | null>(null);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [simulationNameToSave, setSimulationNameToSave] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Carregar simulações salvas do localStorage na montagem do componente
  useEffect(() => {
    try {
      const storedSimulations = localStorage.getItem('investmentSimulations');
      if (storedSimulations) {
        setSavedSimulations(JSON.parse(storedSimulations));
      }
    } catch (error) {
      console.error("Falha ao carregar simulações do localStorage", error);
    }
  }, []);

  // Salvar simulações no localStorage sempre que forem alteradas
  useEffect(() => {
    try {
        localStorage.setItem('investmentSimulations', JSON.stringify(savedSimulations));
    } catch (error) {
        console.error("Falha ao salvar simulações no localStorage", error);
    }
  }, [savedSimulations]);


  const handleInvestmentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const option = investmentOptions.find(opt => opt.id === selectedType);
    if (option) {
      setInvestmentType(option.id);
      setInterestRate(String(option.rate));
    }
  };
  
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInterestRate(e.target.value);
       if (errors.interestRate) {
        setErrors(prev => ({ ...prev, interestRate: '' }));
      }
      const personalizedOption = investmentOptions.find(opt => opt.id === 'personalizado');
      if (personalizedOption) {
          setInvestmentType(personalizedOption.id);
      }
  };

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};
    const P = parseFloat(initialInvestment);
    const PMT = parseFloat(monthlyContribution);
    const rate = parseFloat(interestRate);
    const years = parseInt(period, 10);

    if (isNaN(P) || P < 0) {
      newErrors.initialInvestment = 'O valor inicial deve ser positivo.';
    }
    if (isNaN(PMT) || PMT < 0) {
      newErrors.monthlyContribution = 'O aporte mensal deve ser positivo.';
    }
    if (isNaN(rate) || rate <= 0) {
      newErrors.interestRate = 'A taxa de juros deve ser maior que zero.';
    }
    // Check if it's a whole number and greater than 0
    if (isNaN(years) || years <= 0 || parseFloat(period) % 1 !== 0) {
      newErrors.period = 'O período deve ser um número inteiro positivo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSimulate = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateInputs()) {
      setResult(null);
      return;
    }

    const P = parseFloat(initialInvestment) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const years = parseInt(period, 10) || 0;

    const optionsToSimulate = JSON.parse(JSON.stringify(investmentOptions));
    const customOption = optionsToSimulate.find((opt: any) => opt.id === 'personalizado');
    if (customOption) {
        customOption.rate = parseFloat(interestRate) || 0;
    }

    const allResults: SimulationResult[] = optionsToSimulate.map((option: any) => {
        const annualRate = option.rate;
        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = years * 12;
        
        const chartData: SimulationResult['chartData'] = [];
        let accumulatedValue = P;

        chartData.push({
          year: 0,
          totalInvestido: P,
          valorAcumulado: P,
          juros: 0
        });

        for (let month = 1; month <= totalMonths; month++) {
            accumulatedValue += PMT;
            accumulatedValue *= (1 + monthlyRate);

            if (month % 12 === 0 || month === totalMonths) {
                const currentYear = Math.ceil(month / 12);
                const totalInvestedForYear = P + (PMT * month);
                chartData.push({
                    year: currentYear,
                    totalInvestido: totalInvestedForYear,
                    valorAcumulado: accumulatedValue,
                    juros: accumulatedValue - totalInvestedForYear
                });
            }
        }

        const finalTotalInvested = P + (PMT * totalMonths);

        return {
          id: option.id,
          name: option.name,
          chartData,
          finalValue: accumulatedValue,
          totalInvested: finalTotalInvested,
          totalInterest: accumulatedValue - finalTotalInvested,
        };
    });
    
    const finalTotalInvestedValue = P + (PMT * (years * 12));
    setTotalInvested(finalTotalInvestedValue);
    
    allResults.sort((a, b) => b.finalValue - a.finalValue);

    setResult(allResults);
  };

  useEffect(() => {
    if (initialMonthlyContribution !== undefined || initialStartValue !== undefined) {
      handleSimulate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSimulation = () => {
    if (!simulationNameToSave.trim()) {
      if(onShowToast) onShowToast('Por favor, forneça um nome para a simulação.', 'error');
      else alert('Por favor, forneça um nome para a simulação.');
      return;
    }
    const newSimulation: SavedSimulation = {
      id: `sim-${Date.now()}`,
      name: simulationNameToSave.trim(),
      initialInvestment,
      monthlyContribution,
      investmentType,
      interestRate,
      period
    };
    setSavedSimulations(prev => [...prev, newSimulation]);
    setSimulationNameToSave(''); // Limpa o campo após salvar
    if(onShowToast) onShowToast('Cenário salvo com sucesso!', 'success');
  };

  const handleLoadSimulation = (simulation: SavedSimulation) => {
    setInitialInvestment(simulation.initialInvestment);
    setMonthlyContribution(simulation.monthlyContribution);
    setInvestmentType(simulation.investmentType);
    setInterestRate(simulation.interestRate);
    setPeriod(simulation.period);
    if(onShowToast) onShowToast(`Cenário "${simulation.name}" carregado.`, 'info');
  };

  const handleDeleteSimulation = (id: string) => {
    setSavedSimulations(prev => prev.filter(sim => sim.id !== id));
    if(onShowToast) onShowToast('Cenário removido.', 'info');
  };
  
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 text-slate-200 shadow-lg">
                <p className="font-bold text-slate-100">{`Ano ${label}`}</p>
                <p className="text-sm" style={{color: payload[0].color}}>{`Valor Acumulado: ${formatCurrency(payload[0].value)}`}</p>
                <p className="text-sm" style={{color: payload[1].color}}>{`Total Investido: ${formatCurrency(payload[1].value)}`}</p>
                <p className="text-sm text-cyan-400">{`Juros: ${formatCurrency(payload[0].payload.juros)}`}</p>
            </div>
        );
    }
    return null;
  };

  const selectedSimulationData = useMemo(() => {
    if (!result) return null;
    return result.find(r => r.id === investmentType)?.chartData ?? null;
  }, [result, investmentType]);


  const inputClass = "w-full p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  const errorInputClass = "!border-red-500 dark:!border-red-400 focus:!ring-red-500";
  
  return (
    <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border max-w-5xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">Simulador de Juros Compostos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSimulate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label htmlFor="initial" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Aporte Inicial (R$)</label>
                <input type="number" id="initial" value={initialInvestment} onChange={e => {
                    setInitialInvestment(e.target.value)
                    if (errors.initialInvestment) setErrors(prev => ({...prev, initialInvestment: ''}));
                }} className={`${inputClass} ${errors.initialInvestment ? errorInputClass : ''}`} placeholder="Ex: 1000"/>
                {errors.initialInvestment && <p className="mt-1 text-xs text-red-500">{errors.initialInvestment}</p>}
              </div>
              <div>
                <label htmlFor="monthly" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Aportes Mensais (R$)</label>
                <input type="number" id="monthly" value={monthlyContribution} onChange={e => {
                    setMonthlyContribution(e.target.value)
                    if (errors.monthlyContribution) setErrors(prev => ({...prev, monthlyContribution: ''}));
                }} className={`${inputClass} ${errors.monthlyContribution ? errorInputClass : ''}`} placeholder="Ex: 200" />
                 {errors.monthlyContribution && <p className="mt-1 text-xs text-red-500">{errors.monthlyContribution}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <label htmlFor="investmentType" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Analisar Gráfico</label>
                <select id="investmentType" value={investmentType} onChange={handleInvestmentTypeChange} className={`${inputClass} appearance-none`}>
                  {investmentOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
              <div>
                  <label htmlFor="rate" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Taxa de Juros (% a.a.)</label>
                  <input type="number" id="rate" step="0.1" value={interestRate} onChange={handleInterestRateChange} className={`${inputClass} ${errors.interestRate ? errorInputClass : ''}`} placeholder="Ex: 8" />
                  {investmentType !== 'personalizado' && (
                    <p className="mt-1 text-xs text-light-subtle dark:text-dark-subtle">
                        Taxa de referência para o tipo de investimento selecionado.
                    </p>
                  )}
                  {errors.interestRate && <p className="mt-1 text-xs text-red-500">{errors.interestRate}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle">Período (anos)</label>
              <input type="number" id="period" value={period} onChange={e => {
                  setPeriod(e.target.value)
                  if (errors.period) setErrors(prev => ({...prev, period: ''}));
              }} className={`${inputClass} ${errors.period ? errorInputClass : ''}`} placeholder="Ex: 10" />
              {errors.period && <p className="mt-1 text-xs text-red-500">{errors.period}</p>}
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-card transition">
                Simular
            </button>
          </form>
            {result && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-light-border dark:border-dark-border">
                <h4 className="text-md font-semibold mb-2 text-light-text dark:text-dark-text">Salvar Simulação</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do cenário..."
                    value={simulationNameToSave}
                    onChange={(e) => setSimulationNameToSave(e.target.value)}
                    className={inputClass}
                    aria-label="Nome do cenário para salvar"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSimulation}
                    disabled={!simulationNameToSave.trim()}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-dark-card transition disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-3">Cenários Salvos</h3>
                {savedSimulations.length > 0 ? (
                    <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto pr-2">
                    {savedSimulations.map(sim => (
                        <div key={sim.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <span className="font-medium text-sm text-light-text dark:text-dark-text">{sim.name}</span>
                        <div className="flex items-center gap-2">
                            <button
                            onClick={() => handleLoadSimulation(sim)}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            title="Carregar cenário"
                            >
                            Carregar
                            </button>
                            <button
                            onClick={() => handleDeleteSimulation(sim.id)}
                            className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                            title="Excluir cenário"
                            aria-label={`Excluir cenário ${sim.name}`}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-light-subtle dark:text-dark-subtle text-center py-4 bg-slate-50 dark:bg-slate-700/20 rounded-lg">
                    Nenhum cenário salvo.
                    </p>
                )}
            </div>
        </div>
        <div className="lg:col-span-3">
          {result ? (
            <div className="space-y-6">
              <KpiCard title="Total Aportado" value={formatCurrency(totalInvested)} />
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-light-border dark:border-dark-border">
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4 text-center">Comparativo de Resultados</h3>
                  <div className="space-y-3">
                      {result.map((res, index) => {
                          const interestPercentage = res.finalValue > 0 ? (res.totalInterest / res.finalValue) * 100 : 0;
                          const principalPercentage = 100 - interestPercentage;

                          return (
                              <div key={res.id} className={`p-4 rounded-lg transition-all ${index === 0 ? 'border-2 border-indigo-500 bg-light-card dark:bg-dark-card shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-1 gap-x-4 mb-2">
                                      <div className="font-bold text-md text-light-text dark:text-dark-text flex items-center gap-2">
                                          {res.name}
                                          {index === 0 && <span className="text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full whitespace-nowrap">🏆 Melhor Opção</span>}
                                      </div>
                                      <div className={`text-xl font-extrabold ${index === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-light-text dark:text-dark-text'}`}>
                                          {formatCurrency(res.finalValue)}
                                      </div>
                                  </div>
                                  
                                  <div className="w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-full flex overflow-hidden my-2" title={`Composição do valor final: ${principalPercentage.toFixed(1)}% de aportes e ${interestPercentage.toFixed(1)}% de juros.`}>
                                      <div className="bg-slate-500 h-full" style={{ width: `${principalPercentage}%` }}></div>
                                      <div className="bg-cyan-500 h-full" style={{ width: `${interestPercentage}%` }}></div>
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-light-subtle dark:text-dark-subtle">
                                      <div>
                                          <span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1"></span>
                                          Aportes: <span className="font-medium text-light-text dark:text-dark-text">{formatCurrency(res.totalInvested)}</span>
                                      </div>
                                      <div>
                                          <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-1"></span>
                                          Juros: <span className="font-medium text-light-text dark:text-dark-text">{formatCurrency(res.totalInterest)}</span>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="w-full h-64 sm:h-80 pt-4">
                {selectedSimulationData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedSimulationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-light-border/80 dark:stroke-dark-border/80" />
                            <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke="currentColor" tick={{ fontSize: 12 }} />
                            <YAxis stroke="currentColor" tickFormatter={(value) => `R$${Number(value) / 1000}k`} tick={{ fontSize: 12 }} width={60} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Line type="monotone" dataKey="valorAcumulado" name="Valor Acumulado" stroke="#4f46e5" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} />
                            <Line type="monotone" dataKey="totalInvestido" name="Total Investido" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p>Selecione um tipo de investimento para ver o gráfico.</p> }
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-light-subtle dark:text-dark-subtle rounded-lg bg-slate-50 dark:bg-slate-700/20 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text">Projeção de Investimentos</h3>
              <p className="max-w-xs mt-1 text-sm">Preencha os dados e clique em "Simular" para ver a projeção dos seus investimentos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
