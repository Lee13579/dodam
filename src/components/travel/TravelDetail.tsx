"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Share2, ExternalLink, MessageCircle, Dog, Coffee, Clock, Check } from 'lucide-react';
import Image from 'next/image';

interface Place {
    id: string;
    title: string;
    address: string;
    category: string;
    imageUrl?: string;
    // ... extend as needed or import shared interface
    description?: string;
    price?: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    bookingUrl?: string;
    isPetFriendly?: boolean;
    lat?: number;
    lng?: number;
}

interface TravelDetailProps {
    place: Place | null;
    onClose: () => void;
}

export default function TravelDetail({ place, onClose }: TravelDetailProps) {
    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'location'>('about');

    if (!place) return null;

    return (
        <AnimatePresence>
            {place && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className="fixed inset-y-0 right-0 w-full md:w-[540px] bg-white z-50 shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                        {/* 1. Header & Image */}
                        <div className="relative h-[320px] flex-shrink-0">
                            <Image
                                src={place.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b'}
                                alt={place.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            {/* Header Actions */}
                            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start text-white">
                                <button onClick={onClose} className="bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-colors">
                                    <X size={20} className="text-white" />
                                </button>
                                <div className="flex gap-3">
                                    <button className="bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-colors">
                                        <Share2 size={20} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Header Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-[#ee2b6c] text-[10px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider shadow-sm">
                                        {place.category || 'Travel'}
                                    </span>
                                    {place.isPetFriendly && (
                                        <span className="bg-green-500/80 backdrop-blur-md text-[10px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider flex items-center gap-1">
                                            <Dog size={10} /> Pet Friendly
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-black leading-tight mb-2 opacity-95">{place.title}</h2>
                                <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                    <MapPin size={14} className="opacity-80" />
                                    <span>{place.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tabs - Minimalist Style */}
                        <div className="flex border-b border-stone-100 px-8 sticky top-0 bg-white/95 backdrop-blur-xl z-10">
                            {[
                                { id: 'about', label: '장소 소개' },
                                { id: 'location', label: '찾아가는 길' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'about' | 'location')}
                                    className={`py-5 px-4 text-sm font-black relative transition-all ${activeTab === tab.id ? 'text-[#ee2b6c]' : 'text-stone-300 hover:text-stone-500'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ee2b6c] rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* 3. Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-12 pb-40">
                            <AnimatePresence mode="wait">
                                {activeTab === 'about' && (
                                    <motion.div
                                        key="about"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-12"
                                    >
                                        {/* Description */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-[#2D241A] flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-[#ee2b6c] rounded-full" />
                                                에디터 노트
                                            </h3>
                                            <p className="text-stone-500 leading-relaxed text-base font-medium break-keep">
                                                {place.description || `반려견과 함께하는 특별한 하루를 위한 완벽한 ${place.category || '공간'}입니다. 세심하게 배려된 시설과 탁 트인 공간에서 아이와 함께 잊지 못할 추억을 만들어보세요. 도담이 엄선한 프리미엄 스팟입니다.`}
                                            </p>
                                        </div>

                                        {/* Refined Pet Amenities */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-black text-[#2D241A] flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-[#ee2b6c] rounded-full" />
                                                반려견 편의시설
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: '전용 운동장', icon: Dog, desc: '오프리쉬 자유시간' },
                                                    { label: '펫 메뉴 제공', icon: Coffee, desc: '강아지 전용 간식' },
                                                    { label: '웰컴 키트', icon: Check, desc: '배변봉투/기저귀' },
                                                    { label: '24시 케어', icon: Clock, desc: '안전한 머무름' },
                                                ].map((feature, i) => (
                                                    <div key={i} className="flex flex-col gap-3 bg-stone-50 p-5 rounded-[24px] border border-stone-100/50 hover:bg-white hover:shadow-xl hover:shadow-stone-100 transition-all group">
                                                        <div className="w-10 h-10 bg-white rounded-xl text-[#ee2b6c] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            <feature.icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#2D241A]">{feature.label}</p>
                                                            <p className="text-[11px] font-bold text-stone-400">{feature.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'location' && (
                                    <motion.div key="location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                         <div className="h-64 bg-stone-100 rounded-[32px] flex items-center justify-center text-stone-400 font-bold overflow-hidden relative border border-stone-200">
                                            <Image
                                                src="https://assets.website-files.com/5a5bd2789139820001552a8a/5a676b2bd76ed30001886133_map-placeholder.jpg"
                                                alt="Map"
                                                fill
                                                className="object-cover opacity-50 grayscale"
                                                unoptimized
                                            />
                                            <div className="absolute flex flex-col items-center">
                                                <div className="w-10 h-10 bg-[#ee2b6c] rounded-full flex items-center justify-center shadow-xl mb-2 animate-bounce">
                                                    <MapPin size={20} className="text-white" />
                                                </div>
                                                <span className="bg-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black text-[#2D241A]">{place.address}</span>
                                            </div>
                                        </div>
                                        <div className="bg-stone-50 p-6 rounded-[28px] border border-stone-100">
                                            <p className="text-xs font-black text-stone-400 mb-2 uppercase tracking-widest">도로명 주소</p>
                                            <p className="text-sm font-bold text-[#2D241A] leading-relaxed">{place.address}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 4. Fixed Bottom Action Bar - Premium High-Conversion Design */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex flex-col gap-4 z-30">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex flex-col">
                                    {place.price ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-[#2D241A]">₩{place.price.toLocaleString()}</span>
                                                <span className="text-xs font-bold text-stone-400">/ 1박 기준</span>
                                            </div>
                                            {place.originalPrice && (
                                                <span className="text-xs text-[#ee2b6c] font-black">정가 대비 {Math.round((place.originalPrice - place.price) / place.originalPrice * 100)}% 할인 중</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter mb-0.5">Location</span>
                                            <span className="text-sm font-black text-[#2D241A] line-clamp-1">{place.address?.split(' ')[1] || '정보 없음'} 지역</span>
                                        </div>
                                    )}
                                </div>
                                
                                <button className="flex flex-col items-center gap-1 group">
                                    <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-50 transition-colors">
                                        <Share2 size={16} className="text-stone-400" />
                                    </div>
                                    <span className="text-[9px] font-black text-stone-400">공유</span>
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams({
                                            region: place.address?.split(' ')[0] || '',
                                            placeId: place.id,
                                            lat: place.lat?.toString() || '',
                                            lng: place.lng?.toString() || '',
                                            autoGenerate: 'true'
                                        });
                                        window.location.href = `/travel/map?${params.toString()}`;
                                    }}
                                    className="flex-1 bg-white border-2 border-[#ee2b6c] text-[#ee2b6c] py-4 rounded-2xl font-black shadow-sm hover:bg-pink-50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    AI 일정에 담기
                                </button>
                                <a
                                    href={place.bookingUrl || `https://www.agoda.com/ko-kr/search?city=${place.address?.split(' ')[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-[1.5] bg-[#ee2b6c] hover:bg-[#d01b55] text-white py-4 rounded-2xl font-black shadow-xl shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    {place.category?.includes('호텔') || place.category?.includes('숙소') ? '아고다 최저가 예약' : '지금 예약하기'}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
