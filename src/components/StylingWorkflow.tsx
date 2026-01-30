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
    const [dogName, setDogName] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    const [results, setResults] = useState<{
        originalImage: string;
        styledImages: string[];
        analysis: string;
        dogName?: string;
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

            // If custom style OR AI-generated style, pass the custom prompt
            let stylePayload = style;
            let isCustomPayload = false;

            if (style === 'custom') {
                stylePayload = customPrompt;
                isCustomPayload = true;
            } else if (style.startsWith('ai_') && recommendations.length > 0) {
                const selectedConcept = recommendations.find(c => c.id === style);
                if (selectedConcept) {
                    stylePayload = selectedConcept.customPrompt;
                    isCustomPayload = true;
                }
            }

            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64, style: stylePayload, isCustom: isCustomPayload }),
            });
            const analyzeData = await analyzeRes.json();

            if (analyzeRes.status !== 200) {
                const errorMessage = analyzeData.details ? `${analyzeData.error}: ${analyzeData.details}` : analyzeData.error;
                throw new Error(errorMessage);
            }

            const { analysis, generationPrompt } = analyzeData;

            // 2. Generate Image with Gemini
            setLoadingStep("새로운 스타일을 시각화 중입니다...");
            const generateRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generationPrompt }),
            });
            const generateData = await generateRes.json();

            if (generateRes.status !== 200) throw new Error(generateData.error);

            // 3. Fetch Partner Products
            setLoadingStep("추천 정보를 불러오는 중입니다...");
            // For custom style, maybe default to 'Teddy Bear' or general recommendation for now
            const productStyleId = style === 'custom' ? 'Teddy Bear' : style;
            const partnersRes = await fetch(`/api/partners?styleId=${productStyleId}`);
            const productsData = await partnersRes.json();

            setResults({
                originalImage: base64,
                styledImages: generateData.urls,
                analysis,
                dogName: dogName || undefined,
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

    const [recommendations, setRecommendations] = useState<Array<{ id: string; name: string; description: string; customPrompt: string }>>([]);
    const [regenerating, setRegenerating] = useState(false);

    const handleStep1Submit = async () => {
        if (!file) return;
        setStep(2);

        // Silently fetch recommendations
        try {
            const base64 = await fileToBase64(file);
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            if (res.ok && data.concepts) {
                setRecommendations(data.concepts);
            }
        } catch (e) {
            console.error("Recommendation failed:", e);
        }
    };

    const handleRegenerate = async () => {
        if (!file || regenerating) return;
        setRegenerating(true);

        try {
            const base64 = await fileToBase64(file);
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            if (res.ok && data.concepts) {
                setRecommendations(data.concepts);
            }
        } catch (e) {
            console.error("Regeneration failed:", e);
        } finally {
            setRegenerating(false);
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900 font-jua">사진 업로드</h2>
                            <p className="text-slate-500">사랑스러운 아이의 사진을 선택해주세요</p>
                        </div>

                        <UploadZone onFileSelect={setFile} selectedFile={file} />

                        {file && (
                            <div className="max-w-md mx-auto">
                                <label className="block text-sm font-medium text-slate-700 mb-2 font-jua text-lg">
                                    강아지 이름 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={dogName}
                                    onChange={(e) => setDogName(e.target.value)}
                                    placeholder="예: 두부, 콩이"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleStep1Submit}
                                disabled={!file}
                                className="styled-button px-12 py-4 text-lg border-2 border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                스타일 선택하러 가기
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900 font-jua">스타일 선택</h2>
                            <p className="text-slate-500">어떤 모습으로 변신해볼까요?</p>
                        </div>

                        <StyleSelector
                            selectedStyle={style}
                            onSelect={setStyle}
                            recommendations={recommendations}
                            onRegenerate={handleRegenerate}
                            regenerating={regenerating}
                        />

                        {/* Custom Style Input */}
                        {style === 'custom' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="max-w-2xl mx-auto space-y-3"
                            >
                                <label className="block text-lg font-bold text-slate-800 font-jua">
                                    ✨ 나만의 스타일을 설명해주세요
                                </label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="예: 핑크색 발레복을 입은 발레리나, 우주비행사, 호그와트 교복... 상상하는 무엇이든 적어주세요!"
                                    className="w-full h-32 px-5 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none text-lg placeholder:text-slate-300"
                                />
                            </motion.div>
                        )}

                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="px-8 py-4 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 inline-block mr-2" />
                                이전으로
                            </button>
                            <button
                                onClick={handleStartAnalysis}
                                disabled={!style || (style === 'custom' && !customPrompt.trim()) || loading}
                                className="styled-button px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-indigo-200"
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
                            styledImages={results.styledImages}
                            analysis={results.analysis}
                            dogName={results.dogName}
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
