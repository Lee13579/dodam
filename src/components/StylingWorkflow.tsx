"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import StyleSelector from "./StyleSelector";
import ResultCard from "./ResultCard";
import ProductRecommendation from "./ProductRecommendation";
import { DogStyle, Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Stars } from "lucide-react";

export default function StylingWorkflow() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [style, setStyle] = useState<DogStyle | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");

    const [results, setResults] = useState<{
        originalImage: string;
        styledImage: string;
        analysis: string;
    } | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleStartAnalysis = async () => {
        if (!file || !style) return;
        setLoading(true);

        try {
            // 1. Analyze with Gemini
            setLoadingStep("강아지의 특징을 분석 중입니다...");
            const base64 = await fileToBase64(file);
            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64, style }),
            });
            const analyzeData = await analyzeRes.json();

            if (analyzeRes.status !== 200) throw new Error(analyzeData.error);

            const { analysis, generationPrompt } = analyzeData;

            // 2. Generate Image with DALL-E
            setLoadingStep("새로운 스타일을 시각화 중입니다...");
            const generateRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generationPrompt }),
            });
            const generateData = await generateRes.json();

            if (generateRes.status !== 200) throw new Error(generateData.error);

            const { url: styledImageUrl } = generateData;

            // 3. Fetch Partner Products
            setLoadingStep("추천 정보를 불러오는 중입니다...");
            const partnersRes = await fetch(`/api/partners?styleId=${style}`);
            const productsData = await partnersRes.json();

            setResults({
                originalImage: base64,
                styledImage: styledImageUrl,
                analysis,
            });
            setProducts(productsData);
            setStep(3);
        } catch (e: any) {
            console.error(e);
            alert(`문제가 발생했습니다: ${e.message || "스타일링에 실패했습니다."}`);
        } finally {
            setLoading(false);
            setLoadingStep("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            {/* Progress Stepper */}
            {step < 3 && (
                <div className="flex justify-between mb-12 relative max-w-xs mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-400"
                                }`}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">우리 강아지 사진 업로드</h2>
                            <p className="text-slate-500">고화질 사진일수록 정확한 스타일 분석이 가능합니다.</p>
                        </div>
                        <UploadZone onFileSelect={setFile} />
                        <div className="mt-8 flex justify-center">
                            <button
                                disabled={!file}
                                onClick={() => setStep(2)}
                                className="px-10 py-4 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
                            >
                                스타일 선택하러 가기
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-2 text-slate-900 tracking-tight">원하는 스타일 선택</h2>
                            <p className="text-slate-500">우리 아이에게 입혀보고 싶은 스타일을 골라주세요.</p>
                        </div>
                        <StyleSelector selectedStyle={style} onStyleSelect={setStyle} />
                        <div className="mt-12 flex justify-center gap-4">
                            <button
                                disabled={loading}
                                onClick={() => setStep(1)}
                                className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center border border-slate-100"
                            >
                                <ArrowLeft className="mr-2 w-5 h-5" /> 이전으로
                            </button>
                            <button
                                disabled={!style || loading}
                                onClick={handleStartAnalysis}
                                className="px-10 py-4 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center shadow-lg shadow-indigo-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> {loadingStep}
                                    </>
                                ) : (
                                    <>
                                        스타일 적용하기 <Stars className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && results && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">스타일링 결과</h2>
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors font-bold"
                            >
                                <ArrowLeft className="mr-2 w-5 h-5" /> 다른 스타일 시도하기
                            </button>
                        </div>

                        <ResultCard
                            originalImage={results.originalImage}
                            styledImage={results.styledImage}
                            analysis={results.analysis}
                        />

                        <div className="mt-16 pt-16 border-t border-slate-100">
                            <ProductRecommendation products={products} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
