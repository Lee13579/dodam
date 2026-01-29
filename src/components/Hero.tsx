"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Scissors, Heart } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fff9f2]">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 left-10 w-24 h-24 bg-pink-200 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl animate-pulse-soft" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left"
                >
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-medium mb-6 shadow-sm">
                        <Heart className="w-4 h-4 mr-2 fill-pink-600" /> 반려견 맞춤형 프리미엄 스타일링
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-[#2d241a] font-jua leading-tight">
                        우리 아이 <br />
                        <span className="text-pink-500">도담도담</span> <br />
                        예쁘게
                    </h1>

                    <p className="max-w-xl text-xl text-[#5d4d3d] mb-10 leading-relaxed">
                        사랑스러운 반려견의 사진 한 장으로 완성되는 스타일 변신! <br />
                        도담도담이 제안하는 세련된 컷과 <br />
                        어울리는 의상을 지금 바로 확인해 보세요.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById('styling')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-pink-500 hover:bg-pink-400 text-white rounded-3xl font-bold text-xl flex items-center shadow-xl shadow-pink-100 transition-all font-jua"
                        >
                            스타일링 시작하기 <Scissors className="ml-3 w-6 h-6" />
                        </motion.button>
                        <button className="px-10 py-5 bg-white hover:bg-orange-50 border-2 border-orange-100 text-orange-600 rounded-3xl font-bold text-xl transition-all font-jua">
                            갤러리 보기
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                        <div className="absolute inset-0 bg-orange-100 rounded-[60px] rotate-6 scale-105 opacity-50" />
                        <div className="absolute inset-0 bg-pink-100 rounded-[60px] -rotate-3 scale-105 opacity-50" />
                        <div className="relative z-10 w-full h-full rounded-[50px] overflow-hidden border-8 border-white shadow-2xl">
                            <Image
                                src="/hero_poodle.png"
                                alt="Styled Toy Poodle"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Status Label */}
                        <div className="absolute -bottom-4 -left-6 px-6 py-3 bg-white rounded-2xl shadow-lg flex items-center gap-3 animate-pulse-soft z-20">
                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                            <span className="font-bold text-[#2d241a]">관심 폭발! 인기 스타일 매칭</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
