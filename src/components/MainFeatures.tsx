"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MainFeatures() {
    return (
        <section className="py-8 md:py-12 container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Styling Feature Card */}
                <Link href="/styling">
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="relative h-[400px] md:h-[500px] rounded-[48px] overflow-hidden group cursor-pointer shadow-2xl shadow-pink-100/50"
                    >
                        <Image
                            src="/images/styles/streetwear.png"
                            alt="Styling"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-pink-900/20 to-transparent" />

                        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit">스타일 디자이너</h3>
                            <p className="text-white/80 text-lg mb-8 max-w-sm">강아지 사진 한 장으로 완성되는<br />가장 트렌디한 스타일링 제안</p>
                            <div className="flex items-center text-white font-bold group/btn">
                                시작하기 <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Travel Feature Card */}
                <Link href="/travel">
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="relative h-[400px] md:h-[500px] rounded-[48px] overflow-hidden group cursor-pointer shadow-2xl shadow-blue-100/50"
                    >
                        <Image
                            src="/dog_travel_forest_1770088705081.png"
                            alt="Travel"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent" />

                        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit">여행 플래너</h3>
                            <p className="text-white/80 text-lg mb-8 max-w-sm">우리 아이의 성향과 취향을 고려한<br />맞춤형 애견 동반 여행 큐레이션</p>
                            <div className="flex items-center text-white font-bold group/btn">
                                둘러보기 <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </div>
        </section>
    );
}
