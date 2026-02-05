"use client";

import { DogStyle } from "@/types";
import { Check, Stars, Sparkles } from "lucide-react";
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* AI Generated Concepts */}
                {recommendations && recommendations.map((concept, index) => (
                    <motion.button
                        key={concept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(concept.id as DogStyle)}
                        className={`relative p-8 rounded-[40px] border-2 text-left transition-all overflow-hidden h-full flex flex-col group ${selectedStyle === concept.id
                            ? "border-pink-500 bg-pink-50/50 shadow-2xl shadow-pink-100"
                            : "border-[#fff4e6] bg-white/60 backdrop-blur-sm hover:border-pink-200 hover:bg-pink-50/20 shadow-xl shadow-orange-50/50"
                            }`}
                    >
                        {selectedStyle === concept.id && (
                            <div className="absolute top-6 right-6 text-pink-500">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-white rounded-full p-1 shadow-md"
                                >
                                    <Check className="w-5 h-5 stroke-[4]" />
                                </motion.div>
                            </div>
                        )}
                        <div className={`mb-6 p-3 rounded-2xl inline-block transition-colors ${selectedStyle === concept.id ? "bg-white text-pink-500" : "bg-orange-50 text-[#8b7355] group-hover:bg-white group-hover:text-pink-400"}`}>
                            <Stars size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-[#2d241a] font-outfit leading-tight break-keep">{concept.name}</h3>
                        <p className="text-[#8b7355] text-base leading-relaxed line-clamp-4 break-keep font-medium">{concept.description}</p>
                    </motion.button>
                ))}

                {/* Custom Style Option */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: recommendations.length * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('custom')}
                    className={`relative p-8 rounded-[40px] border-2 text-left transition-all overflow-hidden h-full flex flex-col group ${selectedStyle === 'custom'
                        ? "border-pink-500 bg-pink-50/50 shadow-2xl shadow-pink-100"
                        : "border-[#fff4e6] bg-white/60 backdrop-blur-sm hover:border-pink-200 hover:bg-pink-50/20 shadow-xl shadow-orange-50/50"
                        }`}
                >
                    {selectedStyle === 'custom' && (
                        <div className="absolute top-6 right-6 text-pink-500">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-full p-1 shadow-md"
                            >
                                <Check className="w-5 h-5 stroke-[4]" />
                            </motion.div>
                        </div>
                    )}
                    <div className={`mb-6 p-3 rounded-2xl inline-block transition-colors ${selectedStyle === 'custom' ? "bg-white text-pink-500" : "bg-orange-50 text-[#8b7355] group-hover:bg-white group-hover:text-pink-400"}`}>
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#2d241a] font-outfit">나만의 커스텀</h3>
                    <p className="text-[#8b7355] text-base leading-relaxed font-medium">상상하는 무엇이든 도담이 직접 그려드릴게요</p>
                </motion.button>
            </div>

        </div>
    );
}
