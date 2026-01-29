"use client";

import { motion } from "framer-motion";
import { Download, Share2, ZoomIn } from "lucide-react";

interface ResultCardProps {
    originalImage: string;
    styledImage: string;
    analysis: string;
}

export default function ResultCard({ originalImage, styledImage, analysis }: ResultCardProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                >
                    <p className="absolute top-4 left-4 z-10 bg-slate-100/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider shadow-sm">
                        원본 사진
                    </p>
                    <img
                        src={originalImage}
                        alt="Original Dog"
                        className="w-full h-96 object-cover rounded-3xl border border-slate-100 shadow-xl"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative group"
                >
                    <p className="absolute top-4 left-4 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        도담도담 스타일링 결과
                    </p>
                    <img
                        src={styledImage}
                        alt="Styled Dog"
                        className="w-full h-96 object-cover rounded-3xl border-2 border-indigo-500/20 shadow-xl"
                    />
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/40 backdrop-blur-[2px] transition-all rounded-3xl flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                        <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-indigo-50 shadow-md transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-indigo-50 shadow-md transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8 rounded-3xl border border-slate-100 bg-slate-50/30"
            >
                <h3 className="text-2xl font-bold mb-4 flex items-center text-slate-900">
                    <ZoomIn className="w-6 h-6 mr-2 text-indigo-500" /> 스타일링 분석
                </h3>
                <p className="text-slate-600 leading-relaxed italic text-lg whitespace-pre-line">
                    "{analysis}"
                </p>
            </motion.div>
        </div>
    );
}
