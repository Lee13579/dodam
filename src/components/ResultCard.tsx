"use client";

import React from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, Share2, RefreshCw, Loader2 } from "lucide-react";
import { getStyleColor } from '@/lib/utils';
import { applyNoteWatermark } from '@/lib/watermark';

interface ResultCardProps {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    baseAnalysis?: string; // Initial dog analysis from Step 2
    dogName?: string;
    styleName?: string;
    personalColor?: string;
    onRetry?: () => void;
    retryCount?: number;
}

export default function ResultCard({ originalImage, styledImages, analysis, baseAnalysis, dogName, styleName, personalColor, onRetry, retryCount = 0 }: ResultCardProps) {
    const noteColor = personalColor || getStyleColor(styleName || '도담 스타일');

    const handleDownload = async (imgUrl: string, index: number) => {
        try {
            const timestamp = new Date().getTime();
            const currentStyle = styleName || (index === 0 ? '추천 스타일' : '스페셜 제안');
            const watermarkedBase64 = await applyNoteWatermark(imgUrl, {
                dogName,
                styleName: currentStyle,
                noteColor
            });
            
            const link = document.createElement('a');
            link.href = watermarkedBase64;
            link.download = `dodam-${dogName || 'photo'}-${timestamp}.jpg`;
            link.click();
        } catch (e) {
            console.error("Download failed:", e);
            alert("이미지 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Original Thumbnail - Compact with Note */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-3"
                >
                    <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl rotate-[-1deg] hover:rotate-0 transition-transform duration-500 group bg-stone-50">
                        <Image
                            src={originalImage}
                            alt="Original Dog"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            unoptimized
                        />
                        
                        {/* Internal Note Overlay for Original - Micro Minimal */}
                        <div className="absolute bottom-4 right-4 w-fit transform rotate-[-2deg] transition-transform duration-500 group-hover:rotate-0 pointer-events-none">
                            <div className="bg-[#FFFEF9]/95 backdrop-blur-sm px-3 py-1.5 rounded-sm shadow-md border-l-[3px] border-stone-300 relative overflow-hidden">
                                <p className="text-[#2D241A] font-black text-[10px] tracking-tight whitespace-nowrap">원본 사진</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 Analysis Note - Continuity */}
                    {baseAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 relative px-2"
                        >
                            <div className="relative bg-[#FFFEF9] p-6 rounded-sm shadow-xl border-l-[4px] transform rotate-1 hover:rotate-0 transition-transform duration-500" style={{ borderLeftColor: noteColor }}>
                                {/* Pin Decoration */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-stone-50">
                                    <div className="w-2 h-2 rounded-full shadow-inner" style={{ backgroundColor: noteColor }} />
                                </div>
                                
                                <p className="text-[#5d4d3d] text-sm font-bold leading-relaxed break-keep text-center italic">
                                    &quot;{baseAnalysis}&quot;
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Styled Results - Main Focus with Notes */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Placeholder for loading state */}
                    {styledImages.length === 0 && [0, 1].map((_, idx) => (
                        <div key={`skeleton-${idx}`} className="relative aspect-[4/5] rounded-[48px] bg-stone-100 border-4 border-white shadow-xl flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100 animate-pulse" />
                            <Loader2 className="w-10 h-10 text-pink-200 animate-spin relative z-10" />
                            <p className="text-stone-400 font-bold text-sm mt-4 animate-pulse relative z-10">아이의 화보를 그리는 중...</p>
                        </div>
                    ))}

                    {styledImages.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="relative group h-full"
                        >
                            <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] group-hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 bg-stone-100 border-4 border-white">
                                <Image
                                    src={img}
                                    alt={`Styled Result ${index + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                    unoptimized
                                />

                                {/* Internal Style Note - Emotional Tag Style */}
                                <div className="absolute bottom-4 right-4 w-fit min-w-[140px] max-w-[220px] transform rotate-[-1deg] transition-transform duration-500 group-hover:rotate-0 pointer-events-none">
                                    <div className="bg-[#FFFEF9]/95 backdrop-blur-sm p-3.5 pb-2.5 rounded-sm shadow-[3px_3px_12px_rgba(0,0,0,0.15)] border-l-[4px] relative overflow-hidden" style={{ borderLeftColor: noteColor }}>
                                        <div className="space-y-1.5 text-[11px] leading-tight text-[#2D241A] font-bold">
                                            {dogName && (
                                                <div className="flex gap-1.5">
                                                    <span className="text-[#8B7355] opacity-60 shrink-0">이름 :</span>
                                                    <span>{dogName}</span>
                                                </div>
                                            )}
                                            <div className="flex gap-1.5">
                                                <span className="text-[#8B7355] opacity-60 shrink-0">스타일 :</span>
                                                <span className="break-keep">{styleName || '추천 스타일'}</span>
                                            </div>
                                            
                                            <div className="pt-1.5 mt-1 border-t border-dashed border-stone-200">
                                                <div className="flex justify-between items-baseline gap-2">
                                                    <span className="font-black text-[9px] tracking-tighter uppercase" style={{ color: noteColor }}>도담</span>
                                                    <span className="text-stone-400 font-medium text-[7px] lowercase">www.dodam.app</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Action Overlay - Always Visible */}
                                <div className="absolute top-5 right-5 flex flex-row gap-2 z-30">
                                    <button
                                        onClick={() => handleDownload(img, index)}
                                        className="w-10 h-10 bg-white/90 backdrop-blur-md text-stone-900 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                        title="이미지 저장하기"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => navigator.share?.({ title: '도담 스타일링', url: window.location.href })}
                                        className="w-10 h-10 bg-white/90 backdrop-blur-md text-stone-900 rounded-full flex items-center justify-center hover:bg-white hover:text-pink-500 transition-all transform hover:scale-110 shadow-lg"
                                        title="공유하기"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[60px] p-12 md:p-20 shadow-2xl shadow-stone-100 border border-stone-100 relative overflow-hidden"
                >
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-stone-50 rounded-full -z-10 opacity-60" />
                    
                    <div className="space-y-12">
                        {/* Section 1: Emotional Styling Recommendation */}
                        <div className="relative text-center">
                            <div className="flex items-center justify-center gap-4 text-[#8b7355] text-sm font-black tracking-[0.3em] uppercase mb-12 opacity-60">
                                <span className="w-12 h-[1px] bg-[#8b7355]/30"></span>
                                Editor&apos;s Choice
                                <span className="w-12 h-[1px] bg-[#8b7355]/30"></span>
                            </div>
                            
                            <div className="relative inline-block max-w-4xl">
                                <span className="absolute -top-10 -left-12 text-9xl text-stone-100 font-serif serif pointer-events-none select-none leading-none">&ldquo;</span>
                                <p className="text-[#2D241A] text-2xl md:text-4xl font-black leading-[1.6] break-keep relative z-10 tracking-tight italic px-4">
                                    {analysis}
                                </p>
                                <span className="absolute -bottom-20 -right-12 text-9xl text-stone-100 font-serif serif pointer-events-none select-none leading-none">&rdquo;</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer: Retry Button */}
                    {onRetry && retryCount !== undefined && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={onRetry}
                                disabled={retryCount >= 1}
                                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${retryCount >= 1 ? '' : ''}`} />
                                <span className="font-bold text-sm">
                                    {retryCount >= 1 ? "재시도 완료 (1/1)" : "결과가 마음에 안 드나요? 다시 해보기 (1회 무료)"}
                                </span>
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
