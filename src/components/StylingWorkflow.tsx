"use client";

import { useEffect } from "react";
import UploadZone from "./UploadZone";
import ResultCard from "./ResultCard";
import ProductRecommendation from "./ProductRecommendation";
import PictorialStage from "./styling/PictorialStage";
import FittingStage from "./styling/FittingStage";
import { useStylingEngine } from "@/hooks/useStylingEngine";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Bot, Stars } from "lucide-react";
import { getNaturalName } from "@/lib/utils";

interface StylingWorkflowProps {
    step: number;
    setStep: (step: number) => void;
}

export default function StylingWorkflow({ step, setStep }: StylingWorkflowProps) {
    const engine = useStylingEngine();

    // Sync local step with parent step if needed, or just rely on parent control.
    // In this refactor, we are using the engine's internal state for logic, 
    // but the UI 'step' prop is controlled by parent. 
    // We need to bridge them or decide on one source of truth. 
    // For this specific refactor, we will sync engine's step changes to the parent.

    useEffect(() => {
        setStep(engine.step);
    }, [engine.step, setStep]);


    return (
        <div id="workflow" className="max-w-7xl mx-auto py-24 px-6">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit tracking-tight">아이의 매력을 보여주세요</h2>
                            <p className="text-[#8b7355] text-lg max-w-xl mx-auto break-keep">정면 사진을 올려주시면 도담이 가장 잘 어울리는 스타일을 찾아드릴게요.</p>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl">
                            <UploadZone onFileSelect={engine.setFile} selectedFile={engine.file} />
                            {engine.file && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-10 space-y-10">
                                    <div className="text-center">
                                        <label className="block text-base font-bold text-[#5d4d3d] mb-4">아이의 소중한 이름을 알려주세요</label>
                                        <input type="text" value={engine.dogName} onChange={(e) => engine.setDogName(e.target.value)} placeholder="예: 두부, 별이" className="w-full px-8 py-5 rounded-[24px] border-2 border-[#fff4e6] outline-none text-center text-xl font-bold shadow-inner focus:border-pink-300 transition-all" />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-base font-bold text-[#5d4d3d] text-center">어떤 스타일링을 원하시나요?</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { id: 'pictorial', label: '감성 화보', desc: '배경과 조명까지 완벽하게', icon: Stars },
                                                { id: 'vto', label: '리얼 피팅', desc: '실제 옷을 입은 듯한 현실적 피팅', icon: Bot }
                                            ].map((m) => (
                                                <button key={m.id} onClick={() => engine.setMode(m.id as any)} className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-start gap-4 ${engine.mode === m.id ? "border-pink-500 bg-pink-50 shadow-lg" : "border-[#fff4e6] bg-white/50 hover:border-pink-200"}`}>
                                                    <div className={`p-3 rounded-xl ${engine.mode === m.id ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-500"}`}><m.icon size={24} /></div>
                                                    <div><h4 className="font-bold text-[#2d241a] text-lg">{m.label}</h4><p className="text-xs text-[#8b7355] mt-1 line-clamp-2 break-keep">{m.desc}</p></div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex justify-center pt-4">
                            <button onClick={engine.handleStep1Submit} disabled={!engine.file || !engine.mode || engine.loading} className="px-16 py-5 bg-pink-500 hover:bg-pink-400 text-white rounded-[32px] font-bold text-xl disabled:opacity-50 shadow-2xl transition-all active:scale-95 flex items-center">
                                {engine.loading ? <><Loader2 className="mr-3 animate-spin" /> {engine.loadingStep}</> : "다음 단계로 가기"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* Mode Switcher Tabs */}
                        <div className="flex justify-center">
                            <div className="bg-[#fff4e6]/50 p-1.5 rounded-[32px] flex gap-2 border border-[#fff4e6] shadow-inner">
                                <button
                                    onClick={() => engine.setMode('pictorial')}
                                    className={`px-8 py-3 rounded-[24px] font-bold transition-all flex items-center gap-2 ${engine.mode === 'pictorial' ? 'bg-white text-pink-500 shadow-md scale-105' : 'text-[#8b7355] hover:text-pink-400'}`}
                                >
                                    <Stars size={18} /> 감성 화보
                                </button>
                                <button
                                    onClick={() => engine.setMode('vto')}
                                    className={`px-8 py-3 rounded-[24px] font-bold transition-all flex items-center gap-2 ${engine.mode === 'vto' ? 'bg-white text-blue-500 shadow-md scale-105' : 'text-[#8b7355] hover:text-blue-400'}`}
                                >
                                    <Bot size={18} /> 리얼 피팅
                                </button>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit">
                                {engine.mode === 'pictorial' ? "화보 스타일 선택" : "스타일링 보드"}
                            </h2>
                            <p className="text-[#8b7355] text-lg">
                                {engine.mode === 'pictorial' ? "도담이 제안하는 프리미엄 화보 컨셉을 골라보세요." : "아이에게 어울리는 조합을 직접 구성해보세요."}
                            </p>
                        </div>

                        {engine.mode === 'pictorial' ? (
                            <PictorialStage
                                previewUrl={engine.previewUrl}
                                recommendations={engine.recommendations}
                                style={engine.style}
                                setStyle={engine.setStyle}
                                customPrompt={engine.customPrompt}
                                setCustomPrompt={engine.setCustomPrompt}
                                userRequest={engine.userRequest}
                                setUserRequest={engine.setUserRequest}
                                keepBackground={engine.keepBackground}
                                setKeepBackground={engine.setKeepBackground}
                                loading={engine.loading}
                                loadingStep={engine.loadingStep}
                                onReset={engine.handleReset}
                                onSubmit={engine.handleStartAnalysis}
                            />
                        ) : (
                            <FittingStage
                                previewUrl={engine.previewUrl}
                                recommendations={engine.recommendations}
                                selectedCloth={engine.selectedCloth}
                                setSelectedCloth={engine.setSelectedCloth}
                                selectedAcc={engine.selectedAcc}
                                setSelectedAcc={engine.setSelectedAcc}
                                suggestedClothes={engine.suggestedClothes}
                                suggestedAccessories={engine.suggestedAccessories}
                                userRequest={engine.userRequest}
                                setUserRequest={engine.setUserRequest}
                                keepBackground={engine.keepBackground}
                                setKeepBackground={engine.setKeepBackground}
                                loading={engine.loading}
                                loadingStep={engine.loadingStep}
                                handleItemUpload={engine.handleItemUpload}
                                onReset={engine.handleReset}
                                onSubmit={engine.handleStartAnalysis}
                            />
                        )}
                    </motion.div>
                )}

                {step === 3 && engine.results && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#2d241a] tracking-tight font-outfit">{getNaturalName(engine.results.dogName)}의 놀라운 변신</h2>
                                <p className="text-[#8b7355] text-lg mt-2">도담이 제안하는 프리미엄 스타일링 결과입니다.</p>
                            </div>
                            <button onClick={engine.handleReset} className="px-8 py-4 bg-white border-2 border-[#fff4e6] hover:border-pink-200 text-pink-500 rounded-full transition-all font-bold flex items-center gap-2 shadow-lg"><ArrowLeft className="w-5 h-5" /> 새로운 스타일 시도</button>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-8 md:p-16 border border-[#fff4e6] shadow-2xl">
                            <ResultCard
                                originalImage={engine.results.originalImage}
                                styledImages={engine.results.styledImages}
                                analysis={engine.results.analysis}
                                baseAnalysis={engine.results.baseAnalysis}
                                dogName={engine.results.dogName}
                                personalColor={engine.results.personalColor}
                                onRetry={engine.handleRetry}
                                retryCount={engine.retryCount}
                                styleName={
                                    (engine.selectedCloth || engine.selectedAcc)
                                        ? [engine.selectedCloth?.name, engine.selectedAcc?.name].filter(Boolean).join(" + ")
                                        : (engine.recommendations.find(r => r.id === engine.style)?.name || "커스텀 스타일")
                                }
                            />
                        </div>
                        <div className="mt-16 pt-16 border-t border-[#fff4e6]">
                            <ProductRecommendation products={engine.products} onLoadMore={engine.handleLoadMoreProducts} loadingMore={engine.loadingMore} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
