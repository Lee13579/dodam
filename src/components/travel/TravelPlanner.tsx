"use client";

import React, { useState } from 'react';
import { Search, MapPin, Plus, Trash2, Calendar, PawPrint, Coffee, Utensils, Hotel, Trees, ArrowDown, Bot, Loader2, Stars } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


// Re-defining Place here to avoid circular dependencies if page isn't ready
export interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    title: string;
}

interface TravelPlannerProps {
    onAddPlace: (place: Place) => void;
    itinerary: Place[];
    onRemovePlace: (id: string, index: number) => void; // Changed to accept index for duplicates
    allPlaces: Place[];
    onGenerateCourse: (criteria: { days: string, people: string, dogs: string, region: string, conditions: string }) => Promise<void>;
    isLoading?: boolean;
    initialRegion?: string;
    initialPeople?: string;
    initialDogs?: string;
    onHoverPlace?: (id: string | null) => void;
}

const TravelPlanner: React.FC<TravelPlannerProps> = ({
    onAddPlace,
    itinerary,
    onRemovePlace,
    allPlaces,
    onGenerateCourse,
    isLoading = false,
    initialRegion = 'Gangnam',
    initialPeople = '2',
    initialDogs = '1',
    onHoverPlace
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // AI Form State
    const [days, setDays] = useState('1 Day');
    const [people, setPeople] = useState(initialPeople);
    const [dogs, setDogs] = useState(initialDogs);
    const [region, setRegion] = useState(initialRegion);
    const [conditions, setConditions] = useState('');
    const [showAIForm, setShowAIForm] = useState(true); // Default to true when coming from search

    const categories = [
        { id: 'Hotel', icon: Hotel, label: 'Sleep' },
        { id: 'Restaurant', icon: Utensils, label: 'Eat' },
        { id: 'Cafe', icon: Coffee, label: 'Cafe' },
        { id: 'Park', icon: Trees, label: 'Play' },
    ];

    const filteredPlaces = allPlaces.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Hotel': return <Hotel size={16} />;
            case 'Restaurant': return <Utensils size={16} />;
            case 'Cafe': return <Coffee size={16} />;
            case 'Park': return <Trees size={16} />;
            default: return <MapPin size={16} />;
        }
    };

    const addRecommendedCourse = () => {
        // Example: "Gangnam Date Course"
        const courseIds = ['r1', 'c1', 'p1']; // BBQ -> Cafe -> Forest
        courseIds.forEach(id => {
            const place = allPlaces.find(p => p.id === id);
            if (place) onAddPlace(place);
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#fffdfa] border-r border-[#efebe8] shadow-2xl relative">
            <header className="p-8 border-b border-[#efebe8] bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 text-[#2D241A] font-outfit tracking-tighter">
                        <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white rotate-3 shadow-lg shadow-pink-200">
                            <PawPrint className="w-6 h-6" />
                        </div>
                        <span className="bg-gradient-to-br from-[#2D241A] to-[#8B7355] bg-clip-text text-transparent">도담여행</span>
                    </h1>
                </div>
                <p className="text-xs font-medium text-[#8B7355] opacity-70 leading-relaxed uppercase tracking-widest">
                    AI-Powered Pet Course Designer
                </p>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-gradient-to-b from-white to-[#fffdfa]">
                {/* AI Planner Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-bold text-[#2D241A] flex items-center gap-2">
                            AI 코스 메이커
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                        </h3>
                        <button
                            onClick={() => setShowAIForm(!showAIForm)}
                            className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors bg-pink-50 px-3 py-1 rounded-full"
                        >
                            {showAIForm ? '접기' : '열기'}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {showAIForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-stone-200/50 border border-[#fff4e6] space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider ml-1">여행 기간</label>
                                            <select
                                                value={days}
                                                onChange={e => setDays(e.target.value)}
                                                className="w-full bg-stone-50 p-3 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option>당일 여행</option>
                                                <option>1박 2일</option>
                                                <option>2박 3일</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider ml-1">지역</label>
                                            <input
                                                type="text"
                                                value={region}
                                                onChange={e => setRegion(e.target.value)}
                                                className="w-full bg-stone-50 p-3 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                                                placeholder="예: 강남, 제주"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider ml-1">동반 인원</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={people}
                                                    onChange={e => setPeople(e.target.value)}
                                                    className="w-full bg-stone-50 p-3 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-pink-100 outline-none"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">명</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider ml-1">반려견 수</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={dogs}
                                                    onChange={e => setDogs(e.target.value)}
                                                    className="w-full bg-stone-50 p-3 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-pink-100 outline-none"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400">마리</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider ml-1">나만의 특별한 조건</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={conditions}
                                                onChange={e => setConditions(e.target.value)}
                                                className="w-full bg-stone-50 p-4 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-pink-100 outline-none pr-12 placeholder:text-stone-300"
                                                placeholder="예: 바다가 보이는 조용한 카페"
                                            />
                                            <Stars className="w-4 h-4 text-pink-300 absolute right-4 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onGenerateCourse({ days, people: people || '1', dogs: dogs || '1', region: region || '서울', conditions })}
                                        disabled={isLoading}
                                        className="w-full bg-[#1c1917] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-200 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                                                <span className="bg-gradient-to-r from-pink-300 to-white bg-clip-text text-transparent">AI가 코스를 설계 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="relative z-10">맞춤형 여행 코스 생성</span>
                                                <Stars className="w-4 h-4 text-pink-400 group-hover:rotate-180 transition-transform relative z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Categories & Search */}
                <div className="space-y-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-pink-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="직접 장소 찾아보기..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-stone-100 text-sm font-medium outline-none focus:ring-4 focus:ring-pink-500/5 focus:border-pink-200 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all ${!selectedCategory
                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-100'
                                : 'bg-white border border-stone-100 text-stone-500 hover:bg-stone-50'
                                }`}
                        >
                            전체
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${selectedCategory === cat.id
                                    ? 'bg-stone-900 text-white shadow-lg'
                                    : 'bg-white border border-stone-100 text-stone-500 hover:bg-stone-50'
                                    }`}
                            >
                                <cat.icon size={14} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                        {filteredPlaces.length === 0 ? (
                            <div className="text-center py-10 text-stone-300 text-sm italic">
                                검색 결과가 없어요
                            </div>
                        ) : (
                            filteredPlaces.map(place => (
                                <motion.div
                                    layout
                                    key={place.id}
                                    className="group bg-white p-4 rounded-2xl border border-stone-100 hover:border-pink-100 hover:shadow-xl hover:shadow-stone-200/50 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-400 group-hover:bg-pink-50 group-hover:text-pink-500 flex items-center justify-center transition-colors">
                                            {getCategoryIcon(place.category)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#2d241a] group-hover:text-pink-600 transition-colors">{place.name}</h4>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5">{place.category} • {place.address.split(' ')[1] || 'SEOUL'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onAddPlace(place)}
                                        className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 hover:bg-pink-500 hover:text-white flex items-center justify-center transition-all transform active:scale-90"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Itinerary */}
                <section className="pt-4">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-lg font-bold text-[#2d241a] flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm shadow-inner">
                                <Calendar size={16} />
                            </span>
                            오늘의 코스
                        </h3>
                        <span className="text-[10px] font-extrabold bg-stone-100 text-stone-400 px-3 py-1 rounded-full">{itinerary.length} STOPS</span>
                    </div>

                    <div className="space-y-4 relative pb-10">
                        {itinerary.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-stone-50/50 rounded-[40px] border-2 border-dashed border-stone-100 text-stone-300">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <MapPin size={28} className="opacity-20 translate-y-[-2px]" />
                                </div>
                                <p className="text-sm font-medium text-center leading-relaxed">
                                    아이와 함께 떠날<br />
                                    <span className="text-pink-500">완벽한 코스</span>를 만들어보세요!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-0 relative">
                                {itinerary.map((place, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={`${place.id}-${index}`}
                                        className="relative pb-6 last:pb-0"
                                    >
                                        {/* Timeline Line */}
                                        {index < itinerary.length - 1 && (
                                            <div className="absolute left-[20px] top-[40px] bottom-[-20px] w-0.5 bg-gradient-to-b from-pink-500 to-stone-100 z-0" />
                                        )}

                                        <div className="relative z-10 bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group">
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-xs font-black border-4 border-white shadow-lg z-20 transition-transform group-hover:scale-110">
                                                {index + 1}
                                            </div>

                                            <div className="flex flex-col gap-3 ml-8">
                                                <div
                                                    className="flex justify-between items-start"
                                                    onMouseEnter={() => onHoverPlace?.(place.id)}
                                                    onMouseLeave={() => onHoverPlace?.(null)}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-pink-100 flex items-center justify-center text-sm font-black text-pink-500 shadow-md shadow-pink-100 group-hover:scale-110 transition-transform relative bg-white z-10">
                                                            {getCategoryIcon(place.category)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <h4 className="text-sm font-extrabold text-[#2d241a] line-clamp-1">{place.name}</h4>
                                                                {(place.category === 'Hotel' || place.category === '숙소') && (
                                                                    <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">특가</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{place.category} • {place.address}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => onRemovePlace(place.id, index)}
                                                        className="w-8 h-8 rounded-full text-stone-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center -mt-1 -mr-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Revenue Button (Agoda/Klook) */}
                                                {(
                                                    /hotel|resort|pension|motel|inn|hostel|glamping|pool|stay|house|camp|숙소|호텔|펜션|리조트|민박|풀빌라|글램핑|캠핑/i.test(place.category) ||
                                                    /호텔|펜션|리조트|민박|스테이|빌라|캠핑|글램핑/i.test(place.name)
                                                ) ? (
                                                    <div className="ml-14 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-yellow-400 text-[#2D241A] text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-sm leading-none flex items-center gap-1">
                                                                <Stars size={8} className="fill-current" />
                                                                최저가 보장
                                                            </span>
                                                            <span className="text-[10px] font-bold text-blue-600 animate-pulse">Agoda 특별 혜택가</span>
                                                        </div>
                                                        <motion.a
                                                            whileHover={{ scale: 1.02, translateY: -1 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            href={`https://www.agoda.com/search?text=${encodeURIComponent(place.name)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-gradient-to-r from-[#2864C6] to-[#1C4E9E] text-white text-[11px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-between px-4 shadow-lg shadow-blue-100 group/btn border border-white/10"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Stars className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                                                                <span>최저가 예약하기</span>
                                                            </div>
                                                            <ArrowDown className="w-3.5 h-3.5 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                                                        </motion.a>
                                                    </div>
                                                ) : (
                                                    <button className="ml-14 bg-white hover:bg-stone-50 text-[#8B7355] text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-stone-100 shadow-sm">
                                                        <MapPin className="w-3 h-3 text-pink-400" />
                                                        <span>위치 상세 정보 보기</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Travel Essentials */}
                <section className="pt-8 border-t border-[#efebe8]">
                    <h3 className="text-lg font-bold text-[#2d241a] flex items-center gap-3 mb-6 px-1">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm shadow-inner">
                            🎒
                        </span>
                        여행 필수 준비물
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { emoji: '💧', label: '휴대용 물통', query: '강아지 휴대용 물통' },
                            { emoji: '🚗', label: '카시트', query: '강아지 카시트' },
                            { emoji: '💊', label: '멀미약', query: '강아지 멀미약' },
                            { emoji: '🦟', label: '해충 방지', query: '강아지 해충방지' }
                        ].map((item, idx) => (
                            <a
                                key={idx}
                                href={`https://www.coupang.com/np/search?q=${encodeURIComponent(item.query)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center p-4 bg-white rounded-[24px] border border-stone-100 hover:border-pink-200 hover:shadow-lg hover:shadow-stone-200/40 transition-all group"
                            >
                                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-3 group-hover:scale-110 transition-transform bg-gradient-to-br from-white to-stone-100">
                                    {item.emoji}
                                </div>
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter group-hover:text-pink-500">{item.label}</span>
                            </a>
                        ))}
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 mt-6">
                        <p className="text-[9px] font-bold text-stone-400 leading-relaxed text-center opacity-60">
                            * 도담여행은 사랑스러운 반려견과의 안전한 여행을 응원합니다.<br />
                            * 위 링크를 통해 구매 시 쿠팡 파트너스 활동의 일환으로 소정의 수수료를 제공받을 수 있습니다.
                        </p>
                    </div>
                </section>
            </div>
        </div>

    );
};

export default TravelPlanner;
