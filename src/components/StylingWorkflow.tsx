"use client";

import { useState, useRef } from "react";
import UploadZone from "./UploadZone";
import StyleSelector from "./StyleSelector";
import ResultCard from "./ResultCard";
import ProductRecommendation from "./ProductRecommendation";
import { DogStyle, Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Stars, Bot, Shirt, Wand2, Camera, X, Check, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { getNaturalName } from "@/lib/utils";

interface StylingWorkflowProps {
    step: number;
    setStep: (step: number) => void;
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
    const [dogName, setDogName] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [userRequest, setUserRequest] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [results, setResults] = useState<any | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [suggestedClothes, setSuggestedClothes] = useState<any[]>([]);
    const [suggestedAccessories, setSuggestedAccessories] = useState<any[]>([]);
    
    // Scroll Refs
    const clothScrollRef = useRef<HTMLDivElement>(null);
    const accScrollRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (!ref.current) return;
        const scrollAmount = 400;
        ref.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // Selection state for VTO
    const [selectedCloth, setSelectedCloth] = useState<any | null>(null);
    const [selectedAcc, setSelectedAcc] = useState<any | null>(null);
    
    const [shoppingQuery, setShoppingQuery] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);

    const handleItemUpload = async (type: 'cloth' | 'acc', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await resizeImage(file, 512);
        const customItem = { id: `custom-${type}-${Date.now()}`, image: base64, name: type === 'cloth' ? "나의 옷" : "나의 소품", isUserUploaded: true };
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

    const fetchRealProductForItem = async (item: any) => {
        try {
            const res = await fetch(`/api/partners?query=${encodeURIComponent(item.searchKeyword)}&start=1`);
            const products = await res.json();
            if (products && products.length > 0) return { ...item, realProduct: products[0] };
            return item;
        } catch (_) { return item; }
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
            let analysis = "";
            let keywords: string[] = [];
            let currentShoppingTip = "";
            
            const itemImages: { cloth?: string, acc?: string } = {};

            if (selectedCloth || selectedAcc) {
                const items = [];
                if (selectedCloth) {
                    if (selectedCloth.isUserUploaded) {
                        itemImages.cloth = selectedCloth.image;
                        items.push("the clothing in the second image");
                    } else {
                        const name = selectedCloth.realProduct?.name || selectedCloth.name;
                        // Pass the curated product image to AI for exact matching
                        if (selectedCloth.realProduct?.image) {
                            itemImages.cloth = selectedCloth.realProduct.image;
                            items.push(`the exact ${name} shown in the second image`);
                        } else {
                            items.push(name);
                        }
                        keywords.push(selectedCloth.searchKeyword || selectedCloth.name);
                    }
                }
                if (selectedAcc) {
                    if (selectedAcc.isUserUploaded) {
                        itemImages.acc = selectedAcc.image;
                        items.push(`the accessory in the ${itemImages.cloth ? 'third' : 'second'} image`);
                    } else {
                        const name = selectedAcc.realProduct?.name || selectedAcc.name;
                        // Pass the curated accessory image to AI for exact matching
                        if (selectedAcc.realProduct?.image) {
                            itemImages.acc = selectedAcc.realProduct.image;
                            items.push(`the exact ${name} shown in the ${itemImages.cloth ? 'third' : 'second'} image`);
                        } else {
                            items.push(name);
                        }
                        keywords.push(selectedAcc.searchKeyword || selectedAcc.name);
                    }
                }

                generationPrompt = `[VTO] precisely dress the dog in ${items.join(" and ")}`;
                if (userRequest.trim()) {
                    generationPrompt += `. Additionally, please follow this user request: ${userRequest}`;
                }
                analysis = `${items.join(", ")}을(를) 활용한 완벽한 셋업 스타일링입니다. 아이의 개성을 최대한 살려 피팅해 드려요.`;
                currentShoppingTip = "의류와 액세서리의 조화가 아주 훌륭해요. 실루엣과 디테일을 꼼꼼하게 표현합니다.";
            } else {
                // PICTORIAL MODE LOGIC
                if (style === 'custom') {
                    // Use user's custom text
                    if (keepBackground) generationPrompt = `[VTO] ${customPrompt}`;
                    else generationPrompt = `[PICTORIAL] ${customPrompt}`;
                    analysis = `보호자님이 직접 그려주신 "${customPrompt}" 스타일로 변신을 시작합니다.`;
                    currentShoppingTip = "커스텀 스타일링은 아이의 개성을 가장 잘 드러낼 수 있어요.";
                } else {
                    const selectedAiConcept = recommendations.find(c => c.id === style);
                    if (mode === 'vto' || keepBackground) generationPrompt = `[VTO] ${selectedAiConcept.vtoOutfitEnglish}`;
                    else generationPrompt = `[PICTORIAL] ${selectedAiConcept.customPrompt}`;
                    analysis = selectedAiConcept.koreanAnalysis;
                    keywords = selectedAiConcept.searchKeywords || [];
                    currentShoppingTip = selectedAiConcept.shoppingTip;
                }

                // Always append extra user requests if present
                if (userRequest.trim()) {
                    generationPrompt += `. Additionally, carefully follow this request: ${userRequest}`;
                }
            }

            setLoadingStep("아이의 새로운 모습을 그리는 중...");
            const generateRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt: generationPrompt, 
                    image: base64, 
                    clothImage: itemImages.cloth,
                    accImage: itemImages.acc
                }),
            });
            const generateData = await generateRes.json();
            if (!generateRes.ok) throw new Error(generateData.details);

            const query = keywords.length > 0 ? keywords.join(" ") : (style as string);
            setShoppingQuery(query);
            const partnersRes = await fetch(`/api/partners?query=${encodeURIComponent(query)}`);
            
            // Get description from the selected concept
            const selectedAiConcept = style !== 'custom' ? recommendations.find(c => c.id === style) : null;
            const currentDescription = selectedAiConcept?.description || (style === 'custom' ? "보호자님의 상상력이 담긴 특별한 커스텀 화보입니다." : "");

            setResults({
                originalImage: base64,
                styledImages: generateData.urls,
                analysis,
                description: currentDescription, // Pass the description
                dogName: dogName || undefined,
                shoppingTip: currentShoppingTip 
            });
            setProducts(await partnersRes.json());
            setStep(3);
        } catch (e: any) {
            alert(`생성 중 오류: ${e.message}`);
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
                            /* PICTORIAL MODE: Focus on Style Concepts */
                            <div className="space-y-16">
                                {/* Photo + Analysis Header - Side by Side Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center max-w-5xl mx-auto px-6">
                                    <div className="md:col-span-6 flex justify-center md:justify-end">
                                        <div className="relative w-full aspect-[3/4] max-w-[320px] rounded-[48px] overflow-hidden z-0 border-8 border-white shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                                            {previewUrl && <img src={previewUrl} alt="Dog preview" className="w-full h-full object-cover" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                    
                                    <div className="md:col-span-6 flex justify-center md:justify-start">
                                        {recommendations.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }} 
                                                animate={{ opacity: 1, x: 0 }} 
                                                className="max-w-[380px] w-full relative"
                                            >
                                                {/* Notepad Design - Side by side with photo */}
                                                <div className="relative bg-[#FFFEF9] p-10 rounded-sm shadow-2xl border-l-[6px] border-pink-200 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                                                    {/* Pin Decoration - Top Center */}
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-stone-100">
                                                        <div className="w-3 h-3 bg-pink-400 rounded-full shadow-inner" />
                                                    </div>
                                                    
                                                    <div className="space-y-4 mt-2">
                                                        <p className="text-[#5d4d3d] text-xl font-bold leading-relaxed break-keep tracking-tight text-center">
                                                            &quot;{recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]}.&quot;
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/40 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl">
                                    <StyleSelector selectedStyle={style} onSelect={setStyle} recommendations={recommendations} onRegenerate={() => {}} regenerating={false} />
                                    {style === 'custom' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="max-w-2xl mx-auto space-y-4 mt-12">
                                            <label className="block text-xl font-bold text-[#2d241a] font-outfit flex items-center gap-2"><Stars className="text-pink-500 fill-pink-500 w-5 h-5" />나만의 커스텀 스타일 제안</label>
                                            <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="예: 전통 한복을 입은 귀여운 도령님..." className="w-full h-40 px-6 py-5 rounded-[32px] border-2 border-[#fff4e6] outline-none resize-none text-lg bg-white/50 text-[#2d241a] font-medium leading-relaxed" />
                                        </motion.div>
                                    )}
                                </div>

                                <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 py-10 bg-white/40 backdrop-blur-xl rounded-[40px] border border-[#fff4e6] shadow-xl">
                                    <div className="w-full px-10 space-y-4">
                                                                        <label className="block text-sm font-bold text-[#8b7355] text-center mb-2 flex items-center justify-center gap-2">
                                                                            화보에 담고 싶은 추가 요청사항
                                                                        </label>
                                        
                                        <input 
                                            type="text" 
                                            value={userRequest}
                                            onChange={(e) => setUserRequest(e.target.value)}
                                            placeholder="예: 배경을 조금 더 화사하게 해주세요"
                                            className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/50 focus:border-pink-300 outline-none text-center text-[#2d241a] font-medium transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="flex flex-row gap-4 w-full px-10">
                                        <button onClick={handleReset} className="flex-1 px-4 py-4 rounded-[32px] font-bold text-[#8b7355] border-2 border-[#fff4e6] hover:bg-white transition-all font-outfit bg-white/50 h-[68px] text-sm opacity-80">다시 업로드</button>
                                        <button 
                                            onClick={handleStartAnalysis} 
                                            disabled={loading || (!style && !selectedCloth && !selectedAcc) || (style === 'custom' && !customPrompt.trim())} 
                                            className="flex-[2] px-6 py-5 rounded-[32px] font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-50 shadow-2xl text-lg h-[68px] flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" /> 
                                                    <span className="text-sm">{loadingStep}</span>
                                                </>
                                            ) : (
                                                <span className="truncate">{style ? "화보 생성하기" : "스타일을 선택해주세요"}</span>
                                            )}
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group py-2 px-6 rounded-full hover:bg-white/40 transition-all border border-transparent hover:border-pink-100">
                                        <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="w-5 h-5 rounded-md border-2 border-pink-300 checked:bg-pink-500 transition-all cursor-pointer accent-pink-500" />
                                        <span className="text-[#8b7355] font-bold group-hover:text-pink-500 transition-colors select-none text-sm">원본 사진 배경 유지하기</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            /* VTO MODE: Focus on Curation & Slots */
                            <div className="space-y-12">
                                {/* Styling Board: Dog (Left) | Cloth + Acc (Right) */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                    {/* Left: Base Model (Dog) - 3:4 Ratio */}
                                    <div className="lg:col-span-6 flex flex-col items-center justify-center">
                                        <div className="relative w-full aspect-[3/4] max-w-[420px] rounded-[56px] overflow-hidden z-0">
                                            {previewUrl && <img src={previewUrl} alt="Dog preview" className="w-full h-full object-cover" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                                        </div>
                                        {recommendations.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[420px] w-full -mt-12 z-10 relative px-6">
                                                <div className="relative bg-[#FFFEF9] p-8 rounded-sm shadow-2xl border-l-[6px] border-pink-200 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-stone-100">
                                                        <div className="w-3 h-3 bg-pink-400 rounded-full shadow-inner" />
                                                    </div>
                                                    <div className="space-y-3 mt-2">
                                                        <p className="text-[#5d4d3d] text-lg font-bold leading-relaxed break-keep tracking-tight text-center">&quot;{recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]}.&quot;</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Right: Item Slots + Action Panel */}
                                    <div className="lg:col-span-6 flex flex-col gap-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={`relative group rounded-[48px] border-4 transition-all aspect-[3/4] flex flex-col items-center justify-center overflow-hidden bg-white shadow-xl ${selectedCloth ? 'border-pink-500' : 'border-dashed border-pink-200'}`}>
                                                {selectedCloth ? (
                                                    <div className="w-full h-full relative">
                                                        <img src={selectedCloth.image || selectedCloth.realProduct?.image} className="w-full h-full object-cover" alt="Selected Cloth" />
                                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                                                        <button onClick={() => setSelectedCloth(null)} className="absolute top-6 right-6 p-2.5 bg-white/90 rounded-full text-stone-500 hover:text-red-500 shadow-lg transition-all"><X size={20} /></button>
                                                        <div className="absolute bottom-8 inset-x-8 text-center">
                                                            <span className="bg-pink-500 text-white px-6 py-2.5 rounded-full text-sm font-black shadow-lg uppercase tracking-wider">의류 큐레이션</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-pink-50/50 transition-colors">
                                                        <input type="file" className="hidden" onChange={(e) => handleItemUpload('cloth', e)} accept="image/*" />
                                                        <div className="w-20 h-20 rounded-3xl bg-pink-50 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform"><Shirt size={40} /></div>
                                                        <p className="font-black text-[#5d4d3d] text-2xl mb-2">의류 큐레이션</p>
                                                        <p className="text-base text-[#8b7355] text-center leading-relaxed font-medium">아래에서 선택하거나<br/>클릭해서 직접 업로드</p>
                                                    </label>
                                                )}
                                            </div>
                                            <div className={`relative group rounded-[48px] border-4 transition-all aspect-[3/4] flex flex-col items-center justify-center overflow-hidden bg-white shadow-xl ${selectedAcc ? 'border-blue-500' : 'border-dashed border-blue-200'}`}>
                                                {selectedAcc ? (
                                                    <div className="w-full h-full relative">
                                                        <img src={selectedAcc.image || selectedAcc.realProduct?.image} className="w-full h-full object-cover" alt="Selected Acc" />
                                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                                                        <button onClick={() => setSelectedAcc(null)} className="absolute top-6 right-6 p-2.5 bg-white/90 rounded-full text-stone-500 hover:text-red-500 shadow-lg transition-all"><X size={20} /></button>
                                                        <div className="absolute bottom-8 inset-x-8 text-center">
                                                            <span className="bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-black shadow-lg uppercase tracking-wider">액세서리 큐레이션</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-blue-50/50 transition-colors">
                                                        <input type="file" className="hidden" onChange={(e) => handleItemUpload('acc', e)} accept="image/*" />
                                                        <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"><Wand2 size={40} /></div>
                                                        <p className="font-black text-[#5d4d3d] text-2xl mb-2">액세서리 큐레이션</p>
                                                        <p className="text-base text-[#8b7355] text-center leading-relaxed font-medium">아래에서 선택하거나<br/>클릭해서 직접 업로드</p>
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full flex flex-col items-center gap-6 py-8 bg-white/40 backdrop-blur-xl rounded-[40px] border border-[#fff4e6] shadow-xl">
                                            <div className="w-full px-8 space-y-4">
                                                <label className="block text-sm font-bold text-[#8b7355] text-center mb-2 flex items-center justify-center gap-2"><Sparkles size={14} className="text-pink-500" /> 추가 요청사항이 있으신가요?</label>
                                                <input type="text" value={userRequest} onChange={(e) => setUserRequest(e.target.value)} placeholder="예: 조금 더 화려하게 해주세요" className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/50 focus:border-pink-300 outline-none text-center text-[#2d241a] font-medium transition-all shadow-inner" />
                                            </div>
                                            <div className="flex flex-row gap-4 w-full px-8">
                                                <button onClick={handleReset} className="flex-1 px-4 py-4 rounded-[32px] font-bold text-[#8b7355] border-2 border-[#fff4e6] hover:bg-white transition-all font-outfit bg-white/50 h-[68px] text-sm opacity-80">다시 업로드</button>
                                                <button onClick={handleStartAnalysis} disabled={loading || (!style && !selectedCloth && !selectedAcc) || (style === 'custom' && !customPrompt.trim())} className="flex-[2] px-6 py-5 rounded-[32px] font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-50 shadow-2xl text-lg h-[68px] flex items-center justify-center gap-2">
                                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="text-sm">{loadingStep}</span></> : <span className="truncate">{(style || selectedCloth || selectedAcc) ? "스타일링 적용" : "아이템 선택"}</span>}
                                                </button>
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer group py-2 px-6 rounded-full hover:bg-white/40 transition-all border border-transparent hover:border-pink-100">
                                                <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="w-5 h-5 rounded-md border-2 border-pink-300 checked:bg-pink-500 transition-all cursor-pointer accent-pink-500" />
                                                <span className="text-[#8b7355] font-bold group-hover:text-pink-500 transition-colors select-none text-sm">원본 사진 배경 유지하기</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-16 mt-16 pt-16 border-t border-[#fff4e6]">
                                    <div className="space-y-8 relative group/list">
                                        <div className="flex items-center gap-3 justify-center">
                                            <Shirt className="text-pink-500 w-6 h-6" />
                                            <h3 className="text-xl font-bold text-[#5d4d3d]">의류 <span className="text-pink-500">큐레이션</span></h3>
                                        </div>
                                        <div className="relative px-14">
                                            <button onClick={() => scroll(clothScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white hover:bg-pink-50 text-pink-500 rounded-full shadow-xl border-2 border-pink-100 transition-all active:scale-90"><ChevronLeft size={28} strokeWidth={3} /></button>
                                            <button onClick={() => scroll(clothScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white hover:bg-pink-50 text-pink-500 rounded-full shadow-xl border-2 border-pink-100 transition-all active:scale-90"><ChevronRight size={28} strokeWidth={3} /></button>
                                            <div ref={clothScrollRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth px-2">
                                                {suggestedClothes.map((item) => (
                                                    <button key={item.id} onClick={() => setSelectedCloth(selectedCloth?.id === item.id ? null : item)} className={`flex-shrink-0 w-80 aspect-[3/4] bg-stone-100 rounded-[40px] border-2 transition-all text-left group shadow-sm overflow-hidden relative ${selectedCloth?.id === item.id ? 'border-pink-500 ring-4 ring-pink-100' : 'border-[#fff4e6] hover:border-pink-300'}`}>
                                                        {item.realProduct?.image ? <img src={item.realProduct.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Shirt size={48} /></div>}
                                                        {selectedCloth?.id === item.id && <div className="absolute top-6 left-6 bg-pink-500 text-white p-2 rounded-full z-10"><Check size={20} strokeWidth={3} /></div>}
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12">
                                                            <div className="flex gap-1.5 mb-2">{item.realProduct?.mallName && <span className="bg-white/20 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-bold">{item.realProduct.mallName}</span>}</div>
                                                            <h4 className="text-white text-lg font-bold line-clamp-1 mb-1">{item.name}</h4>
                                                            <p className="text-white/80 text-xs leading-snug break-keep font-medium">{item.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-8 relative group/list">
                                        <div className="flex items-center gap-3 justify-center">
                                            <Wand2 className="text-blue-500 w-6 h-6" />
                                            <h3 className="text-xl font-bold text-[#5d4d3d]">액세서리 <span className="text-pink-500">큐레이션</span></h3>
                                        </div>
                                        <div className="relative px-14">
                                            <button onClick={() => scroll(accScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white hover:bg-pink-50 text-pink-500 rounded-full shadow-xl border-2 border-pink-100 transition-all active:scale-90"><ChevronLeft size={28} strokeWidth={3} /></button>
                                            <button onClick={() => scroll(accScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white hover:bg-pink-50 text-pink-500 rounded-full shadow-xl border-2 border-pink-100 transition-all active:scale-90"><ChevronRight size={28} strokeWidth={3} /></button>
                                            <div ref={accScrollRef} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth px-2">
                                                {suggestedAccessories.map((item) => (
                                                    <button key={item.id} onClick={() => setSelectedAcc(selectedAcc?.id === item.id ? null : item)} className={`flex-shrink-0 w-80 aspect-[3/4] bg-stone-100 rounded-[40px] border-2 transition-all text-left group shadow-sm overflow-hidden relative ${selectedAcc?.id === item.id ? 'border-blue-500 ring-4 ring-blue-100' : 'border-[#fff4e6] hover:border-blue-300'}`}>
                                                        {item.realProduct?.image ? <img src={item.realProduct.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Wand2 size={48} /></div>}
                                                        {selectedAcc?.id === item.id && <div className="absolute top-6 left-6 bg-blue-500 text-white p-2 rounded-full z-10"><Check size={20} strokeWidth={3} /></div>}
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12">
                                                            <div className="flex gap-1.5 mb-2">{item.realProduct?.mallName && <span className="bg-white/20 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-bold">{item.realProduct.mallName}</span>}</div>
                                                            <h4 className="text-white text-lg font-bold line-clamp-1 mb-1">{item.name}</h4>
                                                            <p className="text-white/80 text-xs leading-snug break-keep font-medium">{item.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                description={results.description} // Pass description here
                                shoppingTip={results.shoppingTip} 
                                dogName={results.dogName} 
                                styleName={
                                    (selectedCloth || selectedAcc) 
                                        ? [selectedCloth?.name, selectedAcc?.name].filter(Boolean).join(" + ")
                                        : (recommendations.find(r => r.id === style)?.name || "커스텀 스타일")
                                } 
                            />
                        </div>
                        <div className="mt-16 pt-16 border-t border-[#fff4e6]">
                            <ProductRecommendation products={products} shoppingTip={results.shoppingTip} onLoadMore={handleLoadMoreProducts} loadingMore={loadingMore} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
