"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import StyleSelector from "./StyleSelector";
import ResultCard from "./ResultCard";
import ProductRecommendation from "./ProductRecommendation";
import { DogStyle, Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Stars, Bot } from "lucide-react";

interface StylingWorkflowProps {
    step: number;
    setStep: (step: number) => void;
}

export default function StylingWorkflow({ step, setStep }: StylingWorkflowProps) {
    const [file, setFile] = useState<File | null>(null);
    const [style, setStyle] = useState<DogStyle | null>(null);
    const [mode, setMode] = useState<'pictorial' | 'vto' | null>(null);
    const [keepBackground, setKeepBackground] = useState(false);
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
        technicalDetails?: {
            prompt?: string;
            keywords?: string[];
        };
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

    const [recommendations, setRecommendations] = useState<Array<{ id: string; name: string; description: string; customPrompt: string; koreanAnalysis: string; searchKeywords: string[] }>>([]);
    const [regenerating, setRegenerating] = useState(false);

    const resizeImage = (file: File, maxWidth = 1024): Promise<string> => {
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
                    resolve(canvas.toDataURL("image/jpeg", 0.85));
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
            let keywords: string[] = [];

            // Check if it's an AI-generated style or a custom style
            const selectedAiConcept = recommendations.find(c => c.id === style);

            if (selectedAiConcept) {
                // Adjust prompt based on mode and background preference
                if (mode === 'vto' || keepBackground) {
                    const outfit = (selectedAiConcept as any).vtoOutfitEnglish || selectedAiConcept.name;
                    generationPrompt = `Using the provided image, perform a precise virtual try-on. KEEP THE ORIGINAL BACKGROUND and lighting. Modify ONLY the dog's clothing to: ${outfit}. Ensure realistic fabric textures and fit.`;
                } else {
                    generationPrompt = selectedAiConcept.customPrompt;
                }

                analysis = selectedAiConcept.koreanAnalysis;
                keywords = selectedAiConcept.searchKeywords || [];
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
                keywords = [customPrompt]; // Fallback keyword for custom
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

            let query = style === 'custom' ? customPrompt : "";
            if (selectedAiConcept && selectedAiConcept.searchKeywords) {
                query = (selectedAiConcept as any).searchKeywords.join(" ");
            }

            const partnersRes = await fetch(`/api/partners?query=${encodeURIComponent(query || style)}&styleId=${style}`);
            const productsData = await partnersRes.json();

            setResults({
                originalImage: base64,
                styledImages: generateData.urls,
                analysis,
                dogName: dogName || undefined,
                technicalDetails: {
                    prompt: generationPrompt,
                    keywords: keywords
                }
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
            
            if (res.ok && data.concepts && Array.isArray(data.concepts) && data.concepts.length > 0) {
                setRecommendations(data.concepts);
                // Transition directly to Step 2 (Style Selection)
                setStep(2);
            } else {
                throw new Error("스타일 추천 데이터를 받지 못했습니다.");
            }
        } catch (e: any) {
            console.error("Recommendation failed:", e);
            alert("죄송합니다. 스타일 추천에 실패했습니다. 잠시 후 다시 시도해주시거나 다른 사진을 사용해주세요.");
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


    const getNaturalName = (name?: string) => {
        if (!name) return "아이";
        // Check if the last character has a batchim
        const lastChar = name.charCodeAt(name.length - 1);
        const hasBatchim = (lastChar - 0xac00) % 28 > 0;
        
        // If it already ends with '이' (like '별이'), just return name
        if (name.endsWith('이')) return name;
        
        // If has batchim, add '이' for natural flow (e.g. '곰돌' -> '곰돌이')
        return hasBatchim ? `${name}이` : name;
    };

    return (
        <div id="workflow" className="max-w-7xl mx-auto py-24 px-6">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit">아이의 매력을 보여주세요</h2>
                            <p className="text-[#8b7355] text-lg max-w-xl mx-auto break-keep">
                                반려견의 정면 사진을 올려주세요. <br />
                                깨끗하고 밝은 사진일수록 도담이 더 완벽한 스타일을 추천해 드립니다.
                            </p>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl shadow-orange-50/50">
                            <UploadZone onFileSelect={setFile} selectedFile={file} />

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-md mx-auto mt-10"
                                >
                                    <label className="block text-base font-bold text-[#5d4d3d] mb-4 text-center">
                                        아이의 소중한 이름을 알려주세요
                                    </label>
                                    <input
                                        type="text"
                                        value={dogName}
                                        onChange={(e) => setDogName(e.target.value)}
                                        placeholder="예: 두부, 초코, 별이"
                                        className="w-full px-8 py-5 rounded-[24px] border-2 border-[#fff4e6] focus:border-pink-300 focus:ring-0 transition-all outline-none bg-white text-center text-xl placeholder:text-slate-300 text-[#2d241a] font-bold shadow-inner"
                                    />
                                </motion.div>
                            )}

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mt-12 space-y-6"
                                >
                                    <label className="block text-base font-bold text-[#5d4d3d] text-center mb-6">
                                        어떤 스타일링을 원하시나요?
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                        <button
                                            onClick={() => setMode('pictorial')}
                                            className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-start gap-4 ${mode === 'pictorial'
                                                ? "border-pink-500 bg-pink-50 shadow-lg"
                                                : "border-[#fff4e6] bg-white/50 hover:border-pink-200"
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${mode === 'pictorial' ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-500"}`}>
                                                <Stars size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#2d241a] text-lg">감성 화보</h4>
                                                <p className="text-sm text-[#8b7355] mt-1 line-clamp-2 break-keep">배경과 조명까지 완벽한 한 편의 화보를 만듭니다.</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setMode('vto')}
                                            className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-start gap-4 ${mode === 'vto'
                                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                                : "border-[#fff4e6] bg-white/50 hover:border-blue-200"
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${mode === 'vto' ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-500"}`}>
                                                <Bot size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#2d241a] text-lg">리얼 피팅</h4>
                                                <p className="text-sm text-[#8b7355] mt-1 line-clamp-2 break-keep">실제 옷을 입은 것처럼 현실적인 피팅에 집중합니다.</p>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleStep1Submit}
                                disabled={!file || !mode || loading}
                                className="px-16 py-5 bg-pink-500 hover:bg-pink-400 text-white rounded-[32px] font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-2xl shadow-pink-100 transition-all active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 animate-spin" /> {loadingStep}
                                    </>
                                ) : (
                                    "다음 단계로 가기"
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-6">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit">어떤 모습이 어울릴까요?</h2>
                            <p className="text-[#8b7355] text-lg">가장 시도해보고 싶은 스타일을 선택해주세요.</p>

                            {/* Original Dog Preview - Refined */}
                            {previewUrl && (
                                <div className="flex justify-center py-6">
                                    <div className="relative w-72 h-72 rounded-[56px] overflow-hidden border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 bg-white">
                                        <img src={previewUrl} alt="Dog preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl shadow-orange-50/50">
                            <StyleSelector
                                selectedStyle={style}
                                onSelect={setStyle}
                                recommendations={recommendations}
                                onRegenerate={handleRegenerate}
                                regenerating={regenerating}
                            />

                            {/* Custom Style Input - Refined */}
                            {style === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="max-w-2xl mx-auto space-y-4 mt-12"
                                >
                                    <label className="block text-xl font-bold text-[#2d241a] font-outfit flex items-center gap-2">
                                        <Stars className="text-pink-500 fill-pink-500 w-5 h-5" />
                                        나만의 커스텀 스타일 제안
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="예: 전통 한복을 입은 귀여운 도령님, 스트릿 브랜드 후드를 입은 힙한 강아지..."
                                        className="w-full h-40 px-6 py-5 rounded-[32px] border-2 border-[#fff4e6] focus:border-pink-300 focus:ring-0 transition-all outline-none resize-none text-lg placeholder:text-slate-300 bg-white/50 text-[#2d241a] font-medium leading-relaxed"
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-8 pt-8">
                            <div className="flex justify-center items-center gap-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-10 py-5 rounded-[32px] font-bold text-[#8b7355] border-2 border-[#fff4e6] hover:bg-white transition-all font-outfit bg-white/50 h-[68px] flex items-center justify-center"
                                >
                                    다시 업로드하기
                                </button>

                                {!style ? (
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={regenerating}
                                        className="min-w-[280px] px-10 py-5 rounded-[32px] font-bold text-pink-500 border-2 border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-xl shadow-pink-50 font-outfit text-xl h-[68px] justify-center"
                                    >
                                        {regenerating ? (
                                            <>
                                                <Loader2 className="mr-3 animate-spin" /> 스타일 찾는 중...
                                            </>
                                        ) : (
                                            "다른 스타일 제안 받기"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartAnalysis}
                                        disabled={loading || (style === 'custom' && !customPrompt.trim())}
                                        className="min-w-[280px] px-10 py-5 rounded-[32px] font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-2xl shadow-pink-100 font-outfit text-xl h-[68px] justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-3 animate-spin" /> {loadingStep}
                                            </>
                                        ) : (
                                            "스타일링 적용하기"
                                        )}
                                    </button>
                                )}
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={keepBackground}
                                    onChange={(e) => setKeepBackground(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-2 border-pink-300 checked:bg-pink-500 checked:border-pink-500 focus:ring-0 transition-all cursor-pointer accent-pink-500"
                                />
                                <span className="text-[#8b7355] font-bold group-hover:text-pink-500 transition-colors select-none text-lg">배경은 그대로 유지할래요</span>
                            </label>
                        </div>
                    </motion.div>
                )}

                {step === 3 && results && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="space-y-12"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#2d241a] tracking-tight font-outfit">
                                    {getNaturalName(results.dogName)}의 놀라운 변신
                                </h2>
                                <p className="text-[#8b7355] text-lg mt-2">도담이 제안하는 프리미엄 스타일링 결과입니다.</p>
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="px-8 py-4 bg-white border-2 border-[#fff4e6] hover:border-pink-200 text-pink-500 rounded-full transition-all font-bold flex items-center gap-2 shadow-lg shadow-orange-50"
                            >
                                <ArrowLeft className="w-5 h-5" /> 새로운 스타일 시도
                            </button>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-8 md:p-16 border border-[#fff4e6] shadow-2xl shadow-orange-50/50">
                            <ResultCard
                                originalImage={results.originalImage}
                                styledImages={results.styledImages}
                                analysis={results.analysis}
                                dogName={results.dogName}
                                styleName={recommendations.find(r => r.id === style)?.name}
                                technicalDetails={results.technicalDetails}
                            />
                        </div>

                        <div className="mt-16 pt-16 border-t border-[#fff4e6]">
                            <ProductRecommendation products={products} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
