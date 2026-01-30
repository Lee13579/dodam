"use client";

import { DogStyle } from "@/types";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StyleSelectorProps {
    selectedStyle: DogStyle | null;
    onSelect: (style: DogStyle) => void;
    recommendations?: Array<{ id: string; name: string; description: string; customPrompt: string }>;
    onRegenerate?: () => void;
    regenerating?: boolean;
}

export default function StyleSelector({ selectedStyle, onSelect, recommendations, onRegenerate, regenerating }: StyleSelectorProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* AI Generated Concepts (5 cards) */}
                {recommendations && recommendations.map((concept, index) => (
                    <motion.button
                        key={concept.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(concept.id as DogStyle)}
                        className={`relative p-6 rounded-3xl border text-left transition-all overflow-hidden ${selectedStyle === concept.id
                            ? "border-indigo-500 bg-indigo-50/30 shadow-[0_10px_15px_-3px_rgba(79,70,229,0.1)]"
                            : "border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md ring-1 ring-indigo-200"
                            }`}
                    >
                        {selectedStyle === concept.id && (
                            <div className="absolute top-4 right-4 text-indigo-600">
                                <Check className="w-5 h-5" />
                            </div>
                        )}
                        <h3 className="text-xl font-bold mb-2 text-indigo-900">{concept.name}</h3>
                        <p className="text-sm text-indigo-700 leading-relaxed">{concept.description}</p>
                    </motion.button>
                ))}

                {/* Custom Style Option (Last) */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('custom')}
                    className={`relative p-6 rounded-3xl border text-left transition-all overflow-hidden ${selectedStyle === 'custom'
                        ? "border-indigo-500 bg-indigo-50/30 shadow-[0_10px_15px_-3px_rgba(79,70,229,0.1)]"
                        : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                        }`}
                >
                    {selectedStyle === 'custom' && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-slate-900">나만의 스타일</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">상상하는 무엇이든 만들어드립니다</p>
                </motion.button>
            </div>

            {/* Regenerate Button */}
            {onRegenerate && recommendations && recommendations.length > 0 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-indigo-700"
                    >
                        {regenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                새로운 스타일 생성 중...
                            </>
                        ) : (
                            <>
                                🔄 다른 스타일 보기
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
