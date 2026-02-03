"use client";

import React, { useState } from 'react';
import Header from "@/components/Header";
import TravelPlanner, { Place } from "@/components/travel/TravelPlanner";
import MapContainer from "@/components/travel/MapContainer";
import TravelHero from "@/components/travel/TravelHero";
import { motion, AnimatePresence } from 'framer-motion';

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

export default function TravelPage() {
    const [hasSearched, setHasSearched] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState({
        destination: '서울',
        date: '',
        people: 2,
        dogs: 1
    });

    const [itinerary, setItinerary] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (criteria: any) => {
        setSearchCriteria(criteria);
        setHasSearched(true);
        // Automatically trigger AI generation based on search
        handleGenerateCourse({
            days: '1 Day',
            people: criteria.people.toString(),
            dogs: criteria.dogs.toString(),
            region: criteria.destination,
            conditions: '최적의 코스 추천'
        });
    };

    const handleAddPlace = (place: Place) => {
        setItinerary(prev => [...prev, place]);
    };

    const handleRemovePlace = (id: string, index: number) => {
        setItinerary(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateCourse = async (criteria: { days: string, people: string, dogs: string, region: string, conditions: string }) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/travel/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(criteria),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate course');
            }

            const newPlaces: Place[] = await response.json();
            setItinerary(newPlaces);
        } catch (error) {
            console.error(error);
            alert("Failed to generate course. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const [focusedId, setFocusedId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#fffdfa]">
            <Header />

            <AnimatePresence mode="wait">
                {!hasSearched ? (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="pt-[80px]"
                    >
                        <TravelHero onSearch={handleSearch} />
                    </motion.div>
                ) : (
                    <motion.main
                        key="planner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-[80px] h-[calc(100vh)] flex flex-col md:flex-row overflow-hidden"
                    >
                        {/* Left Sidebar: Planner */}
                        <aside className="w-full md:w-[400px] lg:w-[450px] bg-white h-full z-10 shadow-xl flex-shrink-0">
                            <TravelPlanner
                                onAddPlace={handleAddPlace}
                                itinerary={itinerary}
                                onRemovePlace={handleRemovePlace}
                                allPlaces={MOCK_PLACES}
                                onGenerateCourse={handleGenerateCourse}
                                isLoading={isLoading}
                                initialRegion={searchCriteria.destination}
                                initialPeople={searchCriteria.people.toString()}
                                initialDogs={searchCriteria.dogs.toString()}
                                onHoverPlace={setFocusedId}
                            />
                        </aside>

                        {/* Right Content: Map */}
                        <section className="flex-1 relative w-full h-full bg-[#f0f0f0]">
                            <div className="absolute inset-0 p-4">
                                <MapContainer markers={itinerary} focusedId={focusedId} />
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={() => setHasSearched(false)}
                                className="absolute top-8 right-8 z-20 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full font-bold text-sm text-slate-600 shadow-lg hover:bg-white transition-all"
                            >
                                다시 검색하기
                            </button>
                        </section>
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}
