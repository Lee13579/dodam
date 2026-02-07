"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Download, Share2, Stars } from "lucide-react";
import { getStyleColor } from '@/lib/utils';
import { applyNoteWatermark } from '@/lib/watermark';

interface ResultCardProps {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    description?: string; // Added description
    shoppingTip?: string;
    dogName?: string;
    styleName?: string;
}

export default function ResultCard({ originalImage, styledImages, analysis, description, shoppingTip, dogName, styleName }: ResultCardProps) {
    const noteColor = getStyleColor(styleName || '도담 스타일');

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
                        <img
                            src={originalImage}
                            alt="Original Dog"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Internal Note Overlay for Original - Micro Minimal */}
                        <div className="absolute bottom-4 right-4 w-fit transform rotate-[-2deg] transition-transform duration-500 group-hover:rotate-0 pointer-events-none">
                            <div className="bg-[#FFFEF9]/95 backdrop-blur-sm px-3 py-1.5 rounded-sm shadow-md border-l-[3px] border-stone-300 relative overflow-hidden">
                                <p className="text-[#2D241A] font-black text-[10px] tracking-tight whitespace-nowrap">원본 사진</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Styled Results - Main Focus with Notes */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {styledImages.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="relative group h-full"
                        >
                            <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] group-hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 bg-stone-100 border-4 border-white">
                                <img
                                    src={img}
                                    alt={`Styled Result ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                />

                                {/* Internal Style Note - Emotional Tag Style */}
                                <div className="absolute bottom-4 right-4 w-fit min-w-[140px] max-w-[220px] transform rotate-[-1deg] transition-transform duration-500 group-hover:rotate-0 pointer-events-none">
                                    <div className="bg-[#FFFEF9]/95 backdrop-blur-sm p-3.5 pb-2.5 rounded-sm shadow-[3px_3px_12px_rgba(0,0,0,0.15)] border-l-[4px] relative overflow-hidden" style={{ borderLeftColor: noteColor }}>
                                        <div className="absolute top-0 right-0 w-6 h-6 bg-black/5 rounded-bl-full" />
                                        
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

            <div className="grid grid-cols-1 gap-12 items-start mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[60px] p-12 md:p-20 shadow-2xl shadow-stone-100 border border-stone-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-bl-[160px] -z-10 opacity-40" />
                    
                    <div className="space-y-16">
                        {/* Section 1: Emotional Analysis Quote */}
                        <div className="relative">
                            <span className="absolute -top-10 -left-6 text-9xl text-pink-100 font-serif serif pointer-events-none select-none">&ldquo;</span>
                            <p className="text-stone-700 text-3xl md:text-4xl font-black leading-tight break-keep relative z-10">
                                {analysis}
                            </p>
                        </div>

                        {/* Section 2: Concept Briefing & Practical Styling Guide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-stone-100">
                            {/* Concept Story */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-pink-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Stars size={14} /> Concept Story
                                </h4>
                                <p className="text-stone-600 text-xl font-bold leading-relaxed break-keep">
                                    {description || "아이의 개성과 현재 트렌드를 조화롭게 믹스한 도담만의 단독 스타일링 컨셉입니다."}
                                </p>
                            </div>

                            {/* Styling Guide */}
                            {shoppingTip && (
                                <div className="space-y-4 bg-[#FFFEF9] p-8 rounded-[32px] border border-pink-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-pink-50 rounded-bl-full" />
                                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Sparkles size={14} /> Styling Guide
                                    </h4>
                                    <p className="text-[#8B7355] text-lg font-bold leading-relaxed break-keep">
                                        {shoppingTip}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}