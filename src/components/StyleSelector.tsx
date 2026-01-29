"use client";

import { DogStyle } from "@/types";
import { STYLE_OPTIONS } from "@/constants";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface StyleSelectorProps {
    selectedStyle: DogStyle | null;
    onStyleSelect: (style: DogStyle) => void;
}

export default function StyleSelector({ selectedStyle, onStyleSelect }: StyleSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STYLE_OPTIONS.map((style) => (
                <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStyleSelect(style.id)}
                    className={`relative p-6 rounded-3xl border text-left transition-all ${selectedStyle === style.id
                        ? "border-indigo-500 bg-indigo-50/30 shadow-[0_10px_15px_-3px_rgba(79,70,229,0.1)]"
                        : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 shadow-sm"
                        }`}
                >
                    {selectedStyle === style.id && (
                        <div className="absolute top-4 right-4 text-indigo-600">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{style.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{style.description}</p>
                </motion.button>
            ))}
        </div>
    );
}
