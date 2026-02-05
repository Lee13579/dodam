"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Place {
    id: string;
    title: string;
    address: string;
    category: string;
    imageUrl: string;
    customDesc?: string;
}

export default function TravelTeaser() {
    const router = useRouter();
    const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/travel/trending');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setTrendingPlaces(data);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch trending", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const cardWidth = 300 + 24;
            const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 bg-[#fffdfa]">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-bold mb-4">
                            <MapPin className="w-4 h-4 mr-2" /> 여행 가기 좋은 날
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#2d241a] font-outfit">아이와 함께 떠나는<br />트렌디한 여행지</h2>
                    </div>
                    <button
                        onClick={() => router.push('/travel')}
                        className="px-8 py-3 bg-[#2d241a] text-white rounded-2xl font-bold hover:bg-black transition-all"
                    >
                        전체 여행지 보기
                    </button>
                </div>

                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory px-2"
                    >
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="min-w-[300px] h-[400px] bg-gray-100 rounded-[32px] animate-pulse" />
                            ))
                        ) : (
                            trendingPlaces.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    onClick={() => router.push(`/travel/map?region=${item.address?.split(' ')[0] || item.title}&placeId=${item.id}`)}
                                    className="min-w-[300px] h-[400px] rounded-[32px] overflow-hidden relative group cursor-pointer shadow-xl snap-start"
                                >
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <p className="font-bold text-2xl mb-1">{item.title}</p>
                                        <p className="text-white/70 text-sm line-clamp-1">{item.address}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-pink-500 transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-pink-500 transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
