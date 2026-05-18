
import React from 'react';
import { Zap, Shield, TrendingUp, Wallet, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GuestExperienceProps {
  onExplore: () => void;
}

export const GuestExperience: React.FC<GuestExperienceProps> = ({ onExplore }) => {
  const { login } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-10 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative w-full max-w-5xl text-center space-y-8 py-12 md:py-20">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest animate-bounceIn">
          <Star size={14} className="fill-current" />
          <span>Inteligência Financeira de Próxima Geração</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">
          Assuma o controle da sua <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">
            liberdade financeira.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          O Finexus transforma sua gestão financeira em uma experiência estratégica, intuitiva e automatizada. Planeje o futuro com precisão matemática e design de elite.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={async () => {
              try {
                await login();
              } catch (err: any) {
                alert("Falha ao iniciar login: " + (err.message || JSON.stringify(err)));
              }
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Começar Agora (Login Google)
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onExplore}
            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Modo Demonstração
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        <FeatureCard 
          icon={<Zap className="text-amber-500" />}
          title="Insights com IA"
          description="Conselhos estratégicos baseados nos seus padrões reais de consumo e investimento."
        />
        <FeatureCard 
          icon={<TrendingUp className="text-emerald-500" />}
          title="Evolução Patrimonial"
          description="Visualize seu crescimento a longo prazo com gráficos de alta precisão e simuladores."
        />
        <FeatureCard 
          icon={<Shield className="text-indigo-500" />}
          title="Segurança Total"
          description="Seus dados estão protegidos com criptografia de ponta e infraestrutura Google Firebase."
        />
      </div>

      {/* Social Proof / Stats */}
      <div className="mt-20 py-8 border-t border-slate-200 dark:border-slate-800 w-full max-w-6xl flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <Stat label="Recursos" value="50+" />
        <Stat label="Precisão" value="100%" />
        <Stat label="Cloud Native" value="Firebase" />
        <Stat label="Design" value="Premium" />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 hover:scale-[1.03] transition-all duration-500 group">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
      {description}
    </p>
  </div>
);

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</span>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);
