"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Trees, Plus, Minus, ChevronLeft, ChevronRight, Dog, Heart, Star } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Place {
    id: string;
    title: string;
    address: string;
    category: string;
    imageUrl: string;
    isPetFriendly?: boolean;
    customDesc?: string;
    tags?: string[];
    rating?: string;
    reviews?: number;
    badge?: string;
}

interface DodamPickCategory {
    id: string;
    title: string;
    items: Place[];
}

const HERO_IMAGES = [
    "/dog_travel_beach_1770088673910.png",
    "/dog_travel_mountain_1770088687642.png",
    "/dog_travel_forest_1770088705081.png",
    "/dog_travel_seoul_1770088720625.png",
    "/dog_travel_lake_1770088735569.png",
    "/dog_travel_cafe_1770088751274.png"
];

// AI Placeholder Examples
const AI_EXAMPLES = [
    "수영장이 있는 조용한 펜션",
    "대형견 입장이 가능한 바다 근처 숙소",
    "아이와 뛰어놀 수 있는 넓은 잔디 마당",
    "브런치가 맛있는 애견 동반 카페",
    "포토존이 많은 감성적인 스테이"
];

export default function TravelLanding() {
    const router = useRouter();

    // Form State
    const [rooms, setRooms] = useState('1');
    const [people, setPeople] = useState('2');
    const [children, setChildren] = useState('0');
    const [dogs, setDogs] = useState('1');
    const [region, setRegion] = useState('');
    const [conditions, setConditions] = useState('');

    const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);

    // Dodam Picks State
    const [dodamPicks, setDodamPicks] = useState<any[]>([]);
    const [isPicksLoading, setIsPicksLoading] = useState(true);
    const [activePickTab, setActivePickTab] = useState('resort');

    // Popover States
    const [showRegionPopover, setShowRegionPopover] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showGuestPopover, setShowGuestPopover] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 86400000)); // Default 1 night 2 days

    const trendingScrollRef = useRef<HTMLDivElement>(null);

    const scrollTrending = (direction: 'left' | 'right') => {
        if (trendingScrollRef.current) {
            const cardWidth = 260 + 24; // Card width (260) + gap (24 - gap-6)
            const currentScroll = trendingScrollRef.current.scrollLeft;

            // Calculate next scroll position based on current scroll position
            // Round it to the nearest card to ensure smooth "one-by-one" feel
            const nextIndex = direction === 'left'
                ? Math.round((currentScroll - cardWidth) / cardWidth)
                : Math.round((currentScroll + cardWidth) / cardWidth);

            trendingScrollRef.current.scrollTo({
                left: nextIndex * cardWidth,
                behavior: 'smooth'
            });
        }
    };

    // AI Placeholder Cycle
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % AI_EXAMPLES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Hero Slider State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/travel/trending');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setTrendingPlaces(data);

                        // Extract dynamic tags from trending data (Removed unused logic)
                    }
                }
            } catch (e) {
                console.error("Failed to fetch trending", e);
            } finally {
                setIsTrendingLoading(false);
            }
        };

        const fetchPicks = async () => {
            try {
                const res = await fetch('/api/travel/picks');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setDodamPicks(data);
                        if (data.length > 0) setActivePickTab(data[0].id);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch picks", e);
            } finally {
                setIsPicksLoading(false);
            }
        };

        fetchTrending();
        fetchPicks();
    }, []);

    const handleSearch = () => {
        const diffTime = Math.abs((endDate?.getTime() || 0) - (startDate?.getTime() || 0));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const finalDays = diffDays === 0 ? '당일 여행' : `${diffDays}박 ${diffDays + 1}일`;

        const params = new URLSearchParams({
            days: finalDays,
            rooms,
            people,
            children,
            dogs,
            region: region || '서울',
            conditions
        });
        router.push(`/travel/map?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F6F6] dark:bg-[#221016] relative overflow-x-hidden text-[#1b0d12] dark:text-white font-sans transition-colors duration-300">
            {/* Site Header */}
            <Header />

            {/* Spacer for Fixed Header */}
            <div className="h-[73px] md:h-[80px]" />

            {/* 1. HERO SECTION */}
            <section className="relative px-4 pt-2">
                <div className="relative flex min-h-[520px] flex-col gap-6 rounded-[32px] items-center justify-start p-6 text-center overflow-hidden shadow-2xl">
                    {/* Background Slider */}
                    <AnimatePresence>
                        <div className="absolute inset-0 z-0">
                            {HERO_IMAGES.map((img, index) => (
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
                                    <img src={img} alt="Hero" className="w-full h-full object-cover" />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>

                    {/* Content */}
                    <div className="relative z-10 mt-12 flex flex-col gap-3">
                        <h1 className="text-white text-4xl md:text-5xl font-bold font-outfit leading-[1.1] tracking-tight drop-shadow-lg">
                            반려견과 함께하는<br />특별한 여행
                        </h1>
                        <p className="text-white/90 text-base md:text-lg font-medium drop-shadow-md">
                            도담이 엄선한 최고의 애견 동반 숙소와 명소
                        </p>
                    </div>

                    {/* Floating Glass Search Bar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 mt-auto mb-4 w-full max-w-3xl bg-white/80 backdrop-blur-2xl dark:bg-[#221016]/80 rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col gap-3"
                    >
                        {/* Destination Input */}
                        <div className="flex items-center gap-3 bg-white/30 dark:bg-black/10 rounded-2xl p-4 border border-white/20 hover:border-pink-300 transition-colors group cursor-pointer relative">
                            <MapPin className="text-[#ee2b6c] w-6 h-6 group-hover:scale-110 transition-transform" />
                            <div className="flex-1 text-left">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5 tracking-wider">여행지</label>
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-base font-bold p-0 text-[#1b0d12] placeholder:text-gray-400"
                                    placeholder="어디로 떠나시나요?"
                                    type="text"
                                    value={region}
                                    onChange={e => setRegion(e.target.value)}
                                    onFocus={() => setShowRegionPopover(true)}
                                />
                            </div>

                            {/* Region Popover */}
                            <AnimatePresence>
                                {showRegionPopover && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowRegionPopover(false); }} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full mt-4 left-0 w-full md:w-[400px] z-50 bg-white dark:bg-[#221016] shadow-xl border border-gray-100 rounded-3xl p-6 text-left"
                                        >
                                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-4">추천 여행지</h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                {trendingPlaces.slice(0, 6).map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRegion(item.address?.split(' ')[0] || item.title);
                                                            setShowRegionPopover(false);
                                                        }}
                                                        className="flex flex-col items-start p-3 rounded-2xl bg-gray-50 hover:bg-pink-50 transition-colors text-left"
                                                    >
                                                        <span className="font-bold text-sm text-gray-800">{item.address?.split(' ')[0] || item.title}</span>
                                                        <span className="text-[10px] text-gray-400">{item.category}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Date Picker Trigger */}
                            <div onClick={() => setShowCalendar(true)} className="flex-1 flex items-center gap-3 bg-white/30 dark:bg-black/10 rounded-2xl p-4 border border-white/20 hover:border-pink-300 transition-colors cursor-pointer group">
                                <Calendar className="text-[#ee2b6c] w-6 h-6 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5 tracking-wider">일정</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">
                                        {startDate ? startDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '날짜 선택'}
                                        {endDate && ` - ${endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`}
                                    </span>
                                </div>
                            </div>

                            {/* Calendar Popover */}
                            <AnimatePresence>
                                {showCalendar && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowCalendar(false); }} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full mt-4 left-0 md:left-1/2 md:-translate-x-1/2 z-50 bg-white dark:bg-[#221016] shadow-xl border border-gray-100 rounded-3xl p-6 w-[320px] md:w-[380px]"
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">날짜 선택</h4>
                                                </div>
                                                {/* Simple mock calendar grid */}
                                                <div className="grid grid-cols-7 gap-1 mb-4">
                                                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                                        <div key={d} className="text-xs font-bold text-gray-400 text-center">{d}</div>
                                                    ))}
                                                    {Array.from({ length: 30 }).map((_, i) => {
                                                        const d = i + 1;
                                                        const isSelected = (startDate && d === startDate.getDate()) || (endDate && d === endDate.getDate());
                                                        return (
                                                            <div key={i}
                                                                onClick={() => {
                                                                    const newDate = new Date();
                                                                    newDate.setDate(d);
                                                                    if (!startDate || (startDate && endDate)) {
                                                                        setStartDate(newDate);
                                                                        setEndDate(null);
                                                                    } else {
                                                                        setEndDate(newDate);
                                                                        setShowCalendar(false);
                                                                    }
                                                                }}
                                                                className={`h-8 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-[#ee2b6c] text-white' : 'text-gray-800'}`}
                                                            >
                                                                {d}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            {/* Guest Counter Trigger */}
                            <div onClick={() => setShowGuestPopover(true)} className="flex-1 flex items-center gap-3 bg-white/30 dark:bg-black/10 rounded-2xl p-4 border border-white/20 hover:border-pink-300 transition-colors cursor-pointer group relative">
                                <Search className="text-[#ee2b6c] w-6 h-6 group-hover:scale-110 transition-transform" />
                                {/* NOTE: Using Search icon as placeholder for Guests if Users/Dog icon not desired, but Users is better */}
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5 tracking-wider">인원 & 반려견</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">성인 {people}, 반려견 {dogs}</span>
                                </div>

                                {/* Guest Popover */}
                                <AnimatePresence>
                                    {showGuestPopover && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowGuestPopover(false); }} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full mt-4 right-0 w-[320px] z-50 bg-white dark:bg-[#221016] shadow-xl border border-gray-100 rounded-3xl p-6 cursor-default"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {[
                                                    { label: '객실', val: rooms, set: setRooms },
                                                    { label: '성인', val: people, set: setPeople },
                                                    { label: '어린이', val: children, set: setChildren },
                                                    { label: '반려견', val: dogs, set: setDogs },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between mb-4 last:mb-0">
                                                        <span className="font-bold text-gray-800">{item.label}</span>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => item.set(Math.max(0, parseInt(item.val) - 1).toString())} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Minus size={14} /></button>
                                                            <span className="font-bold w-4 text-center">{item.val}</span>
                                                            <button onClick={() => item.set((parseInt(item.val) + 1).toString())} className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => setShowGuestPopover(false)} className="w-full mt-4 bg-[#ee2b6c] text-white py-3 rounded-xl font-bold">확인</button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSearch}
                            className="bg-[#ee2b6c] hover:bg-[#d01b55] text-white font-bold h-14 rounded-2xl shadow-lg shadow-[#ee2b6c]/30 flex items-center justify-center gap-2 transition-all text-lg mt-1"
                        >
                            <Search size={20} />
                            검색하기
                        </motion.button>

                        {/* AI Requirement Input */}
                        <div className="relative w-full group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ee2b6c] z-10">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                value={conditions}
                                onChange={e => setConditions(e.target.value)}
                                className="w-full bg-white/40 dark:bg-black/20 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-[#1b0d12] placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#ee2b6c]/30 transition-all font-sans"
                                placeholder={`"${AI_EXAMPLES[placeholderIndex]}" 처럼 검색해보세요`}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. TRENDING DESTINATIONS */}
            <section className="mt-12 container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#1b0d12] dark:text-white text-2xl font-bold font-outfit flex items-center gap-2">
                        요즘 뜨는 여행지
                    </h3>
                    <button className="text-[#ee2b6c] text-sm font-bold hover:bg-pink-50 px-3 py-1 rounded-full transition-colors">전체보기</button>
                </div>

                <div className="relative group/trending">
                    <div
                        ref={trendingScrollRef}
                        className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
                    >
                        {isTrendingLoading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="min-w-[260px] h-[320px] bg-gray-100 rounded-[28px] animate-pulse" />)
                        ) : (
                            trendingPlaces.map((item: Place, idx) => (
                                <motion.div
                                    key={idx}
                                    onClick={() => {
                                        const params = new URLSearchParams({
                                            region: item.address?.split(' ')[0] || item.title,
                                            placeId: item.id
                                        });
                                        router.push(`/travel/map?${params.toString()}`);
                                    }}
                                    className="min-w-[260px] h-[320px] rounded-[28px] overflow-hidden relative group cursor-pointer shadow-lg transition-all snap-start bg-white"
                                >
                                    <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop'}
                                        alt={item.title}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                                        <p className="font-bold text-xl mb-1 font-outfit">{item.address?.split(' ')[0] || item.title}</p>
                                        <p className="text-xs text-white/80 font-medium line-clamp-1 mb-2">{item.customDesc || '반려견과 함께하는 최고의 여행'}</p>
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md font-bold">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                    {/* Arrows */}
                    <button onClick={() => scrollTrending('left')} className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-[#ee2b6c] transition-all opacity-0 group-hover/trending:opacity-100 z-10 hidden md:flex">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scrollTrending('right')} className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-[#ee2b6c] transition-all opacity-0 group-hover/trending:opacity-100 z-10 hidden md:flex">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            {/* 3. DODAM PICKS */}
            <section className="mt-6 mb-24 container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#1b0d12] dark:text-white text-2xl font-bold font-outfit">도담&apos;s Pick 🏆</h3>
                    <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-full border border-gray-100/50">
                        {dodamPicks.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActivePickTab(cat.id)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors relative ${activePickTab === cat.id
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span className="relative z-10">{cat.title.split(' ')[0]}</span>
                                {activePickTab === cat.id && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className="absolute inset-0 bg-[#ee2b6c] rounded-full shadow-md shadow-pink-200/50"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isPicksLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)
                    ) : (
                        dodamPicks
                            .find(cat => cat.id === activePickTab)
                            ?.items.slice(0, 4).map((item: Place, idx: number) => (
                                <motion.div key={idx}
                                    className="flex flex-col gap-3 group cursor-pointer"
                                    onClick={() => {
                                        const params = new URLSearchParams({
                                            region: item.address?.split(' ')[0] || item.title,
                                            placeId: item.id
                                        });
                                        router.push(`/travel/map?${params.toString()}`);
                                    }}
                                >
                                    <div className="relative h-48 rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button className="absolute top-3 right-3 size-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-[#ee2b6c] hover:scale-110 active:scale-90 transition-all shadow-sm">
                                            <Heart size={16} />
                                        </button>
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/70 backdrop-blur text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/40 shadow-sm">
                                                <Dog size={10} /> Pet Friendly
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-base text-[#1b0d12] line-clamp-1 group-hover:text-[#ee2b6c] transition-colors font-outfit">{item.title}</h4>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
                                                <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs font-bold text-yellow-700">{item.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium mt-1 line-clamp-1">{item.address}</p>
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {item.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="text-[10px] text-[#ee2b6c] font-bold bg-pink-50 px-1.5 py-0.5 rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                    )}
                </div>
            </section>

            {/* 4. PROMOTIONS */}
            <section className="container mx-auto px-4 max-w-7xl mb-24">
                <h3 className="text-[#1b0d12] dark:text-white text-xl font-bold mb-4 px-1 font-outfit">Special Offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative h-48 rounded-[32px] overflow-hidden flex flex-col justify-end p-6 bg-gradient-to-br from-[#FF9C00] to-[#FF5B00] shadow-xl shadow-orange-100 group cursor-pointer hover:scale-[1.01] transition-transform">
                        <div className="relative z-10">
                            <p className="text-white/80 text-xs font-extrabold uppercase tracking-wider mb-2">Early Bird</p>
                            <p className="text-white text-2xl font-extrabold leading-tight mb-4">여름 휴가 미리 준비하고<br />20% 할인 받으세요</p>
                            <button className="bg-white text-[#FF5B00] text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg hover:bg-orange-50 transition-colors">쿠폰 받기</button>
                        </div>
                        <Trees className="absolute -right-4 -bottom-4 text-white/10 w-40 h-40 rotate-12" />
                    </div>
                    <div className="relative h-48 rounded-[32px] overflow-hidden flex flex-col justify-end p-6 bg-gradient-to-br from-[#6F42C1] to-[#8A2BE2] shadow-xl shadow-purple-100 group cursor-pointer hover:scale-[1.01] transition-transform">
                        <div className="relative z-10">
                            <p className="text-white/80 text-xs font-extrabold uppercase tracking-wider mb-2">New Member</p>
                            <p className="text-white text-2xl font-extrabold leading-tight mb-4">첫 반려견 동반 여행<br />무료 케어 서비스</p>
                            <button className="bg-white text-[#6F42C1] text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg hover:bg-purple-50 transition-colors">가입하고 혜택받기</button>
                        </div>
                        <Dog className="absolute -right-4 -bottom-4 text-white/10 w-40 h-40 -rotate-12" />
                    </div>
                </div>
            </section>

            {/* Site Footer */}
            <Footer />
        </div>
    );
}
