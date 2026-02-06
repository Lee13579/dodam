"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, Users, Dog, Search, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

interface TravelHeroProps {
    onSearch: (criteria: any) => void;
}

export default function TravelHero({ onSearch }: TravelHeroProps) {
    const [destination, setDestination] = useState('서울');
    const [date, setDate] = useState('2026-02-03');
    const [people, setPeople] = useState(2);
    const [dogs, setDogs] = useState(1);

    return (
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#fffdfa]">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-100/50 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-500 font-bold text-sm mb-6"
                    >
                        <Plane size={16} />
                        반려견과 함께하는 특별한 여행
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-[#2d241a] mb-6 font-outfit"
                    >
                        어디로 떠나볼까요?
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-[#8b7355] max-w-2xl mx-auto"
                    >
                        도담이 아이의 성향과 보호자의 취향을 분석해<br />최적의 동반 여행 코스를 짜드릴게요.
                    </motion.p>
                </div>

                {/* Search Bar (Trip.com Style) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-2xl shadow-pink-100/50 p-4 border border-pink-50"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        {/* Destination */}
                        <div className="flex flex-col px-6 py-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 group-hover:text-pink-500">
                                <MapPin size={14} /> 여행지
                            </label>
                            <input 
                                type="text" 
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="bg-transparent font-bold text-lg text-[#2d241a] outline-none placeholder:text-slate-200"
                                placeholder="어디로 가세요?"
                            />
                        </div>

                        {/* Date */}
                        <div className="flex flex-col px-6 py-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group border-l border-slate-100">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 group-hover:text-pink-500">
                                <Calendar size={14} /> 일정
                            </label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent font-bold text-lg text-[#2d241a] outline-none"
                            />
                        </div>

                        {/* People & Dogs */}
                        <div className="flex flex-col px-6 py-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group border-l border-slate-100">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1 group-hover:text-pink-500">
                                <Users size={14} /> 인원 및 반려견
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 font-bold text-lg text-[#2d241a]">
                                    <span className="text-slate-400 font-normal">성인</span>
                                    <input 
                                        type="number" 
                                        value={people}
                                        onChange={(e) => setPeople(parseInt(e.target.value))}
                                        className="w-8 bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center gap-1 font-bold text-lg text-[#2d241a]">
                                    <Dog size={16} className="text-pink-400" />
                                    <input 
                                        type="number" 
                                        value={dogs}
                                        onChange={(e) => setDogs(parseInt(e.target.value))}
                                        className="w-8 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-center justify-center pl-4">
                            <button 
                                onClick={() => onSearch({ destination, date, people, dogs })}
                                className="w-full h-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] active:scale-[0.98] py-4 md:py-0"
                            >
                                <Search size={20} />
                                검색하기
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Tags */}
                <div className="flex justify-center gap-4 mt-12">
                    {['#제주도 애견펜션', '#양양 강아지해변', '#가평 글램핑', '#서울 호캉스'].map(tag => (
                        <span key={tag} className="text-[#8b7355] text-sm font-medium hover:text-pink-500 cursor-pointer transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-50">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
