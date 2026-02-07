"use client";

import { motion } from "framer-motion";
import { Stars, Loader2 } from "lucide-react";
import StyleSelector from "../StyleSelector";
import { DogStyle, AiConcept } from "@/types";
import Image from "next/image";

interface PictorialStageProps {
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
    onReset: () => void;
    onSubmit: () => void;
}

export default function PictorialStage({
    previewUrl,
    recommendations,
    style,
    setStyle,
    customPrompt,
    setCustomPrompt,
    userRequest,
    setUserRequest,
    keepBackground,
    setKeepBackground,
    loading,
    loadingStep,
    onReset,
    onSubmit
}: PictorialStageProps) {
    return (
        <div className="space-y-16">
            {/* Photo + Analysis Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center max-w-5xl mx-auto px-6">
                <div className="md:col-span-6 flex justify-center md:justify-end">
                    <div className="relative w-full aspect-[3/4] max-w-[320px] rounded-[48px] overflow-hidden z-0 border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                        {previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="Dog preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>
                </div>
                
                <div className="md:col-span-6 flex justify-center md:justify-start">
                    {recommendations.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="max-w-[380px] w-full relative"
                        >
                            <div className="relative bg-[#FFFEF9] p-10 rounded-sm shadow-2xl border-l-[6px] border-pink-200 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-stone-100">
                                    <div className="w-3 h-3 bg-pink-400 rounded-full shadow-inner" />
                                </div>
                                <div className="space-y-4 mt-2">
                                    <p className="text-[#5d4d3d] text-xl font-bold leading-relaxed break-keep tracking-tight text-center">
                                        &quot;{recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]}.&quot;
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl">
                <StyleSelector selectedStyle={style} onSelect={setStyle} recommendations={recommendations} originalImage={previewUrl || undefined} />
                {style === 'custom' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="max-w-2xl mx-auto space-y-4 mt-12">
                        <label className="block text-xl font-bold text-[#2d241a] font-outfit flex items-center gap-2">
                            <Stars className="text-pink-500 fill-pink-500 w-5 h-5" />나만의 커스텀 스타일 제안
                        </label>
                        <textarea 
                            value={customPrompt} 
                            onChange={(e) => setCustomPrompt(e.target.value)} 
                            placeholder="예: 전통 한복을 입은 귀여운 도령님..." 
                            className="w-full h-40 px-6 py-5 rounded-[32px] border-2 border-[#fff4e6] outline-none resize-none text-lg bg-white/50 text-[#2d241a] font-medium leading-relaxed" 
                        />
                    </motion.div>
                )}
            </div>

            <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 py-10 bg-white/40 backdrop-blur-xl rounded-[40px] border border-[#fff4e6] shadow-xl">
                <div className="w-full px-10 space-y-4">
                    <label className="block text-sm font-bold text-[#8b7355] text-center mb-2 flex items-center justify-center gap-2">
                        화보에 담고 싶은 추가 요청사항
                    </label>
                    <input 
                        type="text" 
                        value={userRequest}
                        onChange={(e) => setUserRequest(e.target.value)}
                        placeholder="예: 배경을 조금 더 화사하게 해주세요"
                        className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/50 focus:border-pink-300 outline-none text-center text-[#2d241a] font-medium transition-all shadow-inner"
                    />
                </div>
                <div className="flex flex-row gap-4 w-full px-10">
                    <button onClick={onReset} className="flex-1 px-4 py-4 rounded-[32px] font-bold text-[#8b7355] border-2 border-[#fff4e6] hover:bg-white transition-all font-outfit bg-white/50 h-[68px] text-sm opacity-80">다시 업로드</button>
                    <button 
                        onClick={onSubmit} 
                        disabled={loading || !style || (style === 'custom' && !customPrompt.trim())} 
                        className="flex-[2] px-6 py-5 rounded-[32px] font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-50 shadow-2xl text-lg h-[68px] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> 
                                <span className="text-sm">{loadingStep}</span>
                            </>
                        ) : (
                            <span className="truncate">{style ? "화보 생성하기" : "스타일을 선택해주세요"}</span>
                        )}
                    </button>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group py-2 px-6 rounded-full hover:bg-white/40 transition-all border border-transparent hover:border-pink-100">
                    <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="w-5 h-5 rounded-md border-2 border-pink-300 checked:bg-pink-500 transition-all cursor-pointer accent-pink-500" />
                    <span className="text-[#8b7355] font-bold group-hover:text-pink-500 transition-colors select-none text-sm">원본 사진 배경 유지하기</span>
                </label>
            </div>
        </div>
    );
}
