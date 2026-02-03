"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Stars, Trees, Loader2 } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TravelLanding() {
    const router = useRouter();

    // Form State
    const [days, setDays] = useState('1 Day');
    const [people, setPeople] = useState('2');
    const [dogs, setDogs] = useState('1');
    const [region, setRegion] = useState('');
    const [conditions, setConditions] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Trending State
    const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);

    // Hero Slider State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const heroImages = [
        "/dog_travel_beach_1770088673910.png",
        "/dog_travel_mountain_1770088687642.png",
        "/dog_travel_forest_1770088705081.png",
        "/dog_travel_seoul_1770088720625.png",
        "/dog_travel_lake_1770088735569.png",
        "/dog_travel_cafe_1770088751274.png"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/travel/trending');
                if (res.ok) {
                    const data = await res.json();
                    setTrendingPlaces(data);
                }
            } catch (e) {
                console.error("Failed to fetch trending", e);
            } finally {
                setIsTrendingLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams({
            days,
            people,
            dogs,
            region: region || '서울',
            conditions
        });
        router.push(`/travel/map?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fffdfa] relative overflow-x-hidden text-[#2d241a]">
            {/* Site Header */}
            <Header />

            {/* Spacer for Fixed Header - Ensures photo starts BELOW header */}
            <div className="h-[73px] md:h-[80px]" />

            {/* 1. HERO SECTION (With Slider) */}
            <section className="relative bg-[#2d241a] text-white py-24 md:py-32 overflow-hidden">
                {/* Hero Background Slider */}
                <AnimatePresence>
                    <div className="absolute inset-0 z-0">
                        {heroImages.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{
                                    opacity: index === currentImageIndex ? 1 : 0,
                                    scale: index === currentImageIndex ? 1 : 1.1
                                }}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                className="absolute inset-0 w-full h-full"
                            >
                                <img src={img} alt="Hero" className="w-full h-full object-cover opacity-70" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>

                {/* Search Content */}
                <div className="relative z-10 container mx-auto max-w-5xl px-4 text-center">
                    <h2 className="text-5xl font-black mb-6 drop-shadow-2xl leading-tight">
                        아이의 눈높이로 설계한<br />
                        가장 완벽한 동반 여행
                    </h2>
                    <p className="text-lg text-white/95 mb-10 font-bold drop-shadow-xl">
                        좋아하는 풀냄새부터 편안한 잠자리까지,<br />
                        소중한 우리 아이를 위한 최적의 여행지를 추천합니다.
                    </p>

                    <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-[40px] p-8 shadow-2xl max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-white/90 uppercase ml-2">지역</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={region}
                                        onChange={e => setRegion(e.target.value)}
                                        placeholder="예: 강남, 제주"
                                        className="w-full bg-white/15 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/60 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-white/90 uppercase ml-2">기간</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 w-5 h-5" />
                                    <select
                                        value={days}
                                        onChange={e => setDays(e.target.value)}
                                        className="w-full bg-white/15 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option className="text-black">당일 여행</option>
                                        <option className="text-black">1박 2일</option>
                                        <option className="text-black">2박 3일</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-white/90 uppercase ml-2">인원</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/70">성인</span>
                                        <input
                                            type="number"
                                            min="1" max="10"
                                            value={people}
                                            onChange={e => setPeople(e.target.value)}
                                            className="w-full bg-white/15 border border-white/20 rounded-2xl py-4 pl-10 pr-2 text-white text-center font-bold focus:bg-white/25 focus:outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/70">반려견</span>
                                        <input
                                            type="number"
                                            min="1" max="5"
                                            value={dogs}
                                            onChange={e => setDogs(e.target.value)}
                                            className="w-full bg-white/15 border border-white/20 rounded-2xl py-4 pl-12 pr-2 text-white text-center font-bold focus:bg-white/25 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleSearch}
                                    className="w-full h-[58px] bg-[#FF3253] hover:bg-[#ff1f43] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>코스 검색</span>
                                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {["#제주도 애견펜션", "#양양 강아지해변", "#가평 글램핑", "#서울 호캉스"].map((tag, i) => (
                                <button key={i} onClick={() => { setRegion(tag.replace('#', '').split(' ')[0]); }} className="px-4 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm font-bold text-white/95 transition-colors backdrop-blur-sm border border-white/10">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LOWER SECTION (Light Theme) */}
            <main className="container mx-auto max-w-5xl px-4 py-24">
                {/* Trending Section */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-extrabold text-[#2d241a] flex items-center gap-2 font-outfit">
                            🔥 요즘 뜨는 인기 여행지
                        </h3>
                        <a href="#" className="text-[#8b7355] text-sm font-bold hover:text-pink-500 transition-colors">더 보기 &gt;</a>
                    </div>

                    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                        {isTrendingLoading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-w-[260px] h-[360px] rounded-[32px] bg-stone-100 animate-pulse" />
                            ))
                        ) : (
                            trendingPlaces.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="min-w-[280px] h-[380px] rounded-[40px] relative overflow-hidden group cursor-pointer shadow-xl shadow-stone-200/50 hover:shadow-2xl transition-all hover:-translate-y-2 border border-white"
                                    onClick={() => {
                                        const params = new URLSearchParams({
                                            region: item.address?.split(' ')[0] || item.title,
                                            placeId: item.id
                                        });
                                        router.push(`/travel/map?${params.toString()}`);
                                    }}
                                >
                                    <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1544256273-dfdcfaaf8095?q=80&w=400&auto=format&fit=crop'}
                                        alt={item.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-[#ff3253] text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                                        <Stars size={12} className="fill-[#ff3253]" />
                                        RECOMMENDED
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <h4 className="text-2xl font-bold leading-tight mb-2 line-clamp-2 drop-shadow-md">{item.title}</h4>
                                        <p className="text-white/90 text-sm font-medium mb-3 line-clamp-1">{item.customDesc || item.category}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md">{item.rating || '9.8'}</span>
                                            <span className="text-xs text-white/90 font-medium">리뷰 {item.reviews || '500+'}개</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Promo Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#ff5b00] to-[#ff9c00] p-10 shadow-2xl shadow-orange-100 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="relative z-10 text-white">
                            <div className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-xl inline-block mb-4 border border-white/20">
                                🚀 Klook 단독 특가
                            </div>
                            <h3 className="text-3xl font-extrabold mb-3">일본 료칸<br />최대 40% OFF</h3>
                            <button className="bg-white text-[#ff5b00] text-sm font-black px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors shadow-lg mt-2">
                                할인 신청하기
                            </button>
                        </div>
                        <Trees className="text-white/10 absolute right-6 bottom-6 w-36 h-36 rotate-12" />
                    </div>

                    <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#6f42c1] to-[#a020f0] p-10 shadow-2xl shadow-purple-100 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="relative z-10 text-white">
                            <div className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-3 py-1.5 rounded-xl inline-block mb-4 border border-white/20">
                                ✈️ Agoda 항공권
                            </div>
                            <h3 className="text-3xl font-extrabold mb-3">반려견 동반<br />항공권 최저가</h3>
                            <button className="bg-white text-[#6f42c1] text-sm font-black px-6 py-3 rounded-2xl hover:bg-purple-50 transition-colors shadow-lg mt-2">
                                일정 조회하기
                            </button>
                        </div>
                        <Calendar className="text-white/10 absolute right-8 bottom-8 w-36 h-36 -rotate-12" />
                    </div>
                </div>
            </main>

            {/* Site Footer */}
            <Footer />
        </div>
    );
}
