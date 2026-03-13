
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Wallet, CreditCard, BarChart3, CloudUpload } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: (startTour?: boolean) => void;
}

const steps = [
    {
        title: "Bem-vindo ao Finexus",
        description: "Sua nova central de inteligência financeira familiar. Vamos te mostrar como tirar o máximo proveito do app em poucos passos.",
        icon: <Sparkles className="w-12 h-12 text-indigo-500" />,
        color: "bg-indigo-500/10",
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "Dashboard Inteligente",
        description: "Tenha uma visão clara do seu patrimônio, fluxo de caixa e progresso de metas em um único lugar, com gráficos dinâmicos.",
        icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
        color: "bg-blue-500/10",
        image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Contas e Cartões",
        description: "Cadastre suas contas bancárias e cartões de crédito. O Finexus calcula seus saldos automaticamente conforme você lança suas despesas.",
        icon: <Wallet className="w-12 h-12 text-emerald-500" />,
        color: "bg-emerald-500/10",
        image: "https://images.unsplash.com/photo-1559526324-4b87b1e38e4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Importação com IA",
        description: "Economize tempo! Compartilhe prints de comprovantes ou PDFs diretamente para o app. Nossa IA identifica os valores para você.",
        icon: <CloudUpload className="w-12 h-12 text-purple-500" />,
        color: "bg-purple-500/10",
        image: "https://images.unsplash.com/photo-1633158829585-23bb8f625601?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Tudo Pronto!",
        description: "Agora você está no controle. Comece cadastrando suas contas principais ou importando seu primeiro comprovante.",
        icon: <CheckCircle2 className="w-12 h-12 text-orange-500" />,
        color: "bg-orange-500/10",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2070&auto=format&fit=crop"
    }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(true); // Start tour
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[600px] border border-slate-200 dark:border-slate-800">

                {/* Image Section */}
                <div className="hidden md:block w-1/2 relative bg-slate-100 dark:bg-slate-800">
                    <img
                        src={steps[currentStep].image}
                        alt={steps[currentStep].title}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex gap-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col p-8 sm:p-12 relative h-full">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex-1 flex flex-col justify-center animate-fadeIn" key={currentStep}>
                        <div className={`w-20 h-20 rounded-3xl ${steps[currentStep].color} flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500`}>
                            {steps[currentStep].icon}
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                            {steps[currentStep].title}
                        </h2>

                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        <button
                            onClick={() => onClose(false)}
                            className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            Pular Tutorial
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrev}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${currentStep === 0 ? 'invisible' : 'visible'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all font-bold hover:scale-105 active:scale-95"
                            >
                                {currentStep === steps.length - 1 ? 'Começar Agora' : 'Próximo'}
                                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
