"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

const HERO_SLIDES = [
    {
        image: "/images/styles/hawaiian.png",
        title: "하와이안 클래식",
        desc: "자유로운 휴양지 무드"
    },
    {
        image: "/images/styles/streetwear.png",
        title: "스트릿 에디션",
        desc: "힙하고 감각적인 일상"
    },
    {
        image: "/images/styles/formal_tuxedo.png",
        title: "럭셔리 포멀",
        desc: "격식 있는 특별한 날"
    }
];

export default function StylingHero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Slider */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={HERO_SLIDES[currentIndex].image}
                        alt={HERO_SLIDES[currentIndex].title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Premium Overlays */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                </motion.div>
            </AnimatePresence>

            {/* Content Container */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-medium mb-8 shadow-xl">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-300 fill-yellow-300" />
                        도담 AI 스타일 디자이너 프리미엄 서비스
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-outfit leading-[1.1] drop-shadow-2xl">
                        우리 아이의 가장 <br />
                        <span className="text-pink-400">빛나는 순간</span>을 완성하다
                    </h1>

                    <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg break-keep">
                        사진 한 장으로 완성되는 우리 아이만을 위한 <br className="hidden md:block" />
                        고품격 맞춤형 스타일링 제안을 지금 만나보세요.
                    </p>

                    {/* Glassmorphism Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="inline-block p-2 bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20 shadow-2xl"
                    >
                        <button
                            onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-white hover:bg-pink-50 text-pink-600 rounded-[32px] font-bold text-lg md:text-xl flex items-center gap-3 transition-all shadow-xl group"
                        >
                            지금 시작하기
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Slide Navigation Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {HERO_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? "bg-pink-500 w-10 shadow-lg shadow-pink-500/50" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
