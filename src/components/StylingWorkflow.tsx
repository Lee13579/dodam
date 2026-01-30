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

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    const [recommendations, setRecommendations] = useState<Array<{ id: string; name: string; description: string; customPrompt: string; koreanAnalysis: string }>>([]);
    const [regenerating, setRegenerating] = useState(false);

    const resizeImage = (file: File, maxWidth = 768): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxWidth) {
                            width *= maxWidth / height;
                            height = maxWidth;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.75));
                };
            };
        });
    };

    const handleStartAnalysis = async () => {
        if (!file || !style) return;
        setLoading(true);

        try {
            const dispName = dogName ? `${dogName}` : "우리 아이";
            const base64 = await resizeImage(file);

            let generationPrompt = "";
            let analysis = "";

            // Check if it's an AI-generated style or a custom style
            const selectedAiConcept = recommendations.find(c => c.id === style);

            if (selectedAiConcept) {
                // SKIP REDUNDANT ANALYSIS: Use pre-calculated prompt and analysis from Step 1
                generationPrompt = selectedAiConcept.customPrompt;
                analysis = selectedAiConcept.koreanAnalysis;
                setLoadingStep(`${dispName}의 스타일을 정교하게 다듬는 중...`);
            } else if (style === 'custom') {
                // Only analyze if it's a completely new custom prompt
                setLoadingStep(`${dispName}의 보석 같은 매력을 발견하는 중...`);
                const analyzeRes = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64, style: customPrompt, isCustom: true }),
                });
                const analyzeData = await analyzeRes.json();

                if (analyzeRes.status !== 200) {
                    const errorMessage = analyzeData.details ? `${analyzeData.error}: ${analyzeData.details}` : analyzeData.error;
                    throw new Error(errorMessage);
                }

                generationPrompt = analyzeData.generationPrompt;
                analysis = analyzeData.analysis;
            } else {
                // Fallback for any other cases
                throw new Error("Invalid style selection");
            }

            // Generate Image with Gemini
            setLoadingStep(`${dispName}만의 특별한 변신을 그리는 중...`);
            const generateRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generationPrompt, image: base64 }),
            });
            const generateData = await generateRes.json();

            if (generateRes.status !== 200) throw new Error(generateData.error);

            // Fetch Partner Products
            setLoadingStep("거의 다 됐어요! 반짝이는 모습을 준비 중...");
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

    const handleStep1Submit = async () => {
        if (!file) return;
        setLoading(true);
        const dispName = dogName ? `${dogName}` : "우리 아이";
        setLoadingStep(`${dispName}의 매력 포인트를 찾는 중...`);

        try {
            const base64 = await resizeImage(file);
            setPreviewUrl(base64);
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            if (res.ok && data.concepts) {
                setRecommendations(data.concepts);
            }
            setStep(2);
        } catch (e) {
            console.error("Recommendation failed:", e);
            // Even if recommendation fails, we move to step 2 so user can at least use custom style
            setStep(2);
        } finally {
            setLoading(false);
            setLoadingStep("");
        }
    };

    const handleRegenerate = async () => {
        if (!file || regenerating) return;
        setRegenerating(true);

        try {
            const base64 = await resizeImage(file);
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
        <div className="max-w-7xl mx-auto py-12 px-6">
            {/* Progress Stepper */}
            {step < 3 && (
                <div className="flex justify-between mb-12 relative max-w-xs mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-slate-100 text-slate-400"
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
                            <h2 className="text-3xl font-bold text-slate-900 font-outfit">사진 업로드</h2>
                            <p className="text-slate-500">사랑스러운 아이의 사진을 선택해주세요</p>
                        </div>

                        <UploadZone onFileSelect={setFile} selectedFile={file} />

                        {file && (
                            <div className="max-w-md mx-auto">
                                <label className="block text-sm font-medium text-slate-700 mb-2 font-outfit text-lg">
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
                                disabled={!file || loading}
                                className="styled-button px-12 py-4 text-lg border-2 border-pink-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> {loadingStep}
                                    </>
                                ) : (
                                    "스타일 선택하러 가기"
                                )}
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
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold text-slate-900 font-outfit">스타일 선택</h2>
                            <p className="text-slate-500">어떤 모습으로 변신해볼까요?</p>

                            {/* Original Dog Preview */}
                            {previewUrl && (
                                <div className="flex justify-center">
                                    <div className="relative w-64 h-64 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                        <img src={previewUrl} alt="Dog preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
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
                                <label className="block text-lg font-bold text-slate-800 font-outfit">
                                    ✨ 나만의 스타일을 설명해주세요
                                </label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="예: 전통 한복을 입은 모습, 턱시도를 입은 신사, 하와이안 셔츠를 입고 해변에서... 상상하는 무엇이든 적어주세요!"
                                    className="w-full h-32 px-5 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none text-lg placeholder:text-slate-300"
                                />
                            </motion.div>
                        )}

                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="px-8 py-4 rounded-full font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors font-outfit"
                            >
                                이전으로
                            </button>

                            {!style ? (
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="px-12 py-4 rounded-full font-bold text-pink-500 border border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm font-outfit text-lg"
                                >
                                    {regenerating ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" /> 스타일 찾는 중...
                                        </>
                                    ) : (
                                        "다른 스타일 보기"
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartAnalysis}
                                    disabled={loading || (style === 'custom' && !customPrompt.trim())}
                                    className="px-12 py-4 rounded-full font-bold text-pink-500 border border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm font-outfit text-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 animate-spin" /> {loadingStep}
                                        </>
                                    ) : (
                                        "스타일 적용하기"
                                    )}
                                </button>
                            )}
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
                                className="flex items-center text-pink-500 hover:text-pink-600 transition-colors font-bold"
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

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <ProductRecommendation products={products} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
