
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'fixed-top';
    view?: string; // Target view to navigate to
}

interface InterfaceTourProps {
    steps: TourStep[];
    isActive: boolean;
    currentStepIdx: number;
    onNext: () => void;
    onPrev: () => void;
    onComplete: () => void;
    onSkip: () => void;
}

export const InterfaceTour: React.FC<InterfaceTourProps> = ({ steps, isActive, currentStepIdx, onNext, onPrev, onComplete, onSkip }) => {
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateCoords = useCallback(() => {
        const step = steps[currentStepIdx];
        if (!step) return;

        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Add some padding to the highlight
            const padding = 8;
            setCoords({
                top: rect.top + window.scrollY - padding,
                left: rect.left + window.scrollX - padding,
                width: rect.width + (padding * 2),
                height: rect.height + (padding * 2)
            });

            // Smooth scroll to element
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } else {
            // Target not found fallback
            setCoords({
                top: window.innerHeight / 2 - 100,
                left: window.innerWidth / 2 - 160,
                width: 320,
                height: 200
            });
        }
    }, [currentStepIdx, steps]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            updateCoords();
        };

        if (isActive) {
            updateCoords();
            // Slight delay to ensure layout is stable especially after view transitions
            const timer = setTimeout(updateCoords, 400);

            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', updateCoords, { passive: true });

            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', updateCoords);
            };
        }
    }, [isActive, updateCoords, currentStepIdx]);

    if (!isActive || !steps[currentStepIdx]) return null;

    const currentStep = steps[currentStepIdx];

    const getTooltipStyle = (): React.CSSProperties => {
        // Mobile Layout: Bottom Sheet
        if (isMobile) {
            return {
                position: 'fixed',
                bottom: 24, // Safety spacing from bottom
                left: 24,
                right: 24,
                zIndex: 110,
                width: 'auto',
                maxWidth: '100%',
                margin: '0 auto',
            };
        }

        // Desktop Layout based on position prop
        const gap = 24;
        const styles: React.CSSProperties = {
            position: 'absolute',
            zIndex: 110,
            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        };

        if (currentStep.position === 'center') {
            return {
                ...styles,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed'
            };
        }

        if (currentStep.position === 'fixed-top') {
            return {
                ...styles,
                top: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                position: 'fixed',
                width: 420
            };
        }

        // Relative positioning fallbacks
        switch (currentStep.position) {
            case 'bottom':
                styles.top = coords.top + coords.height + gap;
                styles.left = Math.max(gap, Math.min(window.innerWidth - 320 - gap, coords.left + coords.width / 2 - 160));
                break;
            case 'top':
                styles.top = coords.top - gap - 240; // Approx height
                styles.left = Math.max(gap, Math.min(window.innerWidth - 320 - gap, coords.left + coords.width / 2 - 160));
                break;
            case 'left':
                styles.top = coords.top;
                styles.left = coords.left - 320 - gap;
                break;
            case 'right':
                styles.top = coords.top;
                styles.left = coords.left + coords.width + gap;
                break;
        }

        return styles;
    };

    // Progress percentage
    const progress = ((currentStepIdx + 1) / steps.length) * 100;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[105] pointer-events-none">
            {/* SVG Mask Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-700 ease-in-out" style={{ zIndex: 106 }}>
                <defs>
                    <mask id="tour-mask" x="0" y="0" width="100%" height="100%">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                            x={coords.left}
                            y={coords.top}
                            width={coords.width}
                            height={coords.height}
                            rx="16" // Rounded corners for smooth look
                            fill="black"
                            className="transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                        />
                    </mask>
                </defs>
                {/* Darkened background with mask */}
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(15, 23, 42, 0.75)" // slate-900/75 - slightly darker/richer
                    mask="url(#tour-mask)"
                    className="transition-colors duration-500"
                />

                {/* Animated Pulsing Border around target */}
                <rect
                    x={coords.left - 2}
                    y={coords.top - 2}
                    width={coords.width + 4}
                    height={coords.height + 4}
                    rx="18"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="10 6"
                    className="transition-all duration-500 animate-pulse"
                />
            </svg>

            {/* Glassmorphism Tooltip Card */}
            <div
                style={getTooltipStyle()}
                className={`
                    pointer-events-auto 
                    bg-white/90 dark:bg-slate-900/90 
                    backdrop-blur-xl saturate-150
                    border border-white/20 dark:border-slate-700/50 
                    rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] 
                    overflow-hidden
                    transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                    min-w-[320px] max-w-[420px]
                    animate-in fade-in zoom-in-95 slide-in-from-bottom-4
                `}
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-6 md:p-8 relative">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-0.5 block">
                                    Dica {currentStepIdx + 1} de {steps.length}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                                    {currentStep.title}
                                </h3>
                            </div>
                        </div>
                        <button
                            onClick={onSkip}
                            className="p-2 -mr-2 -mt-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                            title="Fechar Tour"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                        {currentStep.description}
                    </p>

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onSkip}
                            className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            Pular
                        </button>

                        <div className="flex gap-3">
                            {currentStepIdx > 0 && (
                                <button
                                    onClick={onPrev}
                                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={onNext}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 hover:shadow-indigo-500/40"
                            >
                                {currentStepIdx === steps.length - 1 ? 'Concluir' : 'Próximo'}
                                {currentStepIdx < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
