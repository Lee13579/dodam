"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Download, Share2, ZoomIn, Stars, Bot } from "lucide-react";

interface ResultCardProps {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    dogName?: string;
    technicalDetails?: {
        prompt?: string;
        keywords?: string[];
    };
}

export default function ResultCard({ originalImage, styledImages, analysis, dogName, technicalDetails }: ResultCardProps) {
    const [showDebug, setShowDebug] = useState(false);

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Original Thumbnail - Refined */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-3 space-y-4"
                >
                    <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 group">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                            BEFORE
                        </div>
                        <img
                            src={originalImage}
                            alt="Original Dog"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="px-4 text-center lg:text-left">
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em]">Original Subject</p>
                        <h4 className="text-[#2D241A] font-extrabold text-xl font-outfit mt-1">{dogName || "우리 아이"}</h4>
                    </div>
                </motion.div>

                {/* Styled Results - Editorial Layout */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {styledImages.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="relative group h-full"
                        >
                            <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] group-hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.2)] transition-all duration-500 bg-stone-100">
                                <img
                                    src={img}
                                    alt={`Styled Result ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                                />

                                {/* Professional Label Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = img;
                                                link.download = `dodam-photo-${index + 1}.png`;
                                                link.click();
                                            }}
                                            className="w-12 h-12 bg-white text-stone-900 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => navigator.share?.({ title: '도담 스타일링', url: window.location.href })}
                                            className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all transform hover:scale-110 border border-white/30"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Magazine Label */}
                            <div className="mt-6 flex items-start justify-between px-4">
                                <div>
                                    <p className="text-pink-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">DODAM EDITION NO.{index + 1}</p>
                                    <h4 className="text-2xl font-black text-[#2D241A] font-outfit leading-tight">
                                        The {index === 0 ? 'Signature' : 'Alternative'} Look
                                    </h4>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-300 font-bold text-xs italic">
                                    AI
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Analysis & Verification Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-8 bg-white rounded-[40px] p-10 shadow-2xl shadow-stone-100 border border-stone-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-[100px] -z-10 opacity-50" />

                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#2D241A] font-outfit tracking-tight">
                        <Stars className="w-7 h-7 text-pink-500" />
                        전문가 스타일 제안
                    </h3>

                    <p className="text-stone-600 text-xl leading-relaxed font-medium italic whitespace-pre-line">
                        "{analysis}"
                    </p>
                </motion.div>

                {/* Verification/Debug Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-4 space-y-4"
                >
                    <div className="bg-stone-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-4 right-6 text-stone-700 font-black text-4xl italic opacity-50 pointer-events-none">DEV</div>

                        <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6 underline decoration-pink-500 decoration-2 underline-offset-8">
                            Verification Info
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-stone-500 uppercase mb-2">Shopping Bridge</p>
                                <div className="flex flex-wrap gap-2">
                                    {technicalDetails?.keywords?.map((k, i) => (
                                        <span key={i} className="text-xs bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300">
                                            #{k}
                                        </span>
                                    )) || <span className="text-xs text-stone-600 italic">No keywords generated</span>}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className="w-full py-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Bot className="w-4 h-4" />
                                {showDebug ? 'Prompt 숨기기' : 'Raw Prompt 보기'}
                            </button>

                            {showDebug && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-black/40 rounded-xl p-4 mt-2 overflow-hidden"
                                >
                                    <p className="text-[10px] text-stone-500 font-mono leading-relaxed break-words">
                                        {technicalDetails?.prompt || "로그 데이터가 없습니다."}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
