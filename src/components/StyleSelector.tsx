"use client";

import { DogStyle } from "@/types";
import { Check } from "lucide-react";
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* AI Generated Concepts */}
                {recommendations && recommendations.map((concept, index) => (
                    <motion.button
                        key={concept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(selectedStyle === concept.id ? null as any : concept.id as DogStyle)}
                        className={`relative p-10 rounded-[48px] border-2 text-left transition-all overflow-hidden h-full flex flex-col group ${selectedStyle === concept.id
                            ? "border-pink-500 bg-pink-50/50 shadow-2xl shadow-pink-100"
                            : "border-[#fff4e6] bg-white/60 backdrop-blur-sm hover:border-pink-200 hover:bg-pink-50/20 shadow-xl shadow-orange-50/50"
                            }`}
                    >
                        {selectedStyle === concept.id && (
                            <div className="absolute top-8 right-8 text-pink-500">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-white rounded-full p-1.5 shadow-md"
                                >
                                    <Check className="w-6 h-6 stroke-[4]" />
                                </motion.div>
                            </div>
                        )}
                        <h3 className="text-2xl font-bold mb-4 text-[#2d241a] font-outfit leading-tight break-keep mt-2">{concept.name}</h3>
                        <p className="text-[#8b7355] text-lg leading-relaxed break-keep font-medium">{concept.description}</p>
                    </motion.button>
                ))}

                {/* Custom Style Option */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: recommendations.length * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(selectedStyle === 'custom' ? null as any : 'custom')}
                    className={`relative p-10 rounded-[48px] border-2 text-left transition-all overflow-hidden h-full flex flex-col group ${selectedStyle === 'custom'
                        ? "border-pink-500 bg-pink-50/50 shadow-2xl shadow-pink-100"
                        : "border-[#fff4e6] bg-white/60 backdrop-blur-sm hover:border-pink-200 hover:bg-pink-50/20 shadow-xl shadow-orange-50/50"
                        }`}
                >
                    {selectedStyle === 'custom' && (
                        <div className="absolute top-8 right-8 text-pink-500">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-full p-1.5 shadow-md"
                            >
                                <Check className="w-6 h-6 stroke-[4]" />
                            </motion.div>
                        </div>
                    )}
                    <h3 className="text-2xl font-bold mb-4 text-[#2d241a] font-outfit mt-2 break-keep">나만의 커스텀</h3>
                    <p className="text-[#8b7355] text-lg leading-relaxed font-medium break-keep">상상하는 무엇이든 도담이 직접 그려드릴게요</p>
                </motion.button>
            </div>
        </div>
    );
}
