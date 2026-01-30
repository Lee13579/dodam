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

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-[#2d241a] font-outfit leading-tight">
                        우리 아이 <br />
                        <span className="text-pink-500">도담하개</span> <br />
                        예쁘개
                    </h1>

                    <p className="max-w-xl text-xl text-[#5d4d3d] mb-10 leading-relaxed">
                        사랑스러운 반려견의 사진 한 장으로 완성되는 스타일 변신! <br />
                        도담이 제안하는 세련된 컷과 <br />
                        어울리는 의상을 지금 바로 확인해 보세요.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById('styling')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-pink-500 hover:bg-pink-400 text-white rounded-3xl font-bold text-xl flex items-center shadow-xl shadow-pink-100 transition-all font-outfit"
                        >
                            스타일링 시작하기 <Scissors className="ml-3 w-6 h-6" />
                        </motion.button>
                        <button className="px-10 py-5 bg-white hover:bg-orange-50 border-2 border-orange-100 text-orange-600 rounded-3xl font-bold text-xl transition-all font-outfit">
                            갤러리 보기
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileHover="hover"
                    animate="initial"
                    className="relative group/stack py-10"
                >
                    <div className="relative w-full aspect-[4/5] max-w-[400px] mx-auto flex items-end justify-center">
                        {/* Photo Stack - Far Left */}
                        <motion.div
                            variants={{
                                initial: { rotate: -15, x: 0, opacity: 0.4, scale: 0.8 },
                                hover: { rotate: -35, x: -220, y: -20, opacity: 1, scale: 0.9 }
                            }}
                            className="absolute bottom-0 z-0 w-full h-full rounded-[40px] overflow-hidden border-4 border-white shadow-xl transition-all duration-700 ease-out origin-bottom"
                        >
                            <Image src="/images/styles/hawaiian.png" alt="Hawaiian Style" fill className="object-cover" />
                        </motion.div>

                        {/* Photo Stack - Left */}
                        <motion.div
                            variants={{
                                initial: { rotate: -8, x: 0, opacity: 0.6, scale: 0.9 },
                                hover: { rotate: -18, x: -120, y: -10, opacity: 1, scale: 0.95 }
                            }}
                            className="absolute bottom-0 z-0 w-full h-full rounded-[40px] overflow-hidden border-4 border-white shadow-xl transition-all duration-700 ease-out origin-bottom"
                        >
                            <Image src="/images/styles/streetwear.png" alt="Streetwear Style" fill className="object-cover" />
                        </motion.div>

                        {/* Photo Stack - Right */}
                        <motion.div
                            variants={{
                                initial: { rotate: 8, x: 0, opacity: 0.6, scale: 0.9 },
                                hover: { rotate: 18, x: 120, y: -10, opacity: 1, scale: 0.95 }
                            }}
                            className="absolute bottom-0 z-0 w-full h-full rounded-[40px] overflow-hidden border-4 border-white shadow-xl transition-all duration-700 ease-out origin-bottom"
                        >
                            <Image src="/images/styles/formal_tuxedo.png" alt="Formal Style" fill className="object-cover" />
                        </motion.div>


                        {/* Main Image Center (Poodle) */}
                        <motion.div
                            variants={{
                                initial: { y: 0, scale: 1 },
                                hover: { y: -20, scale: 1.05 }
                            }}
                            className="relative z-10 w-full h-full rounded-[50px] overflow-hidden border-8 border-white shadow-2xl transition-all duration-500 bg-white"
                        >
                            <Image
                                src="/hero_poodle_clean.png"
                                alt="Styled Toy Poodle"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Status Label */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white rounded-2xl shadow-lg flex items-center gap-3 animate-pulse-soft z-20 whitespace-nowrap"
                        >
                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                            <span className="font-bold text-[#2d241a]">관심 폭발! 인기 스타일 매칭</span>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
