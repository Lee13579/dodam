"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Shirt, Wand2, X, Check, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { AiConcept, SuggestedItem } from "@/types";

interface FittingStageProps {
    previewUrl: string | null;
    recommendations: AiConcept[];
    selectedCloth: SuggestedItem | null;
    setSelectedCloth: (item: SuggestedItem | null) => void;
    selectedAcc: SuggestedItem | null;
    setSelectedAcc: (item: SuggestedItem | null) => void;
    suggestedClothes: SuggestedItem[];
    suggestedAccessories: SuggestedItem[];
    userRequest: string;
    setUserRequest: (request: string) => void;
    keepBackground: boolean;
    setKeepBackground: (keep: boolean) => void;
    loading: boolean;
    loadingStep: string;
    handleItemUpload: (type: 'cloth' | 'acc', e: React.ChangeEvent<HTMLInputElement>) => void;
    onReset: () => void;
    onSubmit: () => void;
}

export default function FittingStage({
    previewUrl,
    recommendations,
    selectedCloth,
    setSelectedCloth,
    selectedAcc,
    setSelectedAcc,
    suggestedClothes,
    suggestedAccessories,
    userRequest,
    setUserRequest,
    keepBackground,
    setKeepBackground,
    loading,
    loadingStep,
    handleItemUpload,
    onReset,
    onSubmit
}: FittingStageProps) {
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

    return (
        <div className="space-y-12">
            {/* Styling Board: Dog (Left) | Cloth + Acc (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left: Base Model (Dog) */}
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
                                    <p className="text-[#5d4d3d] text-lg font-bold leading-relaxed break-keep tracking-tight text-center">
                                        &quot;{recommendations[0].koreanAnalysis.replace(/^\d+[\.\)]\s*/, '').split('.')[0]}.&quot;
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right: Item Slots + Action Panel */}
                <div className="lg:col-span-6 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cloth Slot */}
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

                        {/* Acc Slot */}
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
                            <label className="block text-sm font-bold text-[#8b7355] text-center mb-2 flex items-center justify-center gap-2">
                                <Sparkles size={14} className="text-pink-500" /> 추가 요청사항이 있으신가요?
                            </label>
                            <input type="text" value={userRequest} onChange={(e) => setUserRequest(e.target.value)} placeholder="예: 조금 더 화려하게 해주세요" className="w-full px-6 py-4 rounded-full border-2 border-white bg-white/50 focus:border-pink-300 outline-none text-center text-[#2d241a] font-medium transition-all shadow-inner" />
                        </div>
                        <div className="flex flex-row gap-4 w-full px-8">
                            <button onClick={onReset} className="flex-1 px-4 py-4 rounded-[32px] font-bold text-[#8b7355] border-2 border-[#fff4e6] hover:bg-white transition-all font-outfit bg-white/50 h-[68px] text-sm opacity-80">다시 업로드</button>
                            <button onClick={onSubmit} disabled={loading || (!selectedCloth && !selectedAcc)} className="flex-[2] px-6 py-5 rounded-[32px] font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all disabled:opacity-50 shadow-2xl text-lg h-[68px] flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="text-sm">{loadingStep}</span></> : <span className="truncate">{(selectedCloth || selectedAcc) ? "스타일링 적용" : "아이템 선택"}</span>}
                            </button>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group py-2 px-6 rounded-full hover:bg-white/40 transition-all border border-transparent hover:border-pink-100">
                            <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="w-5 h-5 rounded-md border-2 border-pink-300 checked:bg-pink-500 transition-all cursor-pointer accent-pink-500" />
                            <span className="text-[#8b7355] font-bold group-hover:text-pink-500 transition-colors select-none text-sm">원본 사진 배경 유지하기</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Item Lists */}
            <div className="space-y-16 mt-16 pt-16 border-t border-[#fff4e6]">
                {/* Clothes List */}
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
                                        <h4 className="text-white text-lg font-bold line-clamp-2 mb-1 leading-tight">{item.name}</h4>
                                        <p className="text-white/80 text-xs leading-snug break-keep font-medium">{item.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Accessories List */}
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
                                        <h4 className="text-white text-lg font-bold line-clamp-2 mb-1 leading-tight">{item.name}</h4>
                                        <p className="text-white/80 text-xs leading-snug break-keep font-medium">{item.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
