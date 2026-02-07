"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ResultCard from "@/components/ResultCard";
import ProductRecommendation from "@/components/ProductRecommendation";
import { getNaturalName } from "@/lib/utils";

interface StylingStep3Props {
    results: any;
    dogName: string;
    products: any[];
    loadingMore: boolean;
    retryCount: number;
    handleReset: () => void;
    handleRetry: () => void;
    handleLoadMoreProducts: () => void;
    selectedCloth?: any;
    selectedAcc?: any;
    recommendations: any[];
    style: any;
}

export default function StylingStep3({
    results,
    dogName,
    products,
    loadingMore,
    retryCount,
    handleReset,
    handleRetry,
    handleLoadMoreProducts,
    selectedCloth,
    selectedAcc,
    recommendations,
    style
}: StylingStep3Props) {
    if (!results) return null;

    const currentStyleName = (selectedCloth || selectedAcc)
        ? [selectedCloth?.name, selectedAcc?.name].filter(Boolean).join(" + ")
        : (recommendations.find(r => r.id === style)?.name || "커스텀 스타일");

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#2d241a] tracking-tight font-outfit">
                        {getNaturalName(results.dogName || dogName)}의 놀라운 변신
                    </h2>
                    <p className="text-[#8b7355] text-lg mt-2 font-medium">도담 AI가 디자인한 프리미엄 스타일링 결과입니다.</p>
                </div>
                <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-white border-2 border-[#fff4e6] hover:border-pink-200 text-pink-500 rounded-full transition-all font-bold flex items-center gap-2 shadow-lg active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>새로운 스타일 시도</span>
                </button>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[60px] p-8 md:p-16 border border-[#fff4e6] shadow-2xl shadow-orange-100/10">
                <ResultCard
                    originalImage={results.originalImage}
                    styledImages={results.styledImages}
                    analysis={results.analysis}
                    baseAnalysis={results.baseAnalysis}
                    dogName={results.dogName || dogName}
                    personalColor={results.personalColor}
                    onRetry={handleRetry}
                    retryCount={retryCount}
                    styleName={currentStyleName}
                />
            </div>

            <div className="mt-20 pt-20 border-t-2 border-dashed border-[#fff4e6]">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-[#2d241a] mb-4">스타일 완성 아이템</h3>
                    <p className="text-[#8b7355] text-lg">결과 이미지 속 아이템과 유사한 상품들을 확인해보세요.</p>
                </div>
                <ProductRecommendation
                    products={products}
                    onLoadMore={handleLoadMoreProducts}
                    loadingMore={loadingMore}
                />
            </div>
        </motion.div>
    );
}
