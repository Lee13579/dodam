"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Share2, Heart, ExternalLink, MessageCircle, Dog, Coffee, Clock, Check } from 'lucide-react';

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
                            <img
                                src={place.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b'}
                                alt={place.title}
                                className="w-full h-full object-cover"
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
                                    <button className="bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                        <Heart size={20} className="text-[#ee2b6c] fill-[#ee2b6c]" />
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

                        {/* 2. Tabs */}
                        <div className="flex border-b border-gray-100 px-6 sticky top-0 bg-white/95 backdrop-blur z-10">
                            {[
                                { id: 'about', label: '소개' },
                                { id: 'reviews', label: `리뷰 (${place.reviewCount || 0})` },
                                { id: 'location', label: '위치' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'about' | 'reviews' | 'location')}
                                    className={`py-4 px-4 text-sm font-bold relative transition-colors ${activeTab === tab.id ? 'text-[#1b0d12]' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ee2b6c]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* 3. Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'about' && (
                                    <motion.div
                                        key="about"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        {/* Rating Summary */}
                                        <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="flex flex-col items-center justify-center pl-2 pr-6 border-r border-gray-100">
                                                <span className="text-3xl font-black text-[#1b0d12]">{place.rating || 4.8}</span>
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold">{place.reviewCount || 128} reviews</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                    <span>청결도</span>
                                                    <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-400 w-[95%]" />
                                                    </div>
                                                    <span>4.9</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                    <span>서비스</span>
                                                    <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-400 w-[92%]" />
                                                    </div>
                                                    <span>4.8</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                    <span>위치</span>
                                                    <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-400 w-[88%]" />
                                                    </div>
                                                    <span>4.5</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1b0d12] mb-3">숙소 소개</h3>
                                            <p className="text-gray-500 leading-relaxed text-sm font-medium">
                                                {place.description || `반려견과 함께 편안한 휴식을 즐길 수 있는 ${place.category || '공간'}입니다. 넓은 마당과 쾌적한 객실, 그리고 반려동물을 위한 다양한 편의시설이 준비되어 있어 최고의 추억을 만들 수 있습니다. 주변 산책로를 따라 걸으며 자연을 느껴보세요.`}
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1b0d12] mb-4">편의 시설</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: '무료 와이파이', icon: Check },
                                                    { label: '반려견 운동장', icon: Dog },
                                                    { label: '조식 제공', icon: Coffee },
                                                    { label: '24시간 데스크', icon: Clock },
                                                ].map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-50 text-sm font-bold text-gray-600">
                                                        <div className="p-1.5 bg-gray-50 rounded-lg text-[#ee2b6c]">
                                                            <feature.icon size={14} />
                                                        </div>
                                                        {feature.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'reviews' && (
                                    <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <MessageCircle size={32} className="mb-2 opacity-50" />
                                        <p className="text-sm font-medium">아직 작성된 리뷰가 없습니다.</p>
                                        <button className="mt-4 text-[#ee2b6c] text-sm font-bold hover:underline">첫 리뷰 작성하기</button>
                                    </motion.div>
                                )}
                                {activeTab === 'location' && (
                                    <motion.div key="location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 bg-gray-200 rounded-3xl flex items-center justify-center text-gray-400 font-bold overflow-hidden relative">
                                        {/* Placeholder Map Image */}
                                        <img src="https://assets.website-files.com/5a5bd2789139820001552a8a/5a676b2bd76ed30001886133_map-placeholder.jpg" className="w-full h-full object-cover opacity-50" alt="Map" />
                                        <div className="absolute flex flex-col items-center">
                                            <MapPin size={32} className="text-[#ee2b6c] mb-2 drop-shadow-md" />
                                            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-xl shadow-sm text-xs">{place.address}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 4. Footer CTA */}
                        {place.price && (
                            <div className="px-8 py-5 border-t border-gray-100 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
                                <div className="flex flex-col">
                                    {place.originalPrice && (
                                        <span className="text-xs text-gray-300 line-through font-bold">₩{place.originalPrice.toLocaleString()}</span>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <span className="text-2xl font-black text-[#1b0d12]">₩{place.price.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-gray-400">/ 박</span>
                                    </div>
                                </div>
                                <a
                                    href={place.bookingUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#1b0d12] hover:bg-[#ee2b6c] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-[#ee2b6c]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    최저가 예약
                                </a>
                            </div>
                        )}
                        {!place.price && (
                            <div className="px-8 py-5 border-t border-gray-100 bg-white">
                                <button className="w-full bg-[#1b0d12] hover:bg-[#ee2b6c] text-white py-4 rounded-2xl font-bold shadow-lg transition-colors">
                                    상세 정보 보기
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
