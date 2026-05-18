
import React, { useState, useMemo } from 'react';
import { Rocket, Baby, TrendingUp, ChevronRight, Zap } from 'lucide-react';

export const BabyBoostSimulator: React.FC = () => {
  const [extraContribution, setExtraContribution] = useState(500);
  const [showPlan, setShowPlan] = useState(false);


  const stats = useMemo(() => {
    // Cálculo de Antecipação: cada R$ 500 extra = 2 meses a menos de dívida
    const monthsSaved = Math.floor((extraContribution / 500) * 2);
    
    // Caixa Livre para o João Vitor: extra acumulado em 12 meses (sem considerar juros para ser conservador)
    const totalAccumulated = extraContribution * 12;

    // Cenário Otimista: Se investido com juros compostos (ex: 10% aa -> ~0.8% am)
    const monthlyRate = 0.008;
    const compoundValue = extraContribution * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate);

    return {
      monthsSaved,
      totalAccumulated,
      compoundValue,
      boostLevel: extraContribution >= 2000 ? 'Ultra' : extraContribution >= 1000 ? 'Advanced' : 'Regular'
    };
  }, [extraContribution]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="w-full mt-10 animate-fadeIn">
      <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 dark:border-slate-800 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                  <Baby size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic">
                  Baby Boost <span className="text-indigo-600">Simulator</span>
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Simule como seu aporte extra acelera o futuro do João Vitor.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nível de Aceleração</span>
              <div className="flex items-center gap-2">
                <Zap size={16} className={stats.boostLevel === 'Regular' ? 'text-slate-400' : 'text-amber-400 fill-amber-400'} />
                <span className={`text-sm font-black uppercase tracking-tighter ${
                  stats.boostLevel === 'Ultra' ? 'text-indigo-500' : 
                  stats.boostLevel === 'Advanced' ? 'text-emerald-500' : 'text-slate-500'
                }`}>
                  {stats.boostLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Input Side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Aporte Extra Mensal
                  </label>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                    {formatCurrency(extraContribution)}
                  </span>
                </div>
                
                <div className="relative group py-4">
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={extraContribution}
                    onChange={(e) => setExtraContribution(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-4">
                    {[0, 1000, 2000, 3000].map((val) => (
                      <button 
                        key={val}
                        onClick={() => setExtraContribution(val)}
                        className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                          extraContribution === val ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {val === 0 ? 'Mínimo' : val === 3000 ? 'Máximo' : formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100 dark:border-indigo-500/10">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <TrendingUp className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">Impacto nos Investimentos</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Este valor extra será direcionado automaticamente para o plano de quitação de dívidas e reserva do João Vitor.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Antecipação */}
              <div className="glass-card bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                    <Rocket size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Liberdade Antecipada</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                    -{stats.monthsSaved} <span className="text-sm uppercase text-slate-400 font-bold tracking-normal">meses</span>
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed italic">
                  Aceleração de quitação baseada no aporte extra.
                </p>
              </div>

              {/* Card 2: Caixa Livre */}
              <div className="glass-card bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                    <Zap size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Caixa em 1 Anos</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                    {formatCurrency(stats.totalAccumulated).split(',')[0]}
                  </h3>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                    <span>Projeção Juros</span>
                    <span className="text-emerald-500">+ {formatCurrency(stats.compoundValue - stats.totalAccumulated)}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]" />
                  </div>
                </div>
              </div>

              {/* Card 3: Especial (Full width on mobile grid if we had more cards) */}
              <div className="sm:col-span-2 glass-card bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Baby size={120} />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xl font-black tracking-tight mb-1">Impacto João Vitor</h4>
                    <p className="text-indigo-100 text-xs font-medium max-w-[300px]">
                      Com este aporte, o montante total para o primeiro ano do bebê será de aproximadamente:
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black tracking-tighter">
                      {formatCurrency(stats.compoundValue)}
                    </div>
                    <button 
                      onClick={() => setShowPlan(true)}
                      className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors ml-auto"
                    >
                      Ver Plano Completo <ChevronRight size={14} />
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Master Plan Detail Expansion */}
          {showPlan && (
            <div className="mt-10 p-6 bg-slate-100 dark:bg-slate-800/80 rounded-[2rem] border border-slate-200 dark:border-slate-700 animate-fadeIn relative">
              <button 
                onClick={() => setShowPlan(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              >
                <span className="material-symbols-rounded text-xl">close</span>
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Projeção do Master Plan
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xs">06</div>
                  <div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Impacto no 1º Semestre</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Redução de <span className="text-indigo-500 font-bold">{formatCurrency(extraContribution * 6)}</span> no saldo devedor acumulado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-black text-xs">12</div>
                  <div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Impacto no 1º Ano</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Disponibilidade de <span className="text-emerald-500 font-bold">{formatCurrency(stats.totalAccumulated)}</span> de caixa livre para o João Vitor.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Timeline de Aceleração</span>
                    <span className="text-sm font-black">Meta Batida</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
