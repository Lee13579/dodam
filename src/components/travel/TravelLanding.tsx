"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Plus, Minus, ChevronLeft, ChevronRight, Dog, Sparkles } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from 'next/image';

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

interface DodamPick {
    id: string;
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

const AI_EXAMPLES = [
    "마음껏 뛰어놀 수 있는 넓은 천연 잔디 마당",
    "겁이 많은 아이를 위한 조용하고 프라이빗한 공간",
    "바다 냄새 맡으며 함께 걷기 좋은 해안가 산책로",
    "다른 강아지 친구들과 사귀기 좋은 활기찬 카페",
    "대형견도 눈치 보지 않고 편히 쉴 수 있는 넓은 숙소"
];

// [NEW] Travel League Component
const TravelLeague = () => {
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/travel/ranking')
            .then(res => res.json())
            .then(data => {
                setRankings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section className="mt-8 px-6">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900">🏆 실시간 여행 리그</h2>
                <div className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-4 -mt-2">이번 주 반려견 가족들이 가장 많이 검색한 지역은?</p>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                {rankings.map((item, idx) => (
                    <div
                        key={item.rank}
                        onClick={() => router.push(`/travel/map?region=${item.region}&keyword=${item.keywords[0]}`)}
                        className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                                ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : ''}
                                ${idx === 1 ? 'bg-gray-100 text-gray-600 ring-2 ring-gray-200' : ''}
                                ${idx === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : ''}
                                ${idx > 2 ? 'bg-white text-gray-400 border border-gray-100' : ''}
                            `}>
                                {item.rank}
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{item.region}</div>
                                <div className="text-xs text-gray-400 mt-0.5 max-w-[150px] truncate">
                                    {item.keywords.slice(0, 2).join(', ')}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {idx === 0 && <span className="text-[10px] text-red-500 font-bold">🔥 인기 급상승</span>}
                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {item.ratio}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default function TravelLanding() {
    const router = useRouter();

    const [people, setPeople] = useState('2');
    const [children, setChildren] = useState('0');
    const [dogs, setDogs] = useState('1');
    const [region, setRegion] = useState('');
    const [conditions, setConditions] = useState('');

    const KOREAN_REGIONS = [
        '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
        '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
        '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성',
        '평택', '의정부', '시흥', '파주', '김포', '광명', '군포', '오산',
        '양주', '이천', '구리', '안성', '포천', '의왕', '하남', '여주', '양평',
        '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척',
        '청주', '충주', '제천',
        '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진',
        '전주', '군산', '익산', '정읍', '남원', '김제',
        '목포', '여수', '순천', '나주', '광양',
        '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산',
        '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산',
        '제주시', '서귀포',
        '가평', '양양', '평창', '정선'
    ];

    const PRESET_KEYWORDS = [
        { label: '#넓은잔디마당', value: '넓은 잔디마당이 있는 곳' },
        { label: '#조용한분위기', value: '사람이 적고 조용한 곳' },
        { label: '#사진찍기좋은', value: '인생샷 찍기 좋은 예쁜 곳' },
        { label: '#대형견환영', value: '대형견 입장이 자유로운 곳' },
        { label: '#커피맛집', value: '커피와 디저트가 맛있는 카페' },
        { label: '#바다산책', value: '바다 전망이 좋은 산책로' },
        { label: '#프라이빗룸', value: '프라이빗한 개별 공간이 있는 곳' },
        { label: '#주차편한', value: '주차가 편리한 곳' },
        { label: '#호캉스추천', value: '럭셔리한 애견 동반 호텔' },
        { label: '#오프리쉬존', value: '목줄 없이 뛰어놀 수 있는 곳' },
        { label: '#애견동반식당', value: '맛있는 식사를 함께할 수 있는 곳' },
        { label: '#루프탑뷰', value: '탁 트인 루프탑이 있는 곳' },
    ];

    const toggleKeyword = (val: string) => {
        const currentCount = PRESET_KEYWORDS.filter(kw => conditions.includes(kw.value)).length;

        if (conditions.includes(val)) {
            setConditions(conditions.replace(val, '').replace('  ', ' ').trim());
        } else {
            if (currentCount >= 3) return; // 최대 3개 제한
            setConditions((conditions + ' ' + val).trim());
        }
    };

    // Filter regions based on input
    const filteredRegions = region
        ? KOREAN_REGIONS.filter(r => r.includes(region))
        : KOREAN_REGIONS.slice(0, 12); // Show top 12 when empty

    const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);

    const [dodamPicks, setDodamPicks] = useState<DodamPick[]>([]);
    const [isPicksLoading, setIsPicksLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    const [showRegionPopover, setShowRegionPopover] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showGuestPopover, setShowGuestPopover] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 86400000));
    const [viewDate, setViewDate] = useState(new Date());

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

    // Get User Geolocation
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Geolocation denied", err)
            );
        }
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
                const queryParams = userLocation ? `?lat=${userLocation.lat}&lng=${userLocation.lng}` : '';
                const res = await fetch(`/api/travel/picks${queryParams}`);
                if (res.ok) setDodamPicks(await res.json());
            } catch (e) { console.error(e); } finally { setIsPicksLoading(false); }
        };
        fetchTrending();
        fetchPicks();
    }, [userLocation]); // Re-fetch when location is found

    const handleSearch = () => {
        const params = new URLSearchParams({ region: region || '서울', people, children, dogs, conditions });
        router.push(`/travel/map?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F6F6] dark:bg-[#221016] relative overflow-x-hidden text-[#1b0d12] dark:text-white font-sans">
            <Header />
            <div className="h-[73px] md:h-[80px]" />

            <section className="relative px-4 pt-2 container mx-auto max-w-7xl">
                <div className="relative flex min-h-[520px] flex-col gap-6 rounded-[32px] items-center justify-start p-6 text-center shadow-2xl">
                    <div className="absolute inset-0 z-0 rounded-[32px] overflow-hidden">
                        <AnimatePresence>
                            {HERO_IMAGES.map((img, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: index === currentImageIndex ? 1 : 0, scale: index === currentImageIndex ? 1 : 1.1 }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Image src={img} alt="Hero" fill className="object-cover" priority={index === 0} />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="relative z-10 mt-12 flex flex-col gap-3 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold font-outfit drop-shadow-lg">반려견과 함께하는<br />특별한 여행</h1>
                        <p className="text-base md:text-lg font-medium drop-shadow-md">도담이 엄선한 최고의 애견 동반 숙소와 명소</p>
                    </div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 mt-auto mb-4 w-full max-w-3xl bg-white/40 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-3 bg-white/80 rounded-2xl p-4 hover:border-pink-300 transition-colors group cursor-pointer relative">
                            <MapPin className="text-[#ee2b6c] w-6 h-6" />
                            <div className="flex-1 text-left">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">여행지</label>
                                <input className="w-full bg-transparent border-none focus:ring-0 text-base font-bold p-0 text-[#1b0d12]" placeholder="어디로 떠나시나요?" type="text" value={region} onChange={e => setRegion(e.target.value)} onFocus={() => setShowRegionPopover(true)} />
                            </div>
                            <AnimatePresence>
                                {showRegionPopover && (
                                    <motion.div
                                        key="region-popover-container"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="fixed inset-0 z-40" onClick={() => setShowRegionPopover(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-4 left-0 w-full md:w-[400px] z-50 bg-white shadow-xl rounded-3xl p-6 text-left max-h-[400px] overflow-y-auto">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-4">
                                                {region ? `"${region}" 검색 결과` : '인기 여행지'}
                                            </h5>
                                            <div className="grid grid-cols-3 gap-2">
                                                {filteredRegions.length > 0 ? (
                                                    filteredRegions.map((regionName) => (
                                                        <button
                                                            key={regionName}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRegion(regionName);
                                                                setShowRegionPopover(false);
                                                            }}
                                                            className="flex items-center justify-center p-3 rounded-2xl bg-gray-50 hover:bg-pink-50 transition-colors text-center"
                                                        >
                                                            <span className="font-bold text-sm text-gray-800">{regionName}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="col-span-3 text-center py-6 text-gray-400 text-sm">
                                                        검색 결과가 없습니다
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div onClick={() => setShowCalendar(true)} className="flex-1 flex items-center gap-3 bg-white/80 rounded-2xl p-4 hover:border-pink-300 transition-colors cursor-pointer relative">
                                <Calendar className="text-[#ee2b6c] w-6 h-6" />
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">일정</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">{startDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - {endDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <AnimatePresence>
                                    {showCalendar && (
                                        <motion.div
                                            key="calendar-popover-container"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowCalendar(false); }} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full mt-2 left-0 w-[340px] z-50 bg-white shadow-2xl rounded-3xl p-5 border border-gray-100 text-left overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><ChevronLeft size={18} /></button>
                                                    <h5 className="font-bold text-sm text-gray-800">{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h5>
                                                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><ChevronRight size={18} /></button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                                        <div key={d} className="text-[10px] font-black text-gray-300 text-center py-1">{d}</div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {(() => {
                                                        const days = [];
                                                        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
                                                        const lastDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

                                                        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

                                                        for (let d = 1; d <= lastDate; d++) {
                                                            const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
                                                            const isStart = startDate?.toDateString() === current.toDateString();
                                                            const isEnd = endDate?.toDateString() === current.toDateString();
                                                            const isBetween = startDate && endDate && current > startDate && current < endDate;
                                                            const isToday = new Date().toDateString() === current.toDateString();

                                                            days.push(
                                                                <button
                                                                    key={d}
                                                                    onClick={() => {
                                                                        if (!startDate || (startDate && endDate)) {
                                                                            setStartDate(current);
                                                                            setEndDate(null);
                                                                        } else if (current < startDate) {
                                                                            setStartDate(current);
                                                                            setEndDate(startDate);
                                                                        } else {
                                                                            setEndDate(current);
                                                                        }
                                                                    }}
                                                                    className={`
                                                                        relative h-10 w-full text-xs font-bold rounded-xl transition-all flex items-center justify-center
                                                                        ${isStart || isEnd ? 'bg-pink-500 text-white shadow-md shadow-pink-100' : ''}
                                                                        ${isBetween ? 'bg-pink-50 text-pink-500' : ''}
                                                                        ${!isStart && !isEnd && !isBetween ? 'hover:bg-gray-50 text-gray-700' : ''}
                                                                        ${isToday && !isStart && !isEnd ? 'border border-pink-200' : ''}
                                                                    `}
                                                                >
                                                                    {d}
                                                                </button>
                                                            );
                                                        }
                                                        return days;
                                                    })()}
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">선택된 일정</span>
                                                        <span className="text-xs font-black text-pink-500">
                                                            {startDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                            {endDate ? ` - ${endDate?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}` : ' 부터 시작'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowCalendar(false)}
                                                        disabled={!startDate || !endDate}
                                                        className="px-6 py-2 bg-pink-500 text-white rounded-xl text-xs font-black shadow-lg shadow-pink-100 disabled:opacity-50 transition-opacity"
                                                    >
                                                        선택 완료
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div onClick={() => setShowGuestPopover(true)} className="flex-1 flex items-center gap-3 bg-white/80 rounded-2xl p-4 hover:border-pink-300 transition-colors cursor-pointer relative">
                                <Dog className="text-[#ee2b6c] w-6 h-6" />
                                <div className="text-left">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">인원 & 반려견</label>
                                    <span className="text-sm font-bold text-[#1b0d12]">성인 {people}, 어린이 {children}, 반려견 {dogs}</span>
                                </div>
                                <AnimatePresence>
                                    {showGuestPopover && (
                                        <motion.div
                                            key="guest-popover-container"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowGuestPopover(false); }} />
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 left-0 w-full md:w-[320px] z-50 bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 text-left">
                                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-4">인원 및 반려견</h5>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-800">성인</p>
                                                            <p className="text-[10px] text-gray-400">만 18세 이상</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={(e) => { e.stopPropagation(); setPeople(Math.max(1, parseInt(people) - 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus size={14} /></button>
                                                            <span className="font-bold w-4 text-center">{people}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); setPeople((parseInt(people) + 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-800">어린이</p>
                                                            <p className="text-[10px] text-gray-400">만 17세 이하</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={(e) => { e.stopPropagation(); setChildren(Math.max(0, parseInt(children) - 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus size={14} /></button>
                                                            <span className="font-bold w-4 text-center">{children}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); setChildren((parseInt(children) + 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-800">반려견</p>
                                                            <p className="text-[10px] text-gray-400">모든 견종 포함</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={(e) => { e.stopPropagation(); setDogs(Math.max(0, parseInt(dogs) - 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus size={14} /></button>
                                                            <span className="font-bold w-4 text-center">{dogs}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); setDogs((parseInt(dogs) + 1).toString()) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); setShowGuestPopover(false); }} className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-100">선택 완료</button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Emotional Request Input */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white focus-within:border-pink-300 transition-all group relative overflow-hidden">
                                <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shadow-sm text-pink-500 z-10">
                                    <Sparkles size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 text-left relative h-10 flex flex-col justify-center">
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-bold p-0 text-[#1b0d12] relative z-20"
                                        type="text"
                                        value={conditions}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val.length <= 60) {
                                                setConditions(val);
                                            } else {
                                                setConditions(val.slice(0, 60));
                                            }
                                        }}
                                    />
                                    <div className="absolute right-0 bottom-[-12px] z-30">
                                        <span className={`text-[9px] font-black transition-colors ${conditions.length >= 60 ? 'text-red-500' : 'text-gray-300'
                                            }`}>
                                            {conditions.length} / 60
                                        </span>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {!conditions && (
                                            <motion.div
                                                key="instruction"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute left-0 flex items-center gap-1.5 pointer-events-none z-10"
                                            >
                                                <span className="text-sm font-black text-[#1b0d12] whitespace-nowrap opacity-80">우리 아이를 위한 요청사항</span>
                                                <motion.span
                                                    key={placeholderIndex}
                                                    initial={{ x: 10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: -10, opacity: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-sm font-bold text-gray-400 whitespace-nowrap"
                                                >
                                                    (예: {AI_EXAMPLES[placeholderIndex]})
                                                </motion.span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Preset Keyword Badges (Dense & Scattered Cloud) */}
                            <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 gap-2 border border-white/10">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest border-r border-white/20 pr-2">추천 키워드</span>
                                        <span className={`text-[11px] font-black transition-colors ${PRESET_KEYWORDS.filter(kw => conditions.includes(kw.value)).length >= 3
                                            ? 'text-pink-300'
                                            : 'text-white/80'
                                            }`}>
                                            {PRESET_KEYWORDS.filter(kw => conditions.includes(kw.value)).length} / 3 선택
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3 px-1 py-1 w-full">
                                    {PRESET_KEYWORDS.map((kw, i) => {
                                        const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
                                        const offsets = ['translate-y-0', 'translate-y-1', '-translate-y-1', 'translate-y-0.5', '-translate-y-0.5', 'translate-y-1', '-translate-y-1', 'translate-y-0'];

                                        return (
                                            <button
                                                key={kw.value}
                                                onClick={() => toggleKeyword(kw.value)}
                                                className={`flex-grow md:flex-grow-0 px-4 py-2.5 rounded-[18px] text-[13px] font-black transition-all border shadow-sm hover:shadow-md active:scale-95 ${rotations[i % rotations.length]
                                                    } ${offsets[i % offsets.length]
                                                    } ${conditions.includes(kw.value)
                                                        ? 'bg-[#ee2b6c] text-white border-[#ee2b6c] shadow-pink-200'
                                                        : 'bg-white text-[#1b0d12] border-white hover:bg-[#fff5f8] hover:text-[#ee2b6c] hover:border-pink-100'
                                                    }`}
                                            >
                                                {kw.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSearch} className="bg-[#ee2b6c] hover:bg-[#d01b55] text-white font-bold h-14 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-lg group">
                            <Search size={20} className="group-hover:scale-110 transition-transform" />
                            <span>맞춤 여행지 찾기</span>
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
                                <motion.div key={item.id || idx} onClick={() => router.push(`/travel/map?region=${item.address?.split(' ')[0] || item.title}&placeId=${item.id}`)} className="w-[260px] flex-shrink-0 h-[320px] rounded-[28px] overflow-hidden relative group cursor-pointer shadow-lg snap-start">
                                    <Image
                                        src={item.imageUrl || '/images/place_placeholder.png'}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/place_placeholder.png';
                                        }}
                                    />
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
                        {canScrollLeft && <motion.button key="trending-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTrending('left')} className="absolute top-1/2 -translate-y-1/2 -left-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronLeft size={24} /></motion.button>}
                        {canScrollRight && <motion.button key="trending-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTrending('right')} className="absolute top-1/2 -translate-y-1/2 -right-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronRight size={24} /></motion.button>}
                    </AnimatePresence>
                </div>
            </section>

            {[
                { id: 'resort', title: '우리 아이 호캉스 🏨', desc: '따뜻한 실내에서 즐기는 프리미엄 휴식', layout: 'normal' },
                { id: 'dining', title: '함께 즐기는 미식 🍴', desc: '반려견과 편안하게 즐기는 맛집과 카페', layout: 'normal' },
                { id: 'play', title: '오프리쉬 자유시간 🐾', desc: '활동적인 아이들을 위한 최적의 놀이 코스', hasCourse: true, layout: 'normal' },
                { id: 'nature', title: '계절을 걷는 산책로 🌳', desc: '맑은 공기 마시며 즐기는 야외 산책', layout: 'normal' }
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
                                dodamPicks.find(cat => cat.id === section.id)?.items.slice(0, 10).map((item: Place, idx: number) => (
                                    <motion.div key={item.id || idx} whileHover={{ y: -10 }} className={`${section.layout === 'wide' ? 'w-[450px]' : 'w-[300px]'} flex-shrink-0 flex flex-col snap-start cursor-pointer`} onClick={() => router.push(`/travel/map?region=${item.address?.split(' ')[0] || item.title}&placeId=${item.id}`)}>
                                        <div className="relative h-72 rounded-[32px] overflow-hidden shadow-xl">
                                            <Image
                                                src={item.imageUrl || '/images/place_placeholder.png'}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                sizes="(max-width: 768px) 100vw, 300px"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/place_placeholder.png';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                            {section.hasCourse && idx === 0 && <div className="absolute top-5 left-5 z-10"><span className="bg-[#ee2b6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">도담 추천 코스</span></div>}
                                            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                                                <h4 className={`font-black group-hover:text-pink-200 transition-colors mb-1 ${section.layout === 'wide' ? 'text-2xl' : 'text-xl'}`}>{section.hasCourse && idx === 0 ? `${item.title} & 산책` : item.title}</h4>
                                                <p className="text-xs text-white/70 font-bold flex items-center gap-1"><MapPin size={10} className="text-pink-400" /> {item.address}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                        <AnimatePresence>
                            {sectionScrollState[section.id]?.left && <motion.button key={`${section.id}-left`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleScrollAction(section.id, 'left')} className="absolute top-1/2 -translate-y-1/2 -left-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronLeft size={24} /></motion.button>}
                            {sectionScrollState[section.id]?.right !== false && <motion.button key={`${section.id}-right`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleScrollAction(section.id, 'right')} className="absolute top-1/2 -translate-y-1/2 -right-5 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-700"><ChevronRight size={24} /></motion.button>}
                        </AnimatePresence>
                    </div>
                </section>
            ))}
            <div className="h-24" />
            <Footer />
        </div>
    );
}