"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import TravelLanding from "@/components/travel/TravelLanding";
import TravelMap, { Place } from "@/components/travel/TravelMap";
import MapContainer from "@/components/travel/MapContainer";

const MOCK_PLACES: Place[] = [
    { id: 'h1', name: 'Grand InterContinental Seoul', title: 'Grand InterContinental', category: 'Hotel', address: 'Gangnam-gu, Seoul', lat: 37.5096, lng: 127.0602 },
    { id: 'h2', name: 'L\'Escape Hotel', title: 'L\'Escape Hotel', category: 'Hotel', address: 'Jung-gu, Seoul', lat: 37.5599, lng: 126.9806 },
    { id: 'c1', name: 'Bite & Sip Puppy Cafe', title: 'Bite & Sip', category: 'Cafe', address: 'Mapo-gu, Seoul', lat: 37.5555, lng: 126.9230 },
    { id: 'c2', name: 'Urban Dog', title: 'Urban Dog', category: 'Cafe', address: 'Seocho-gu, Seoul', lat: 37.4870, lng: 127.0150 },
    { id: 'p1', name: 'Seoul Forest Park', title: 'Seoul Forest', category: 'Park', address: 'Seongdong-gu, Seoul', lat: 37.5444, lng: 127.0374 },
    { id: 'p2', name: 'Han River Park (Yeouido)', title: 'Han River Park', category: 'Park', address: 'Yeongdeungpo-gu, Seoul', lat: 37.5284, lng: 126.9344 },
    { id: 'p3', name: 'Banpo Hangang Park', title: 'Banpo Park', category: 'Park', address: 'Seocho-gu, Seoul', lat: 37.5098, lng: 126.9947 },
    { id: 'r1', name: 'Piggy & Doggy BBQ', title: 'Piggy & Doggy', category: 'Restaurant', address: 'Gangnam-gu, Seoul', lat: 37.5160, lng: 127.0400 },
    { id: 'r2', name: 'Sunshine Brunch', title: 'Sunshine Brunch', category: 'Restaurant', address: 'Yongsan-gu, Seoul', lat: 37.5350, lng: 126.9900 },
];

export default function TravelUnifiedPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const resolvedParams = React.use(params);
    const isMapMode = resolvedParams.slug?.[0] === 'map';
    const searchParams = useSearchParams();

    // Initial Params for Map Mode
    const initRegion = searchParams.get('region') || '서울';
    const initPeople = searchParams.get('people') || '2';
    const initDogs = searchParams.get('dogs') || '1';
    const initDays = searchParams.get('days') || '1 Day';

    const [itinerary, setItinerary] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // Initial Generation Effect (Only in Map Mode)
    useEffect(() => {
        if (isMapMode && initRegion) {
            handleGenerateCourse({
                region: initRegion,
                people: initPeople,
                dogs: initDogs,
                days: initDays,
                conditions: '최적의 코스 추천'
            });
        }
    }, [isMapMode, initRegion]); // Removed other deps to prevent re-fetching on small changes

    const handleGenerateCourse = async (criteria: { days: string, people: string, dogs: string, region: string, conditions: string }) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/travel/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(criteria),
            });

            if (!response.ok) {
                // If API fails, fall back to mock or empty
                const errorData = await response.json();
                console.warn("API Error:", errorData);
                // throw new Error(errorData.error);
            } else {
                const newPlaces: Place[] = await response.json();
                setItinerary(newPlaces);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPlace = (place: Place) => {
        setItinerary(prev => [...prev, place]);
    };

    const handleRemovePlace = (id: string, index: number) => {
        setItinerary(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-[#fffdfa] relative">
            <AnimatePresence mode="wait">
                {/* 1. LANDING VIEW */}
                {!isMapMode && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                        className="absolute inset-0 z-10"
                    >
                        <TravelLanding />
                    </motion.div>
                )}

                {/* 2. MAP VIEW */}
                {isMapMode && (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-screen overflow-hidden bg-[#fffdfa] relative z-20"
                    >
                        {/* Simple Header for Map View */}
                        <div className="h-[60px] bg-white border-b border-[#efebe8] flex items-center px-6 justify-between flex-shrink-0 z-30 shadow-sm relative">
                            <a href="/travel" className="font-outfit font-bold text-lg text-[#2D241A] flex items-center gap-2 hover:opacity-70 transition-opacity">
                                <div className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                                    <PawPrint size={14} />
                                </div>
                                <span className="tracking-tight">도담여행</span>
                            </a>
                            <div className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                                {initRegion} 맞춤 여행 ✈️
                            </div>
                        </div>

                        <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-60px)] relative">
                            {/* Left Sidebar: Planner */}
                            <aside className="w-full md:w-[400px] lg:w-[420px] bg-white h-full z-10 shadow-xl flex-shrink-0 border-r border-[#efebe8]">
                                <TravelMap
                                    onAddPlace={handleAddPlace}
                                    itinerary={itinerary}
                                    onRemovePlace={handleRemovePlace}
                                    allPlaces={MOCK_PLACES}
                                    onGenerateCourse={handleGenerateCourse}
                                    isLoading={isLoading}
                                    initialRegion={initRegion}
                                    initialPeople={initPeople}
                                    initialDogs={initDogs}
                                    onHoverPlace={setFocusedId}
                                />
                            </aside>

                            {/* Right Content: Map */}
                            <section className="flex-1 relative w-full h-full bg-[#f0f0f0]">
                                <div className="absolute inset-0 p-0">
                                    <MapContainer markers={itinerary} focusedId={focusedId} />
                                </div>
                            </section>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
