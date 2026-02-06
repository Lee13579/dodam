"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Download, Share2, Stars } from "lucide-react";

interface ResultCardProps {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    dogName?: string;
    styleName?: string;
    technicalDetails?: {
        prompt?: string;
        keywords?: string[];
    };
}

export default function ResultCard({ originalImage, styledImages, analysis, dogName, styleName, technicalDetails }: ResultCardProps) {
    // Generate a consistent pastel color based on style name
    const getStyleColor = (name: string) => {
        const colors = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const noteColor = getStyleColor(styleName || '도담 스타일');

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
                        
                        {/* Internal Note Overlay for Original - Smaller & Minimal */}
                        <div className="absolute bottom-5 right-5 w-fit transform rotate-[-3deg] transition-transform duration-500 group-hover:rotate-0">
                            <div className="bg-[#FFFEF9] px-4 py-2 rounded-sm shadow-lg border-l-[3px] border-stone-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-4 h-4 bg-black/5 rounded-bl-full" />
                                <p className="text-[#2D241A] font-black text-[11px] tracking-tight whitespace-nowrap">원본 사진</p>
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

                                {/* Internal Style Note - Smaller Memo Style */}
                                <div className="absolute bottom-6 right-6 w-56 transform rotate-[-2deg] transition-transform duration-500 group-hover:rotate-0 pointer-events-none">
                                    <div className="bg-[#FFFEF9] p-4 rounded-sm shadow-[5px_5px_20px_rgba(0,0,0,0.2)] border-l-[5px] relative overflow-hidden" style={{ borderLeftColor: noteColor }}>
                                        <div className="absolute top-0 right-0 w-6 h-6 bg-black/5 rounded-bl-full" />
                                        
                                        <div className="space-y-1">
                                            {dogName && (
                                                <p className="text-[#2D241A] font-bold text-[13px] flex gap-2">
                                                    <span className="text-[#8B7355] opacity-60">이름 :</span> 
                                                    {dogName}
                                                </p>
                                            )}
                                            <p className="text-[#2D241A] font-bold text-[13px] flex gap-2">
                                                <span className="text-[#8B7355] opacity-60">스타일 :</span> 
                                                {styleName || (index === 0 ? '추천 스타일' : '스페셜 제안')}
                                            </p>
                                            <div className="pt-1.5 mt-1.5 border-t border-dashed border-stone-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-[9px] tracking-tighter uppercase" style={{ color: noteColor }}>도담</span>
                                                    <span className="text-stone-400 font-medium text-[8px] lowercase">www.dodam.app</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Action Overlay */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                                    <button
                                        onClick={async () => {
                                            const canvas = document.createElement('canvas');
                                            const ctx = canvas.getContext('2d');
                                            const imgObj = new Image();
                                            imgObj.crossOrigin = "anonymous";
                                            imgObj.src = img;
                                            
                                            imgObj.onload = () => {
                                                canvas.width = imgObj.width;
                                                canvas.height = imgObj.height;
                                                
                                                if (ctx) {
                                                    // 1. Draw image
                                                    ctx.drawImage(imgObj, 0, 0);
                                                    
                                                    // 2. Draw Smaller Memo Watermark
                                                    const scale = canvas.width / 1000;
                                                    const boxW = 280 * scale; 
                                                    const boxH = (dogName ? 150 : 110) * scale;
                                                    const margin = 40 * scale;
                                                    const x = canvas.width - boxW - margin;
                                                    const y = canvas.height - boxH - margin;
                                                    
                                                    // Rotation effect
                                                    ctx.save();
                                                    ctx.translate(x + boxW/2, y + boxH/2);
                                                    ctx.rotate(-2 * Math.PI / 180);
                                                    ctx.translate(-(x + boxW/2), -(y + boxH/2));
                                                    
                                                    // Memo Box
                                                    ctx.fillStyle = '#FFFEF9';
                                                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                                                    ctx.shadowBlur = 15 * scale;
                                                    ctx.fillRect(x, y, boxW, boxH);
                                                    
                                                    // Left Border Accent
                                                    ctx.fillStyle = noteColor;
                                                    ctx.fillRect(x, y, 6 * scale, boxH);
                                                    
                                                    // Text
                                                    ctx.shadowBlur = 0;
                                                    ctx.fillStyle = '#2D241A';
                                                    ctx.font = `bold ${20 * scale}px sans-serif`;
                                                    
                                                    const textX = x + 25 * scale;
                                                    let currentY = y + 45 * scale;
                                                    
                                                    if (dogName) {
                                                        ctx.fillText(`이름 : ${dogName}`, textX, currentY);
                                                        currentY += 35 * scale;
                                                    }
                                                    
                                                    ctx.fillText(`스타일 : ${styleName || (index === 0 ? '추천 스타일' : '스페셜 제안')}`, textX, currentY);
                                                    
                                                    // Brand line
                                                    const lineY = dogName ? y + 105 * scale : y + 70 * scale;
                                                    const brandY = dogName ? y + 130 * scale : y + 95 * scale;

                                                    ctx.beginPath();
                                                    ctx.setLineDash([4 * scale, 4 * scale]);
                                                    ctx.moveTo(x + 15 * scale, lineY);
                                                    ctx.lineTo(x + boxW - 15 * scale, lineY);
                                                    ctx.strokeStyle = '#E5E7EB';
                                                    ctx.stroke();
                                                    
                                                    // Brand Text
                                                    ctx.setLineDash([]);
                                                    ctx.fillStyle = noteColor;
                                                    ctx.font = `bold ${15 * scale}px sans-serif`;
                                                    ctx.fillText(`도담`, textX, brandY);
                                                    
                                                    ctx.fillStyle = '#8B7355';
                                                    ctx.font = `normal ${13 * scale}px sans-serif`;
                                                    ctx.textAlign = 'right';
                                                    ctx.fillText(`www.dodam.app`, x + boxW - 15 * scale, brandY);
                                                    
                                                    ctx.restore();
                                                    
                                                    const link = document.createElement('a');
                                                    link.href = canvas.toDataURL('image/jpeg', 0.95);
                                                    link.download = `dodam-${dogName || 'photo'}-${Date.now()}.jpg`;
                                                    link.click();
                                                }
                                            };
                                        }}
                                        className="w-14 h-14 bg-white text-stone-900 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all transform hover:scale-110 shadow-2xl"
                                    >
                                        <Download className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => navigator.share?.({ title: '도담 스타일링', url: window.location.href })}
                                        className="w-14 h-14 bg-white text-stone-900 rounded-full flex items-center justify-center hover:bg-white hover:text-pink-500 transition-all transform hover:scale-110 shadow-2xl"
                                    >
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Analysis Section - Expanded */}
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
                        전문가의 스타일링 제안
                    </h3>

                    <p className="text-stone-600 text-2xl leading-relaxed font-medium italic whitespace-pre-line break-keep">
                        &quot;{analysis}&quot;
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
