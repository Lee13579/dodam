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
    shoppingTip?: string;
    dogName?: string;
    styleName?: string;
}

export default function ResultCard({ originalImage, styledImages, analysis, shoppingTip, dogName, styleName }: ResultCardProps) {
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

            <div className="grid grid-cols-1 gap-8 items-start">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[40px] p-10 md:p-16 shadow-2xl shadow-stone-100 border border-stone-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-pink-50 rounded-bl-[120px] -z-10 opacity-50" />
                    <h3 className="text-3xl font-black mb-8 flex items-center gap-3 text-[#2D241A] font-outfit tracking-tight">
                        <Stars className="w-8 h-8 text-pink-500" />
                        도담의 안목
                    </h3>
                    <p className="text-stone-600 text-2xl leading-relaxed font-medium italic whitespace-pre-line break-keep">
                        &quot;{analysis}&quot;
                    </p>

                    {shoppingTip && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-10 pt-8 border-t border-pink-100"
                        >
                            <p className="text-pink-600 text-lg font-bold flex items-center gap-2">
                                <span className="bg-pink-100 px-3 py-1 rounded-full text-sm uppercase tracking-wider">스타일 팁</span>
                                {shoppingTip}
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}