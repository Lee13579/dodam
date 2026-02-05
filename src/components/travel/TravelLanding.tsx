"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Plus, Minus, ChevronLeft, ChevronRight, Dog, Heart, Star } from 'lucide-react';
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

const HERO_IMAGES = [
    "/dog_travel_beach_1770088673910.png",
    "/dog_travel_mountain_1770088687642.png",
    "/dog_travel_forest_1770088705081.png",
    "/dog_travel_seoul_1770088720625.png",
    "/dog_travel_lake_1770088735569.png",
    "/dog_travel_cafe_1770088751274.png"
];

const AI_EXAMPLES = [
    "수영장이 있는 조용한 펜션",
    "대형견 입장이 가능한 바다 근처 숙소",
    "아이와 뛰어놀 수 있는 넓은 잔디 마당",
    "브런치가 맛있는 애견 동반 카페",
    "포토존이 많은 감성적인 스테이"
];

export default function TravelLanding() {
    const router = useRouter();

    const [rooms, setRooms] = useState('1');
    const [people, setPeople] = useState('2');
    const [children, setChildren] = useState('0');
    const [dogs, setDogs] = useState('1');
    const [region, setRegion] = useState('');
    const [conditions, setConditions] = useState('');

    const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);

    const [dodamPicks, setDodamPicks] = useState<any[]>([]);
    const [isPicksLoading, setIsPicksLoading] = useState(true);

    const [showRegionPopover, setShowRegionPopover] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showGuestPopover, setShowGuestPopover] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 86400000));

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const trendingScrollRef = useRef<HTMLDivElement>(null);

    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [sectionScrollState, setSectionScrollState] = useState<{ [key: string]: { left: boolean, right: boolean } }>({});

    const checkScroll = (id: string) => {
        const el = id === 'trending' ? trendingScrollRef.current : sectionRefs.current[id];
        if (el) {
            const { scrollLeft, scrollWidth, clientWidth } = el;
            const left = scrollLeft > 10;
            const right = scrollLeft + clientWidth < scrollWidth - 10;
            if (id === 'trending') {
                setCanScrollLeft(left);
                setCanScrollRight(right);
            } else {
                setSectionScrollState(prev => ({ ...prev, [id]: { left, right } }));
            }
        }
    };

    const handleScrollAction = (id: string, direction: 'left' | 'right') => {
        const el = id === 'trending' ? trendingScrollRef.current : sectionRefs.current[id];
        if (el) {
            const cardWidth = 300;
            const currentScroll = el.scrollLeft;
            const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
            el.scrollTo({ left: currentScroll + scrollAmount, behavior: 'smooth' });
            setTimeout(() => checkScroll(id), 500);
        }
    };

    const scrollTrending = (direction: 'left' | 'right') => handleScrollAction('trending', direction);

    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setPlaceholderIndex((prev) => (prev + 1) % AI_EXAMPLES.length), 3000);
        return () => clearInterval(interval);
    }, []);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length), 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/travel/trending');
                if (res.ok) setTrendingPlaces(await res.json());
            } catch (e) { console.error(e); } finally { setIsTrendingLoading(false); }
        };
        const fetchPicks = async () => {
            try {
                const res = await fetch('/api/travel/picks');
                if (res.ok) setDodamPicks(await res.json());
            } catch (e) { console.error(e); } finally { setIsPicksLoading(false); }
        };
        fetchTrending();
        fetchPicks();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams({ region: region || '서울', people, dogs, conditions });
        router.push(`/travel/map?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F6F6] dark:bg-[#221016] relative overflow-x-hidden text-[#1b0d12] dark:text-white font-sans">
            <Header />
            <div className="h-[73px] md:h-[80px]" />

            <section className="relative px-4 pt-2 container mx-auto max-w-7xl">
                <div className="relative flex min-h-[520px] flex-col gap-6 rounded-[32px] items-center justify-start p-6 text-center overflow-hidden shadow-2xl">
                    <AnimatePresence>
                        <div className="absolute inset-0 z-0">
                            {HERO_IMAGES.map((img, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: index === currentImageIndex ? 1 : 0, scale: index === currentImageIndex ? 1 : 1.1 }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <img src={img} alt="Hero" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>

                    <div className="relative z-10 mt-12 flex flex-col gap-3 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold font-outfit drop-shadow-lg">반려견과 함께하는<br />특별한 여행</h1>
                        <p className="text-base md:text-lg font-medium drop-shadow-md">도담이 엄선한 최고의 애견 동반 숙소와 명소</p>
                    </div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 mt-auto mb-4 w-full max-w-3xl bg-white/80 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-white/30 rounded-2xl p-4 hover:border-pink-300 transition-colors group cursor-pointer relative">
                            <MapPin className="text-[#ee2b6c] w-6 h-6" />
                            <div className="flex-1 text-left">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">여행지</label>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-base font-bold p-0 text-[#1b0d12]" placeholder="어디로 떠나시나요?" type="text" value={region} onChange={e => setRegion(e.target.value)} onFocus={() => setShowRegionPopover(true)} />
                            </div>
                            <AnimatePresence>
                                {showRegionPopover && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowRegionPopover(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-4 left-0 w-full md:w-[400px] z-50 bg-white shadow-xl rounded-3xl p-6 text-left">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-4">추천 여행지</h5>
                                            <div className="grid grid-cols-2 gap-3">
                                                {trendingPlaces.slice(0, 6).map((item) => (
                                                    <button key={item.id} onClick={(e) => { e.stopPropagation(); setRegion(item.address?.split(' ')[0] || item.title); setShowRegionPopover(false); }} className="flex flex-col items-start p-3 rounded-2xl bg-gray-50 hover:bg-pink-50 transition-colors text-left">
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
                            <div onClick={() => setShowCalendar(true)} className="flex-1 flex items-center gap-3 bg-white/30 rounded-2xl p-4 hover:border-pink-300 transition-colors cursor-pointer">
                                <Calendar className="text-[#ee2b6c] w-6 h-6" />
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">일정</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">{startDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - {endDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                            <div onClick={() => setShowGuestPopover(true)} className="flex-1 flex items-center gap-3 bg-white/30 rounded-2xl p-4 hover:border-pink-300 transition-colors cursor-pointer">
                                <Dog className="text-[#ee2b6c] w-6 h-6" />
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">인원 & 반려견</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">성인 {people}, 반려견 {dogs}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSearch} className="bg-[#ee2b6c] hover:bg-[#d01b55] text-white font-bold h-14 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-lg">
                            <Search size={20} /> 검색하기
                        </button>
                    </motion.div>
                </div>
            </section>

            <section className="mt-12 container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold font-outfit">요즘 뜨는 여행지</h3>
                    <button className="text-[#ee2b6c] text-sm font-bold">전체보기</button>
                </div>
                <div className="relative">
                    <div ref={trendingScrollRef} onScroll={() => checkScroll('trending')} className="flex overflow-x-hidden gap-6 pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth">
                        {isTrendingLoading ? [1, 2, 3, 4].map(i => <div key={i} className="w-[260px] flex-shrink-0 h-[320px] bg-gray-100 rounded-[28px] animate-pulse" />) :
                            trendingPlaces.map((item, idx) => (
                                <motion.div key={idx} onClick={() => router.push(`/travel/map?region=${item.address?.split(' ')[0] || item.title}&placeId=${item.id}`)} className="w-[260px] flex-shrink-0 h-[320px] rounded-[28px] overflow-hidden relative group cursor-pointer shadow-lg snap-start">
                                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b'} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <p className="font-bold text-xl mb-1">{item.address?.split(' ')[0] || item.title}</p>
                                        <p className="text-xs text-white/80 line-clamp-1 mb-2">{item.customDesc}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags?.slice(0, 2).map((tag, i) => <span key={i} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">{tag}</span>)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                    <AnimatePresence>
                        {canScrollLeft && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTrending('left')} className="absolute top-1/2 -translate-y-1/2 -left-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronLeft size={24} /></motion.button>}
                        {canScrollRight && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTrending('right')} className="absolute top-1/2 -translate-y-1/2 -right-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronRight size={24} /></motion.button>}
                    </AnimatePresence>
                </div>
            </section>

            {[
                { id: 'resort', title: '우리 아이 호캉스 🏨', desc: '따뜻한 실내에서 즐기는 프리미엄 휴식' },
                { id: 'activity', title: '추천 액티비티 🎈', desc: '놓치면 아쉬운 이번 주 반려견 행사', layout: 'wide' },
                { id: 'play', title: '신나는 순간 🐾', desc: '활동적인 아이들을 위한 최적의 코스', hasCourse: true },
                { id: 'nature', title: '자연과 함께 🌳', desc: '맑은 공기 마시며 즐기는 야외 산책' }
            ].map((section) => (
                <section key={section.id} className="mt-20 container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black font-outfit">{section.title}</h3>
                            <p className="text-gray-400 text-sm font-bold mt-1.5">{section.desc}</p>
                        </div>
                        <button className="text-[#ee2b6c] text-sm font-bold">전체보기</button>
                    </div>
                    <div className="relative group">
                        <div ref={el => { sectionRefs.current[section.id] = el }} onScroll={() => checkScroll(section.id)} className="flex overflow-x-hidden gap-6 pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth">
                            {isPicksLoading ? [1, 2, 3, 4, 5].map(i => <div key={i} className={`${section.layout === 'wide' ? 'w-[450px]' : 'w-[300px]'} flex-shrink-0 h-72 bg-gray-100 rounded-[32px] animate-pulse`} />) :
                                dodamPicks.find(cat => cat.id === section.id)?.items.slice(0, 10).map((item: any, idx: number) => (
                                    <motion.div key={idx} whileHover={{ y: -10 }} className={`${section.layout === 'wide' ? 'w-[450px]' : 'w-[300px]'} flex-shrink-0 flex flex-col snap-start cursor-pointer`} onClick={() => router.push(`/travel/map?region=${item.address?.split(' ')[0] || item.title}&placeId=${item.id}`)}>
                                        <div className="relative h-72 rounded-[32px] overflow-hidden shadow-xl">
                                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                            {section.hasCourse && idx === 0 && <div className="absolute top-5 left-5 z-10"><span className="bg-[#ee2b6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">AI 추천 코스</span></div>}
                                            <button className="absolute top-5 right-5 size-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><Heart size={18} /></button>
                                            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-[10px] font-black text-yellow-400">{item.rating}</span>
                                                    </div>
                                                </div>
                                                <h4 className={`font-black group-hover:text-pink-200 transition-colors mb-1 ${section.layout === 'wide' ? 'text-2xl' : 'text-xl'}`}>{section.hasCourse && idx === 0 ? `${item.title} & 산책` : item.title}</h4>
                                                <p className="text-xs text-white/70 font-bold flex items-center gap-1"><MapPin size={10} className="text-pink-400" /> {item.address}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                        <AnimatePresence>
                            {sectionScrollState[section.id]?.left && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleScrollAction(section.id, 'left')} className="absolute top-1/2 -translate-y-1/2 -left-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronLeft size={24} /></motion.button>}
                            {sectionScrollState[section.id]?.right !== false && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleScrollAction(section.id, 'right')} className="absolute top-1/2 -translate-y-1/2 -right-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronRight size={24} /></motion.button>}
                        </AnimatePresence>
                    </div>
                </section>
            ))}
            <div className="h-24" />
            <Footer />
        </div>
    );
}