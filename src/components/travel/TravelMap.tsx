"use client";

import React, { useState } from 'react';
import { MapPin, Trash2, Calendar, PawPrint, Bot, Loader2, Stars, ArrowDown, CheckCircle2, Footprints, Luggage, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    title: string;
    // Enhanced Fields
    description?: string;
    imageUrl?: string;
    price?: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    bookingUrl?: string;
    source?: 'NAVER' | 'AGODA' | 'KLOOK';
    badge?: string;
}

interface TravelMapProps {
    onAddPlace: (place: Place) => void;
    itinerary: Place[];
    onRemovePlace: (id: string, index: number) => void;
    allPlaces: Place[];
    onGenerateCourse: (criteria: { days: string, people: string, dogs: string, region: string, conditions: string }) => Promise<void>;
    isLoading?: boolean;
    initialRegion?: string;
    initialPeople?: string;
    initialDogs?: string;
    onHoverPlace?: (id: string | null) => void;
    onSelectPlace?: (place: Place) => void;
}

const TravelMap: React.FC<TravelMapProps> = ({
    onAddPlace, // eslint-disable-line @typescript-eslint/no-unused-vars
    itinerary,
    onRemovePlace,
    allPlaces, // eslint-disable-line @typescript-eslint/no-unused-vars
    onGenerateCourse,
    isLoading = false,
    initialRegion = 'Gangnam',
    initialPeople = '2',
    initialDogs = '1',
    onHoverPlace,
    onSelectPlace
}) => {
    // AI Form State
    const [days] = useState('1 Day'); // eslint-disable-line @typescript-eslint/no-unused-vars
    const [people, setPeople] = useState(initialPeople);
    const [dogs, setDogs] = useState(initialDogs);
    const [region, setRegion] = useState(initialRegion);
    const [conditions] = useState(''); // eslint-disable-line @typescript-eslint/no-unused-vars

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] border-r border-white/50 shadow-2xl relative overflow-hidden text-[#1b0d12] font-sans">

            {/* Header */}
            <header className="px-6 py-5 border-b border-[#F0F0F0] bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-black flex items-center gap-2 tracking-tight text-[#1b0d12]">
                        <div className="w-9 h-9 bg-[#ee2b6c] rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                            <PawPrint className="w-5 h-5" fill="currentColor" />
                        </div>
                        <span>도담 플래너</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-[#FAFAFA]">

                {/* AI Configuration Section */}
                <div className="bg-white rounded-[28px] p-6 shadow-xl shadow-gray-100 border border-white space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold flex items-center gap-2 text-[#1b0d12]">
                            <Bot size={18} className="text-[#ee2b6c]" />
                            여행 설정
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ee2b6c]"></span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">지역</label>
                            <input
                                type="text"
                                value={region}
                                onChange={e => setRegion(e.target.value)}
                                className="w-full bg-[#F5F5F5] p-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#ee2b6c]/20 focus:bg-white transition-all outline-none text-[#1b0d12]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">인원</label>
                                <input type="number" value={people} onChange={e => setPeople(e.target.value)} className="w-full bg-[#F5F5F5] p-3 rounded-2xl text-sm font-bold text-center focus:ring-2 focus:ring-[#ee2b6c]/20 focus:bg-white transition-all outline-none text-[#1b0d12]" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-wider">반려견</label>
                                <input type="number" value={dogs} onChange={e => setDogs(e.target.value)} className="w-full bg-[#F5F5F5] p-3 rounded-2xl text-sm font-bold text-center focus:ring-2 focus:ring-[#ee2b6c]/20 focus:bg-white transition-all outline-none text-[#1b0d12]" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerateCourse({ days, people: people || '1', dogs: dogs || '1', region: region || '서울', conditions })}
                        disabled={isLoading}
                        className="w-full bg-[#1b0d12] text-white py-4 rounded-2xl font-bold hover:bg-[#ee2b6c] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#ee2b6c]/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>AI가 코스를 짜는 중...</span>
                            </>
                        ) : (
                            <>
                                <Stars size={16} fill="currentColor" />
                                <span>AI 맞춤 코스 생성하기</span>
                            </>
                        )}
                    </button>
                </div>

                {/* TRIP SUMMARY (Stitch Improvement) */}
                <AnimatePresence>
                    {itinerary.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {/* Vitality Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-[28px] border border-white shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center text-[#ee2b6c] mb-2">
                                        <Footprints size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">산책 거리</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-black text-[#1b0d12]">{(itinerary.length * 1.2).toFixed(1)}</span>
                                        <span className="text-[10px] font-bold text-gray-300">km</span>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-[28px] border border-white shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">예상 소요</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-black text-[#1b0d12]">{itinerary.length * 2}</span>
                                        <span className="text-[10px] font-bold text-gray-300">시간</span>
                                    </div>
                                </div>
                            </div>

                            {/* Packing Checklist */}
                            <div className="bg-[#1b0d12] text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Luggage size={80} />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-black flex items-center gap-2">
                                        <Luggage size={16} className="text-pink-400" />
                                        필수 준비물
                                    </h4>
                                    <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg">3/5 완료</span>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        '인식표 및 리드줄',
                                        '배변 봉투 & 물티슈',
                                        '휴대용 식기 & 물병',
                                        '반려견 전용 비상약',
                                        '즐겨먹는 간식 & 사료'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/80 group cursor-pointer hover:text-white transition-colors">
                                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${i < 3 ? 'bg-pink-500 border-pink-500' : 'border-white/20'}`}>
                                                {i < 3 && <CheckCircle2 size={12} className="text-white" />}
                                            </div>
                                            <span className={i < 3 ? 'line-through opacity-50' : ''}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Itinerary */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-lg font-extrabold text-[#1b0d12] flex items-center gap-2">
                            <Calendar size={18} className="text-[#ee2b6c]" />
                            <span>나의 여행 일정</span>
                        </h3>
                        <span className="text-[10px] font-black bg-white border border-gray-100 text-gray-400 px-3 py-1.5 rounded-full shadow-sm">{itinerary.length} PLACES</span>
                    </div>

                    <div className="space-y-4 relative pb-20">
                        {itinerary.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-dashed border-gray-200 text-gray-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MapPin size={24} className="opacity-20 text-gray-400" />
                                </div>
                                <p className="text-sm font-bold text-center text-gray-400">
                                    아직 코스가 비어있어요.
                                </p>
                                <button className="mt-4 text-[#ee2b6c] text-xs font-black hover:underline" onClick={() => document.querySelector('input')?.focus()}>
                                    여행지 입력하고 시작하기 &rarr;
                                </button>
                            </div>
                        ) : (
                            itinerary.map((place, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={`${place.id}-${index}`}
                                    className="relative flex items-start group"
                                >
                                    {/* Timeline Line */}
                                    {index < itinerary.length - 1 && (
                                        <div className="absolute left-[19px] top-[40px] bottom-[-24px] w-[2px] bg-[#F0F0F0] z-0" />
                                    )}

                                    {/* Number Badge or Time Indicator */}
                                    <div className="flex flex-col items-center mr-4 z-10 flex-shrink-0">
                                        <div className="w-10 h-10 rounded-2xl bg-white text-[#1b0d12] flex items-center justify-center text-sm font-black border border-gray-100 shadow-md shadow-gray-100 group-hover:bg-[#ee2b6c] group-hover:text-white group-hover:border-[#ee2b6c] transition-colors duration-300">
                                            {index + 1}
                                        </div>
                                        {place.visitTime && (
                                            <div className="mt-2 text-[10px] font-black text-[#ee2b6c] bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                                                {place.visitTime}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card */}
                                    <div
                                        className="flex-1 bg-white p-5 rounded-[32px] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(238,43,108,0.15)] transition-all cursor-pointer group hover:-translate-y-1"
                                        onMouseEnter={() => onHoverPlace?.(place.id)}
                                        onMouseLeave={() => onHoverPlace?.(null)}
                                        onClick={() => onSelectPlace?.(place)}
                                    >
                                        {/* Badges */}
                                        <div className="flex gap-2 mb-3">
                                            {(place.source === 'AGODA' || place.source === 'KLOOK') && (
                                                <div className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wide ${place.source === 'AGODA' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {place.badge || (place.source === 'AGODA' ? 'AGODA' : 'KLOOK')}
                                                </div>
                                            )}
                                            {place.source === 'NAVER' && (
                                                <div className="bg-[#03C75A]/10 text-[#03C75A] text-[9px] font-black px-2 py-1 rounded-lg">NAVER</div>
                                            )}
                                            {place.category && (
                                                <div className="bg-gray-50 text-gray-500 text-[9px] font-bold px-2 py-1 rounded-lg line-clamp-1">{place.category}</div>
                                            )}
                                        </div>

                                        {/* Title & Remove */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-base font-black text-[#1b0d12] line-clamp-1 leading-tight group-hover:text-[#ee2b6c] transition-colors">
                                                {place.displayTitle || place.name}
                                            </h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemovePlace(place.id, index); }}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-bold mb-3 line-clamp-1 flex items-center gap-1">
                                            <MapPin size={10} /> {place.address}
                                        </p>

                                        {/* Gemini's Reason (Description) */}
                                        {place.description && place.source === 'NAVER' && (
                                            <div className="mb-4 text-xs font-medium text-[#5d4d3d] bg-stone-50 p-3 rounded-2xl border border-stone-100 leading-relaxed italic">
                                                &quot;{place.description}&quot;
                                            </div>
                                        )}

                                        {/* Pet Tip Section */}
                                        {place.petTip && (
                                            <div className="mb-4 flex items-center gap-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-100/50">
                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#ee2b6c] shadow-sm">
                                                    <Sparkles size={12} fill="currentColor" />
                                                </div>
                                                <p className="text-[11px] font-bold text-[#ee2b6c]">{place.petTip}</p>
                                            </div>
                                        )}

                                        {/* Image Area */}
                                        {place.imageUrl && (
                                                                                                <div className="w-full h-32 mb-4 rounded-2xl overflow-hidden relative group-hover:shadow-md transition-all bg-gray-100">
                                                                                                    <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                                                                                    {place.originalPrice && place.price && (
                                                                                                        <div className="absolute top-2 left-2 bg-[#ee2b6c] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                                                                                                            {Math.round((place.originalPrice - place.price) / place.originalPrice * 100)}% OFF
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>                                        )}

                                        {/* Price or Action */}
                                        {place.price ? (
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex flex-col">
                                                    {place.originalPrice && <span className="text-[10px] text-gray-300 line-through font-bold">₩{place.originalPrice.toLocaleString()}</span>}
                                                    <span className="text-[#1b0d12] text-lg font-black">₩{place.price.toLocaleString()}</span>
                                                </div>
                                                {place.bookingUrl && (
                                                    <a
                                                        href={place.bookingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="px-4 py-2 bg-[#1b0d12] text-white text-xs font-bold rounded-xl hover:bg-[#ee2b6c] transition-colors shadow-lg hover:shadow-[#ee2b6c]/30"
                                                    >
                                                        예약
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400 font-bold">상세 정보 확인</span>
                                                <ArrowDown size={14} className="text-gray-300 -rotate-90 group-hover:text-[#ee2b6c] transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* AI CONCIERGE FLOATING BUTTON (Stitch Improvement) */}
            <div className="absolute bottom-6 right-6 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-[#ee2b6c] text-white rounded-full shadow-2xl flex items-center justify-center group relative"
                >
                    <Bot size={28} />
                    <span className="absolute right-full mr-4 px-4 py-2 bg-white text-[#1b0d12] text-xs font-black rounded-2xl shadow-xl border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        무엇을 도와드릴까요? 🐶
                    </span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                </motion.button>
            </div>
        </div>
    );
};

export default TravelMap;
