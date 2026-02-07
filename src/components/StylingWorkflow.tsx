"use client";

import { useState, useEffect } from "react";
import UploadZone from "./UploadZone";
import ResultCard from "./ResultCard";
import ProductRecommendation from "./ProductRecommendation";
import PictorialStage from "./styling/PictorialStage";
import FittingStage from "./styling/FittingStage";
import { DogStyle, Product, AiConcept, SuggestedItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Bot, Stars } from "lucide-react";
import { getNaturalName } from "@/lib/utils";

interface StylingWorkflowProps {
    step: number;
    setStep: (step: number) => void;
}

interface StylingResults {
    originalImage: string;
    styledImages: string[];
    analysis: string;
    baseAnalysis: string;
    description: string;
    dogName?: string;
    shoppingTip?: string;
    keywords?: string[];
    personalColor?: string;
}

const resizeImage = (file: File, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else if (height > maxWidth) {
                    width *= maxWidth / height;
                    height = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                }
                resolve(canvas.toDataURL("image/jpeg", 0.9)); 
            };
        };
    });
};

export default function StylingWorkflow({ step, setStep }: StylingWorkflowProps) {
    const [file, setFile] = useState<File | null>(null);
    const [style, setStyle] = useState<DogStyle | null>(null);
    const [mode, setMode] = useState<'pictorial' | 'vto' | null>(null);
    const [keepBackground, setKeepBackground] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");
    const [retryCount, setRetryCount] = useState(0); // Track retries
    const loadingMessages = [
        "아이의 모색과 체형을 분석하고 있어요...",
        "가장 잘 어울리는 컬러를 찾는 중이에요...",
        "트렌디한 아이템을 매칭하고 있어요...",
        "에디터가 추천사를 작성하고 있어요...",
        "멋진 화보를 완성하는 중입니다..."
    ];

    // Message Rotation Effect
    useEffect(() => {
        if (!loading) return;
        let idx = 0;
        const interval = setInterval(() => {
            idx = (idx + 1) % loadingMessages.length;
            setLoadingStep(loadingMessages[idx]);
        }, 2500); // Change message every 2.5s
        return () => clearInterval(interval);
    }, [loading]);

    const [dogName, setDogName] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [userRequest, setUserRequest] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [results, setResults] = useState<StylingResults | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [recommendations, setRecommendations] = useState<AiConcept[]>([]);
    const [personalColor, setPersonalColor] = useState<string>("#EC4899"); // Default pink
    const [suggestedClothes, setSuggestedClothes] = useState<SuggestedItem[]>([]);
    const [suggestedAccessories, setSuggestedAccessories] = useState<SuggestedItem[]>([]);
    
    // Selection state for VTO
    const [selectedCloth, setSelectedCloth] = useState<SuggestedItem | null>(null);
    const [selectedAcc, setSelectedAcc] = useState<SuggestedItem | null>(null);
    
    const [shoppingQuery, setShoppingQuery] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);

    const handleItemUpload = async (type: 'cloth' | 'acc', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await resizeImage(file, 512);
        const customItem: SuggestedItem = { 
            id: `custom-${type}-${Date.now()}`, 
            image: base64, 
            name: type === 'cloth' ? "나의 옷" : "나의 소품", 
            isUserUploaded: true,
            searchKeyword: "",
            description: ""
        };
        if (type === 'cloth') setSelectedCloth(customItem);
        else setSelectedAcc(customItem);
    };

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setStyle(null);
        setMode(null);
        setSelectedCloth(null);
        setSelectedAcc(null);
        setRecommendations([]);
        setSuggestedClothes([]);
        setSuggestedAccessories([]);
        setProducts([]);
        setResults(null);
        setDogName("");
        setCustomPrompt("");
        setUserRequest("");
        setKeepBackground(false);
        setStep(1);
        setRetryCount(0);
    };

    const handleRetry = async () => {
        if (retryCount >= 1) {
            alert("재시도는 1회만 가능해요. 새로운 스타일을 시도해보세요!");
            return;
        }
        setRetryCount(prev => prev + 1);
        await handleStartAnalysis();
    };

    const handleLoadMoreProducts = async () => {
        if (!shoppingQuery || loadingMore) return;
        setLoadingMore(true);
        try {
            const nextStart = products.length + 1;
            const res = await fetch(`/api/partners?query=${encodeURIComponent(shoppingQuery)}&start=${nextStart}`);
            const newProducts = await res.json();
            if (Array.isArray(newProducts)) setProducts(prev => [...prev, ...newProducts]);
        } catch (e) {
            console.error("Load more failed:", e);
        } finally {
            setLoadingMore(false);
        }
    };

    const fetchRealProductForItem = async (item: SuggestedItem): Promise<SuggestedItem> => {
        try {
            const res = await fetch(`/api/partners?query=${encodeURIComponent(item.searchKeyword)}&start=1`);
            const products = await res.json();
            if (products && products.length > 0) return { ...item, realProduct: products[0] };
            return item;
        } catch { return item; }
    };

    const handleStep1Submit = async () => {
        if (!file || !mode) return;
        setLoading(true);
        const dispName = getNaturalName(dogName);
        setLoadingStep(`${dispName}의 매력을 분석하는 중...`);

        try {
            const base64 = await resizeImage(file);
            setPreviewUrl(base64);
            const res = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 }),
            });
            const data = await res.json();
            if (res.ok && data.concepts?.length > 0) {
                setRecommendations(data.concepts);
                if (data.personalColor) setPersonalColor(data.personalColor);
                setLoadingStep("어울리는 실제 아이템을 매칭하는 중...");
                const clothesWithReal = await Promise.all((data.suggestedClothes || []).map(fetchRealProductForItem));
                const accWithReal = await Promise.all((data.suggestedAccessories || []).map(fetchRealProductForItem));
                setSuggestedClothes(clothesWithReal);
                setSuggestedAccessories(accWithReal);
                setStep(2);
            } else throw new Error(data.details || "분석 실패");
        } catch (e: any) {
            alert(`분석 중 오류: ${e.message}`);
        } finally {
            setLoading(false);
            setLoadingStep("");
        }
    };

    const handleStartAnalysis = async () => {
        if (!file || (!style && !selectedCloth && !selectedAcc)) return;
        setLoading(true);

        try {
            const base64 = await resizeImage(file);
            let generationPrompt = "";
            let keywords: string[] = [];
            let currentShoppingTip = "";
            
            const itemImages: { cloth?: string, acc?: string } = {};

            // 1. Build Prompt Logic (Same as before)
            if (selectedCloth || selectedAcc) {
                const items = [];
                if (selectedCloth) {
                    if (selectedCloth.isUserUploaded) {
                        itemImages.cloth = selectedCloth.image;
                        items.push("the clothing in the second image");
                    } else {
                        const name = selectedCloth.realProduct?.name || selectedCloth.name;
                        if (selectedCloth.realProduct?.image) {
                            itemImages.cloth = selectedCloth.realProduct.image;
                            items.push(`the exact ${name} shown in the second image`);
                        } else items.push(name);
                        keywords.push(selectedCloth.searchKeyword || selectedCloth.name);
                    }
                }
                if (selectedAcc) {
                    if (selectedAcc.isUserUploaded) {
                        itemImages.acc = selectedAcc.image;
                        items.push(`the accessory in the ${itemImages.cloth ? 'third' : 'second'} image`);
                    } else {
                        const name = selectedAcc.realProduct?.name || selectedAcc.name;
                        if (selectedAcc.realProduct?.image) {
                            itemImages.acc = selectedAcc.realProduct.image;
                            items.push(`the exact ${name} shown in the ${itemImages.cloth ? 'third' : 'second'} image`);
                        } else items.push(name);
                        keywords.push(selectedAcc.searchKeyword || selectedAcc.name);
                    }
                }
                generationPrompt = `[VTO] precisely dress the dog in ${items.join(" and ")}`;
                currentShoppingTip = "의류와 액세서리의 조화가 아주 훌륭해요. 실루엣과 디테일을 꼼꼼하게 표현합니다.";
            } else {
                if (style === 'custom') {
                    generationPrompt = keepBackground ? `[VTO] ${customPrompt}` : `[PICTORIAL] ${customPrompt}`;
                    currentShoppingTip = "커스텀 스타일링은 아이의 개성을 가장 잘 드러낼 수 있어요.";
                } else {
                    const selectedAiConcept = recommendations.find(c => c.id === style);
                    generationPrompt = (mode === 'vto' || keepBackground) ? `[VTO] ${selectedAiConcept?.vtoOutfitEnglish}` : `[PICTORIAL] ${selectedAiConcept?.customPrompt}`;
                    keywords = selectedAiConcept?.searchKeywords || [];
                    currentShoppingTip = selectedAiConcept?.shoppingTip || "";
                }
            }

            if (userRequest.trim()) generationPrompt += `. Additionally, carefully follow this: ${userRequest}`;

            // --- PHASE 1: FAST TEXT GENERATION (2-3s) ---
            setLoadingStep("에디터가 추천사를 작성 중입니다...");
            const noteRes = await fetch("/api/styling/note", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: generationPrompt, mode, dogName })
            });
            const noteData = await noteRes.json();
            
            const selectedAiConcept = style !== 'custom' ? recommendations.find(c => c.id === style) : null;
            const currentDescription = selectedAiConcept?.description || (style === 'custom' ? "보호자님의 상상력이 담긴 특별한 커스텀 화보입니다." : "");
            const initialAnalysis = recommendations.length > 0 
                ? recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]
                : "";

            // IMMEDIATELY Transition to Step 3 with Text Only
            setResults({
                originalImage: base64,
                styledImages: [], // Initially empty
                analysis: noteData.analysis || "아이의 스타일을 분석 중입니다...",
                baseAnalysis: initialAnalysis,
                description: currentDescription,
                dogName: dogName || undefined,
                shoppingTip: currentShoppingTip,
                keywords: keywords.length > 0 ? keywords : undefined,
                personalColor: personalColor
            });
            setStep(3);

            // --- PHASE 2: BACKGROUND IMAGE GENERATION (10-15s) ---
            const query = keywords.length > 0 ? keywords.join(" ") : (style as string);
            setShoppingQuery(query);
            
            // Start fetching products and images in parallel
            const [generateRes, partnersRes] = await Promise.all([
                fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: generationPrompt, image: base64, clothImage: itemImages.cloth, accImage: itemImages.acc }),
                }),
                fetch(`/api/partners?query=${encodeURIComponent(query)}`)
            ]);

            const generateData = await generateRes.json();
            if (!generateRes.ok) throw new Error(generateData.details);

            // UPDATE Results with actual images
            setResults(prev => prev ? { ...prev, styledImages: generateData.urls } : null);
            setProducts(await partnersRes.json());
            
        } catch (e: any) {
            alert(`생성 중 오류: ${e.message}`);
            setStep(2); // Rollback on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="workflow" className="max-w-7xl mx-auto py-24 px-6">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit tracking-tight">아이의 매력을 보여주세요</h2>
                            <p className="text-[#8b7355] text-lg max-w-xl mx-auto break-keep">정면 사진을 올려주시면 도담이 가장 잘 어울리는 스타일을 찾아드릴게요.</p>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl">
                            <UploadZone onFileSelect={setFile} selectedFile={file} />
                            {file && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-10 space-y-10">
                                    <div className="text-center">
                                        <label className="block text-base font-bold text-[#5d4d3d] mb-4">아이의 소중한 이름을 알려주세요</label>
                                        <input type="text" value={dogName} onChange={(e) => setDogName(e.target.value)} placeholder="예: 두부, 별이" className="w-full px-8 py-5 rounded-[24px] border-2 border-[#fff4e6] outline-none text-center text-xl font-bold shadow-inner focus:border-pink-300 transition-all" />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-base font-bold text-[#5d4d3d] text-center">어떤 스타일링을 원하시나요?</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { id: 'pictorial', label: '감성 화보', desc: '배경과 조명까지 완벽하게', icon: Stars },
                                                { id: 'vto', label: '리얼 피팅', desc: '실제 옷을 입은 듯한 현실적 피팅', icon: Bot }
                                            ].map((m) => (
                                                <button key={m.id} onClick={() => setMode(m.id as any)} className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-start gap-4 ${mode === m.id ? "border-pink-500 bg-pink-50 shadow-lg" : "border-[#fff4e6] bg-white/50 hover:border-pink-200"}`}>
                                                    <div className={`p-3 rounded-xl ${mode === m.id ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-500"}`}><m.icon size={24} /></div>
                                                    <div><h4 className="font-bold text-[#2d241a] text-lg">{m.label}</h4><p className="text-xs text-[#8b7355] mt-1 line-clamp-2 break-keep">{m.desc}</p></div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex justify-center pt-4">
                            <button onClick={handleStep1Submit} disabled={!file || !mode || loading} className="px-16 py-5 bg-pink-500 hover:bg-pink-400 text-white rounded-[32px] font-bold text-xl disabled:opacity-50 shadow-2xl transition-all active:scale-95 flex items-center">
                                {loading ? <><Loader2 className="mr-3 animate-spin" /> {loadingStep}</> : "다음 단계로 가기"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* Mode Switcher Tabs */}
                        <div className="flex justify-center">
                            <div className="bg-[#fff4e6]/50 p-1.5 rounded-[32px] flex gap-2 border border-[#fff4e6] shadow-inner">
                                <button 
                                    onClick={() => setMode('pictorial')}
                                    className={`px-8 py-3 rounded-[24px] font-bold transition-all flex items-center gap-2 ${mode === 'pictorial' ? 'bg-white text-pink-500 shadow-md scale-105' : 'text-[#8b7355] hover:text-pink-400'}`}
                                >
                                    <Stars size={18} /> 감성 화보
                                </button>
                                <button 
                                    onClick={() => setMode('vto')}
                                    className={`px-8 py-3 rounded-[24px] font-bold transition-all flex items-center gap-2 ${mode === 'vto' ? 'bg-white text-blue-500 shadow-md scale-105' : 'text-[#8b7355] hover:text-blue-400'}`}
                                >
                                    <Bot size={18} /> 리얼 피팅
                                </button>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold text-[#2d241a] font-outfit">
                                {mode === 'pictorial' ? "화보 스타일 선택" : "스타일링 보드"}
                            </h2>
                            <p className="text-[#8b7355] text-lg">
                                {mode === 'pictorial' ? "도담이 제안하는 프리미엄 화보 컨셉을 골라보세요." : "아이에게 어울리는 조합을 직접 구성해보세요."}
                            </p>
                        </div>

                        {mode === 'pictorial' ? (
                            <PictorialStage 
                                previewUrl={previewUrl}
                                recommendations={recommendations}
                                style={style}
                                setStyle={setStyle}
                                customPrompt={customPrompt}
                                setCustomPrompt={setCustomPrompt}
                                userRequest={userRequest}
                                setUserRequest={setUserRequest}
                                keepBackground={keepBackground}
                                setKeepBackground={setKeepBackground}
                                loading={loading}
                                loadingStep={loadingStep}
                                onReset={handleReset}
                                onSubmit={handleStartAnalysis}
                            />
                        ) : (
                            <FittingStage 
                                previewUrl={previewUrl}
                                recommendations={recommendations}
                                selectedCloth={selectedCloth}
                                setSelectedCloth={setSelectedCloth}
                                selectedAcc={selectedAcc}
                                setSelectedAcc={setSelectedAcc}
                                suggestedClothes={suggestedClothes}
                                suggestedAccessories={suggestedAccessories}
                                userRequest={userRequest}
                                setUserRequest={setUserRequest}
                                keepBackground={keepBackground}
                                setKeepBackground={setKeepBackground}
                                loading={loading}
                                loadingStep={loadingStep}
                                handleItemUpload={handleItemUpload}
                                onReset={handleReset}
                                onSubmit={handleStartAnalysis}
                            />
                        )}
                    </motion.div>
                )}

                {step === 3 && results && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#2d241a] tracking-tight font-outfit">{getNaturalName(results.dogName)}의 놀라운 변신</h2>
                                <p className="text-[#8b7355] text-lg mt-2">도담이 제안하는 프리미엄 스타일링 결과입니다.</p>
                            </div>
                            <button onClick={handleReset} className="px-8 py-4 bg-white border-2 border-[#fff4e6] hover:border-pink-200 text-pink-500 rounded-full transition-all font-bold flex items-center gap-2 shadow-lg"><ArrowLeft className="w-5 h-5" /> 새로운 스타일 시도</button>
                        </div>
                        <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-8 md:p-16 border border-[#fff4e6] shadow-2xl">
                            <ResultCard 
                                originalImage={results.originalImage} 
                                styledImages={results.styledImages} 
                                analysis={results.analysis} 
                                baseAnalysis={results.baseAnalysis}
                                dogName={results.dogName} 
                                personalColor={results.personalColor}
                                onRetry={handleRetry}
                                retryCount={retryCount}
                                styleName={
                                    (selectedCloth || selectedAcc) 
                                        ? [selectedCloth?.name, selectedAcc?.name].filter(Boolean).join(" + ")
                                        : (recommendations.find(r => r.id === style)?.name || "커스텀 스타일")
                                } 
                            />
                        </div>
                        <div className="mt-16 pt-16 border-t border-[#fff4e6]">
                            <ProductRecommendation products={products} onLoadMore={handleLoadMoreProducts} loadingMore={loadingMore} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
