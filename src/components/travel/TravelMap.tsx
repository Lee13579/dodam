"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plus, Trash2, Calendar, PawPrint, Coffee, Utensils, Hotel, Trees, ArrowDown, Bot, Loader2, Stars } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    title: string;
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
}

const TravelMap: React.FC<TravelMapProps> = ({
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

    // Auto-generate on mount if params exist? 
    // Usually handled by parent Page component via handleGenerateCourse, so we just display the UI.

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

    return (
        <div className="flex flex-col h-full bg-[#fffdfa] border-r border-[#efebe8] shadow-2xl relative overflow-hidden text-[#2D241A]">

            {/* Header */}
            <header className="p-6 border-b border-[#efebe8] bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-extrabold flex items-center gap-2 font-outfit tracking-tighter text-[#2D241A]">
                        <div className="w-8 h-8 bg-pink-500 rounded-xl flex items-center justify-center text-white rotate-3 shadow-md">
                            <PawPrint className="w-5 h-5" />
                        </div>
                        <span className="bg-gradient-to-br from-[#2D241A] to-[#8B7355] bg-clip-text text-transparent">도담 플래너</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-gradient-to-b from-white to-[#fffdfa]">

                {/* AI Configuration Section (Collapsed or Minimal) */}
                <div className="bg-white rounded-[24px] p-5 shadow-lg shadow-stone-100 border border-[#fff4e6] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-[#2D241A]">
                            여행 설정
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#8B7355] ml-1">지역</label>
                            <input
                                type="text"
                                value={region}
                                onChange={e => setRegion(e.target.value)}
                                className="w-full bg-stone-50 p-2.5 rounded-xl text-sm font-bold focus:ring-1 focus:ring-pink-200 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="space-y-1 flex-1">
                                <label className="text-[10px] font-bold text-[#8B7355] ml-1">인원</label>
                                <input type="number" value={people} onChange={e => setPeople(e.target.value)} className="w-full bg-stone-50 p-2.5 rounded-xl text-sm font-bold text-center" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[10px] font-bold text-[#8B7355] ml-1">반려견</label>
                                <input type="number" value={dogs} onChange={e => setDogs(e.target.value)} className="w-full bg-stone-50 p-2.5 rounded-xl text-sm font-bold text-center" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerateCourse({ days, people: people || '1', dogs: dogs || '1', region: region || '서울', conditions })}
                        disabled={isLoading}
                        className="w-full bg-[#1c1917] text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                                <span>코스 다시 생성 중...</span>
                            </>
                        ) : (
                            <>
                                <span>코스 적용하기</span>
                                <Stars className="w-3 h-3 text-pink-400" />
                            </>
                        )}
                    </button>
                </div>

                {/* Itinerary */}
                <section className="">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-bold text-[#2d241a] flex items-center gap-2">
                            <Calendar size={16} className="text-orange-500" />
                            <span>나의 여행 일정</span>
                        </h3>
                        <span className="text-[10px] font-extrabold bg-stone-100 text-stone-400 px-3 py-1 rounded-full">{itinerary.length} STOPS</span>
                    </div>

                    <div className="space-y-3 relative pb-10">
                        {itinerary.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 bg-stone-50/50 rounded-[28px] border-2 border-dashed border-stone-100 text-stone-300">
                                <MapPin size={24} className="opacity-20 mb-2" />
                                <p className="text-xs font-medium text-center leading-relaxed">
                                    설정된 코스가 없습니다.<br />
                                    <span className="text-pink-500">코스 적용하기</span>를 눌러보세요!
                                </p>
                            </div>
                        ) : (
                            itinerary.map((place, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={`${place.id}-${index}`}
                                    className="relative flex items-start"
                                >
                                    {/* Timeline */}
                                    {index < itinerary.length - 1 && (
                                        <div className="absolute left-[19px] top-[40px] bottom-[-20px] w-0.5 bg-gradient-to-b from-pink-500 to-stone-100 z-0" />
                                    )}

                                    <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xs font-black border-4 border-white shadow-lg z-10 flex-shrink-0 mr-3 mt-1">
                                        {index + 1}
                                    </div>

                                    <div
                                        className="flex-1 bg-white p-4 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                        onMouseEnter={() => onHoverPlace?.(place.id)}
                                        onMouseLeave={() => onHoverPlace?.(null)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-stone-50 text-[#8B7355] flex items-center justify-center text-xs">
                                                    {getCategoryIcon(place.category)}
                                                </span>
                                                <h4 className="text-sm font-extrabold text-[#2d241a] line-clamp-1">{place.name}</h4>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemovePlace(place.id, index); }}
                                                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-stone-500 pl-8 line-clamp-1">{place.address}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>

                {/* Place Search/Add (Optional, usually for manual adding) */}
                <div className="bg-white p-4 rounded-[24px] border border-stone-100 shadow-sm">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="장소 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-50 h-11 pl-10 pr-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder-stone-400"
                        />
                    </div>
                    <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                                        ? 'bg-[#2d241a] text-white shadow-lg shadow-black/20 ring-2 ring-black/10'
                                        : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200 shadow-sm'
                                    }`}
                            >
                                <cat.icon size={12} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TravelMap;
