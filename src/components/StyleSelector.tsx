"use client";

import { DogStyle } from "@/types";
import { Check, Stars } from "lucide-react";
import { motion } from "framer-motion";

interface StyleSelectorProps {
    selectedStyle: DogStyle | null;
    onSelect: (style: DogStyle) => void;
    recommendations: Array<{ id: string; name: string; description: string; customPrompt: string }>;
    onRegenerate: () => void;
    regenerating: boolean;
    originalImage?: string;
}

export default function StyleSelector({ selectedStyle, onSelect, recommendations, onRegenerate, regenerating }: StyleSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* AI Generated Concepts (5 cards) */}
                {recommendations && recommendations.map((concept, index) => (
                    <motion.button
                        key={concept.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(concept.id as DogStyle)}
                        className={`relative p-6 rounded-[32px] border-2 text-left transition-all overflow-hidden h-full flex flex-col ${selectedStyle === concept.id
                            ? "border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-100/50"
                            : "border-orange-100 bg-white hover:border-pink-200 hover:bg-orange-50/30 shadow-sm"
                            }`}
                    >
                        {selectedStyle === concept.id && (
                            <div className="absolute top-4 right-4 text-pink-500">
                                <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                        )}
                        <h3 className="text-xl font-bold mb-2 text-[#2d241a] font-outfit leading-tight break-keep">{concept.name}</h3>
                        <p className="text-sm text-[#8b7355] leading-relaxed line-clamp-4 break-keep">{concept.description}</p>
                    </motion.button>
                ))}

                {/* Custom Style Option (Last) */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('custom')}
                    className={`relative p-6 rounded-[32px] border-2 text-left transition-all overflow-hidden h-full flex flex-col ${selectedStyle === 'custom'
                        ? "border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-100/50"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm"
                        }`}
                >
                    {selectedStyle === 'custom' && (
                        <div className="absolute top-4 right-4 text-pink-500">
                            <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-[#2d241a] font-outfit">나만의 스타일</h3>
                    <p className="text-sm text-[#8b7355] leading-relaxed">상상하는 무엇이든 만들어드릴게요</p>
                </motion.button>
            </div>

        </div>
    );
}
