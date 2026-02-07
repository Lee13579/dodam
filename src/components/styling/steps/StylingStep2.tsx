"use client";

import { motion } from "framer-motion";
import { Stars, Bot } from "lucide-react";
import PictorialStage from "../PictorialStage";
import FittingStage from "../FittingStage";
import { DogStyle, AiConcept, SuggestedItem } from "@/types";

interface StylingStep2Props {
    mode: 'pictorial' | 'vto' | null;
    setMode: (mode: 'pictorial' | 'vto') => void;
    previewUrl: string | null;
    recommendations: AiConcept[];
    style: DogStyle | null;
    setStyle: (style: DogStyle | null) => void;
    customPrompt: string;
    setCustomPrompt: (prompt: string) => void;
    userRequest: string;
    setUserRequest: (request: string) => void;
    keepBackground: boolean;
    setKeepBackground: (keep: boolean) => void;
    loading: boolean;
    loadingStep: string;
    handleReset: () => void;
    handleStartAnalysis: () => void;

    // VTO specific
    selectedCloth: SuggestedItem | null;
    setSelectedCloth: (item: SuggestedItem | null) => void;
    selectedAcc: SuggestedItem | null;
    setSelectedAcc: (item: SuggestedItem | null) => void;
    suggestedClothes: SuggestedItem[];
    suggestedAccessories: SuggestedItem[];
    handleItemUpload: (type: 'cloth' | 'acc', e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function StylingStep2(props: StylingStep2Props) {
    const { mode, setMode } = props;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
        >
            {/* Mode Switcher Tabs */}
            <div className="flex justify-center">
                <div className="bg-[#fff4e6]/50 p-2 rounded-full flex gap-2 border border-[#fff4e6] shadow-inner backdrop-blur-md">
                    <button
                        onClick={() => setMode('pictorial')}
                        className={`px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2.5 ${mode === 'pictorial'
                                ? 'bg-white text-pink-500 shadow-lg scale-105'
                                : 'text-[#8b7355] hover:text-pink-400'
                            }`}
                    >
                        <Stars size={20} className={mode === 'pictorial' ? 'fill-pink-500' : ''} />
                        <span>감성 화보</span>
                    </button>
                    <button
                        onClick={() => setMode('vto')}
                        className={`px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2.5 ${mode === 'vto'
                                ? 'bg-white text-blue-500 shadow-lg scale-105'
                                : 'text-[#8b7355] hover:text-blue-400'
                            }`}
                    >
                        <Bot size={20} className={mode === 'vto' ? 'fill-blue-500' : ''} />
                        <span>리얼 피팅</span>
                    </button>
                </div>
            </div>

            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-[#2d241a] font-outfit tracking-tight">
                    {mode === 'pictorial' ? "화보 컨셉 선택" : "스타일링 보드"}
                </h2>
                <p className="text-[#8b7355] text-lg max-w-xl mx-auto break-keep">
                    {mode === 'pictorial'
                        ? "도담 AI가 제안하는 프리미엄 컨셉 중 하나를 선택해 보세요."
                        : "직접 아이템을 골라 우리 아이만의 착장을 완성해 보세요."
                    }
                </p>
            </div>

            {mode === 'pictorial' ? (
                <PictorialStage
                    previewUrl={props.previewUrl}
                    recommendations={props.recommendations}
                    style={props.style}
                    setStyle={props.setStyle}
                    customPrompt={props.customPrompt}
                    setCustomPrompt={props.setCustomPrompt}
                    userRequest={props.userRequest}
                    setUserRequest={props.setUserRequest}
                    keepBackground={props.keepBackground}
                    setKeepBackground={props.setKeepBackground}
                    loading={props.loading}
                    loadingStep={props.loadingStep}
                    onReset={props.handleReset}
                    onSubmit={props.handleStartAnalysis}
                />
            ) : (
                <FittingStage
                    previewUrl={props.previewUrl}
                    recommendations={props.recommendations}
                    selectedCloth={props.selectedCloth}
                    setSelectedCloth={props.setSelectedCloth}
                    selectedAcc={props.selectedAcc}
                    setSelectedAcc={props.setSelectedAcc}
                    suggestedClothes={props.suggestedClothes}
                    suggestedAccessories={props.suggestedAccessories}
                    userRequest={props.userRequest}
                    setUserRequest={props.setUserRequest}
                    keepBackground={props.keepBackground}
                    setKeepBackground={props.setKeepBackground}
                    loading={props.loading}
                    loadingStep={props.loadingStep}
                    handleItemUpload={props.handleItemUpload}
                    onReset={props.handleReset}
                    onSubmit={props.handleStartAnalysis}
                />
            )}
        </motion.div>
    );
}
