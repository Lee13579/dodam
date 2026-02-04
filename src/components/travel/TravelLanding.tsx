"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Trees, Loader2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    const [isLoading, setIsLoading] = useState(false);

    const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);
    const [trendingTags, setTrendingTags] = useState<string[]>(["#제주도", "#양양", "#가평", "#서울"]);

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
            const cardWidth = 280 + 24; // Card width (280) + gap (24)
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
                    if (Array.isArray(data)) {
                        setTrendingPlaces(data);

                        // Extract dynamic tags from trending data
                        if (data.length > 0) {
                            const tags = Array.from(new Set(data.map((p: any) => `#${p.address?.split(' ')[0] || p.title.split(' ')[0]}`))).slice(0, 4);
                            if (tags.length > 0) setTrendingTags(tags as string[]);
                        }
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
        <div className="flex flex-col min-h-screen bg-[#fffdfa] relative overflow-x-hidden text-[#2d241a] [scrollbar-gutter:stable]">
            {/* Site Header */}
            <Header />

            {/* Spacer for Fixed Header - Ensures photo starts BELOW header */}
            <div className="h-[73px] md:h-[80px]" />

            {/* 1. HERO SECTION (With Slider) */}
            <section className="relative bg-[#2d241a] text-white py-24 md:py-32">
                {/* Hero Background Slider */}
                <AnimatePresence>
                    <div className="absolute inset-0 z-0 overflow-hidden">
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
                <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center">
                    <h2 className="text-5xl font-black mb-6 drop-shadow-2xl leading-tight">
                        아이의 눈높이로 설계한<br />
                        가장 완벽한 동반 여행
                    </h2>
                    <p className="text-lg text-white/95 mb-10 font-bold drop-shadow-xl">
                        좋아하는 풀냄새부터 편안한 잠자리까지,<br />
                        소중한 우리 아이를 위한 최적의 여행지를 추천합니다.
                    </p>

                    <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[40px] p-12 shadow-2xl max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                            <div className="flex-[1.2] min-w-0 space-y-2 text-left w-full md:w-auto">
                                <label className="text-lg font-black text-white uppercase ml-4 tracking-widest">지역</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 w-5 h-5 group-hover:text-pink-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={region}
                                        onChange={e => setRegion(e.target.value)}
                                        onFocus={() => {
                                            setShowRegionPopover(true);
                                            setShowCalendar(false);
                                        }}
                                        placeholder="어디로 갈까요?"
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl h-[84px] pl-16 pr-4 text-white placeholder-white/70 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-black text-xl"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setShowRegionPopover(false);
                                                handleSearch();
                                            }
                                        }}
                                    />

                                    {/* Modern Region Popover */}
                                    <AnimatePresence>
                                        {showRegionPopover && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setShowRegionPopover(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    className="absolute top-full mt-4 left-0 z-50 bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 rounded-[32px] p-6 w-[320px] md:w-[400px]"
                                                >
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h5 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-4 ml-1">추천 여행지</h5>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {isTrendingLoading ? (
                                                                    Array.from({ length: 6 }).map((_, i) => (
                                                                        <div key={i} className="h-20 bg-stone-50 animate-pulse rounded-2xl" />
                                                                    ))
                                                                ) : (
                                                                    trendingPlaces.slice(0, 6).map((item) => {
                                                                        const name = item.address?.split(' ')[0] || item.title.split(' ')[0];
                                                                        const desc = item.customDesc || item.category;
                                                                        return (
                                                                            <button
                                                                                key={item.id || item.title}
                                                                                onClick={() => {
                                                                                    setRegion(name);
                                                                                    setShowRegionPopover(false);
                                                                                }}
                                                                                className="flex flex-col items-start p-4 rounded-2xl hover:bg-[#ff3253]/5 border border-stone-50 hover:border-[#ff3253]/20 transition-all group text-left"
                                                                            >
                                                                                <span className="font-black text-[#2d241a] text-base mb-1">{name}</span>
                                                                                <span className="text-[10px] text-stone-400 font-bold leading-tight line-clamp-1">{desc}</span>
                                                                            </button>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-stone-100">
                                                            <button
                                                                onClick={() => {
                                                                    setRegion('내 주변');
                                                                    setShowRegionPopover(false);
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-[#2d241a] font-bold text-sm transition-colors"
                                                            >
                                                                <MapPin size={14} className="text-[#ff3253]" />
                                                                현재 내 주변 찾기
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="flex-[1.5] min-w-0 space-y-2 text-left relative w-full md:w-auto">
                                <label className="text-lg font-black text-white uppercase ml-4 tracking-widest">기간</label>
                                <div
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="relative cursor-pointer group"
                                >
                                    <div className="w-full bg-white/10 border border-white/20 rounded-2xl h-[84px] px-8 flex items-center gap-5 text-white font-black transition-all hover:bg-white/20">
                                        <Calendar className="text-white/80 w-8 h-8 flex-shrink-0 group-hover:text-pink-400 transition-colors" />
                                        <span className="whitespace-nowrap text-xl">
                                            {startDate ? startDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '시작일'}
                                            {endDate ? ` ~ ${endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}` : ''}
                                        </span>
                                    </div>

                                    {/* Simplified Minimalist Calendar Popover */}
                                    <AnimatePresence>
                                        {showCalendar && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40 bg-transparent"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowCalendar(false);
                                                    }}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    className="absolute top-full mt-4 left-0 md:left-1/2 md:-translate-x-1/2 z-50 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.3)] border border-stone-100 rounded-[40px] p-10 w-[360px] md:w-[480px]"
                                                >
                                                    <div className="flex flex-col">
                                                        <div className="flex justify-between items-center mb-8">
                                                            <h4 className="font-black text-2xl text-[#2d241a]">2026년 2월</h4>
                                                            <div className="flex gap-2">
                                                                <button className="w-10 h-10 rounded-full hover:bg-stone-50 flex items-center justify-center transition-colors text-stone-400 hover:text-[#2d241a]">
                                                                    <span className="text-xl font-bold">&larr;</span>
                                                                </button>
                                                                <button className="w-10 h-10 rounded-full hover:bg-stone-50 flex items-center justify-center transition-colors text-stone-400 hover:text-[#2d241a]">
                                                                    <span className="text-xl font-bold">&rarr;</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1 mb-4">
                                                            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                                                <div key={d} className="text-[11px] font-black text-stone-300 text-center uppercase tracking-widest">{d}</div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1 mb-8">
                                                            {Array.from({ length: 28 }).map((_, i) => {
                                                                const day = i + 1;
                                                                const date = new Date(2026, 1, day);
                                                                const isToday = day === 3;

                                                                const isSelected = (startDate && date.toDateString() === startDate.toDateString()) ||
                                                                    (endDate && date.toDateString() === endDate.toDateString()) ||
                                                                    (startDate && endDate && date > startDate && date < endDate);

                                                                const isStart = startDate && date.toDateString() === startDate.toDateString();
                                                                const isEnd = endDate && date.toDateString() === endDate.toDateString();

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!startDate || (startDate && endDate)) {
                                                                                setStartDate(date);
                                                                                setEndDate(null);
                                                                            } else {
                                                                                if (date < startDate) {
                                                                                    setStartDate(date);
                                                                                    setEndDate(null);
                                                                                } else {
                                                                                    setEndDate(date);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`h-12 flex items-center justify-center text-sm font-bold relative cursor-pointer transition-all rounded-xl
                                                                        ${isSelected ? 'bg-[#ff3253] text-white shadow-lg shadow-pink-100 z-10' : 'hover:bg-stone-50 text-[#2d241a]'}
                                                                        ${isStart && endDate ? 'rounded-r-none' : ''}
                                                                        ${isEnd ? 'rounded-l-none' : ''}
                                                                    `}
                                                                    >
                                                                        {day}
                                                                        {isToday && !isStart && !isEnd && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ff3253] rounded-full" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowCalendar(false);
                                                            }}
                                                            className="w-full py-5 bg-[#2d241a] text-white rounded-[24px] font-black text-base shadow-xl hover:bg-stone-800 transition-all active:scale-[0.98] cursor-pointer"
                                                        >
                                                            선택 완료
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="flex-[1.9] min-w-0 space-y-2 text-left w-full md:w-auto relative">
                                <label className="text-lg font-black text-white uppercase ml-4 tracking-widest">인원 및 객실</label>
                                <div
                                    onClick={() => {
                                        setShowGuestPopover(!showGuestPopover);
                                        setShowRegionPopover(false);
                                        setShowCalendar(false);
                                    }}
                                    className="relative h-[84px] bg-white/10 border border-white/20 rounded-2xl px-6 flex items-center justify-between group cursor-pointer transition-all hover:bg-white/20"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-white font-black text-xl leading-tight whitespace-nowrap">
                                            {`객실 ${rooms}, 성인 ${people}, 어린이 ${children}, 반려견 ${dogs}`}
                                        </span>
                                    </div>
                                    <div className={`transition-transform duration-300 ${showGuestPopover ? 'rotate-180' : ''}`}>
                                        <Plus size={20} className="text-white/70" strokeWidth={3} />
                                    </div>

                                    {/* Trip.com Style Guest Popover */}
                                    <AnimatePresence>
                                        {showGuestPopover && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowGuestPopover(false);
                                                    }}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    className="absolute top-full mt-4 right-0 z-50 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.3)] border border-stone-100 rounded-[32px] p-8 w-[360px]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="space-y-8">
                                                        {/* Stepper Component Internal Helper */}
                                                        {[
                                                            { label: '객실', sub: '', val: rooms, set: setRooms, min: 1, max: 8 },
                                                            { label: '성인', sub: '(18세 이상)', val: people, set: setPeople, min: 1, max: 12 },
                                                            { label: '어린이', sub: '(17세 이하)', val: children, set: setChildren, min: 0, max: 8 },
                                                            { label: '반려견', sub: '', val: dogs, set: setDogs, min: 1, max: 5 },
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[#2d241a] font-black text-lg leading-none">{item.label}</span>
                                                                    {item.sub && <span className="text-stone-400 font-bold text-xs uppercase tracking-tighter">{item.sub}</span>}
                                                                </div>
                                                                <div className="flex items-center gap-5">
                                                                    <button
                                                                        onClick={() => item.set(Math.max(item.min, parseInt(item.val) - 1).toString())}
                                                                        disabled={parseInt(item.val) <= item.min}
                                                                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all active:scale-90 ${parseInt(item.val) <= item.min ? 'border-stone-100 text-stone-200' : 'border-stone-200 text-[#ff3253] hover:border-[#ff3253]'}`}
                                                                    >
                                                                        <Minus size={16} strokeWidth={3} />
                                                                    </button>
                                                                    <span className="text-[#2d241a] font-black text-xl w-6 text-center">{item.val}</span>
                                                                    <button
                                                                        onClick={() => item.set(Math.min(item.max, parseInt(item.val) + 1).toString())}
                                                                        disabled={parseInt(item.val) >= item.max}
                                                                        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all active:scale-90 ${parseInt(item.val) >= item.max ? 'border-stone-100 text-stone-200' : 'border-stone-200 text-[#ff3253] hover:border-[#ff3253]'}`}
                                                                    >
                                                                        <Plus size={16} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <button
                                                            onClick={() => setShowGuestPopover(false)}
                                                            className="w-full py-4 bg-[#FF3253] text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-pink-200 transition-all active:scale-[0.98]"
                                                        >
                                                            확인
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <button
                                    onClick={handleSearch}
                                    className="w-full md:w-[180px] h-[84px] bg-[#FF3253] hover:bg-[#ff1f43] text-white rounded-[28px] font-black text-2xl shadow-xl hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-3 group active:scale-95"
                                >
                                    <span>검색</span>
                                    <Search className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* AI Requirement Input with Animated Placeholder */}
                        <div className="relative max-w-5xl mx-auto group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400 z-10">
                                <Search size={18} />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={conditions}
                                    onChange={e => setConditions(e.target.value)}
                                    className="w-full bg-white/15 border border-white/30 rounded-full py-7 pl-14 px-10 text-white focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all font-black text-xl md:text-2xl backdrop-blur-md"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                {!conditions && (
                                    <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-white/70 font-black text-xl md:text-2xl gap-2">
                                        <span className="whitespace-nowrap">아이와 함께하고 싶은 특별한 요청사항이 있나요? </span>
                                        <div className="relative flex items-center min-w-[600px] h-10 overflow-hidden">
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={placeholderIndex}
                                                    initial={{ y: 30, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -30, opacity: 0 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                    className="whitespace-nowrap pt-1"
                                                >
                                                    ({AI_EXAMPLES[placeholderIndex]})
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LOWER SECTION (Light Theme) */}
            <main className="container mx-auto max-w-7xl px-4 py-24">
                {/* Trending Section */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-extrabold text-[#2d241a] flex items-center gap-2 font-outfit">
                            🔥 요즘 뜨는 인기 여행지
                        </h3>
                        <a href="#" className="text-[#8b7355] text-sm font-bold hover:text-pink-500 transition-colors">더 보기 &gt;</a>
                    </div>

                    <div className="relative group/trending">
                        <div
                            ref={trendingScrollRef}
                            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            {isTrendingLoading ? (
                                [1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="min-w-[280px] h-[380px] rounded-[40px] bg-stone-100 animate-pulse" />
                                ))
                            ) : (
                                trendingPlaces.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="min-w-[280px] h-[380px] rounded-[40px] relative overflow-hidden group cursor-pointer shadow-xl shadow-stone-200/50 hover:shadow-2xl transition-all hover:-translate-y-2 border border-white snap-start"
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                region: item.address?.split(' ')[0] || item.title,
                                                placeId: item.id
                                            });
                                            router.push(`/travel/map?${params.toString()}`);
                                        }}
                                    >
                                        <img
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop'}
                                            alt={item.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-[#ff3253] text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-[#ff3253] rounded-full animate-pulse" />
                                            {item.isPetFriendly ? item.category : '추천'}
                                        </div>

                                        <div className="absolute bottom-8 left-8 right-8 text-white">
                                            <h4 className="text-2xl font-bold leading-tight mb-2 line-clamp-2 drop-shadow-md">{item.title}</h4>
                                            <p className="text-white/90 text-sm font-medium mb-3 line-clamp-1">{item.customDesc || item.category}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.tags?.map((tag: string, tagIdx: number) => (
                                                    <span key={tagIdx} className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Arrows */}
                        <button
                            onClick={() => scrollTrending('left')}
                            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-[#2d241a] hover:text-[#ff3253] transition-all z-10 border border-stone-100"
                        >
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>
                        <button
                            onClick={() => scrollTrending('right')}
                            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-[#2d241a] hover:text-[#ff3253] transition-all z-10 border border-stone-100"
                        >
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                </section>

                {/* Dodam Picks Section (New Style) */}
                <section className="mb-24">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-3xl font-black text-[#2d241a] mb-2 leading-tight">
                                도담이 엄선한<br />
                                <span className="text-[#ff3253]">테마별 추천 여행지 🏆</span>
                            </h3>
                            <p className="text-stone-500 font-bold text-sm">반려견 전문가들이 직접 고르고 추천하는 최고의 숙소</p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex bg-stone-100 p-1.5 rounded-2xl">
                            {isPicksLoading ? (
                                <div className="w-64 h-10 bg-stone-200 rounded-xl animate-pulse" />
                            ) : (
                                dodamPicks.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActivePickTab(category.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${activePickTab === category.id
                                            ? 'bg-white text-[#ff3253] shadow-sm'
                                            : 'text-stone-400 hover:text-stone-600'
                                            }`}
                                    >
                                        {category.title.split(' ')[0]}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isPicksLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-[320px] rounded-[32px] bg-stone-100 animate-pulse" />
                            ))
                        ) : (
                            dodamPicks
                                .find(cat => cat.id === activePickTab)
                                ?.items.slice(0, 4).map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                region: item.address?.split(' ')[0] || item.title,
                                                placeId: item.id
                                            });
                                            router.push(`/travel/map?${params.toString()}`);
                                        }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative h-[250px] rounded-[32px] overflow-hidden mb-4 shadow-lg">
                                            <img
                                                src={item.imageUrl || 'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?q=80&w=400&auto=format&fit=crop'}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black text-white ${item.badge === '인기' ? 'bg-orange-500' :
                                                    item.badge === '추천' ? 'bg-[#ff3253]' : 'bg-blue-500'
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xl font-bold text-[#2d241a] line-clamp-1 group-hover:text-[#ff3253] transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg">
                                                    <span className="text-yellow-400">★</span>
                                                    <span className="text-xs font-bold text-[#2d241a]">{item.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-stone-400 text-xs font-bold mb-2 line-clamp-1">{item.address}</p>
                                            <div className="flex gap-2 text-stone-300 text-xs">
                                                <span>리뷰 {item.reviews}</span>
                                                <span>•</span>
                                                <span>저장 많은 순</span>
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
                            <h3 className="text-3xl font-extrabold mb-3">일본 료칸<br />최대 40% 할인</h3>
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
