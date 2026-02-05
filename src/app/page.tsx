"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MainFeatures from "@/components/MainFeatures";
import GallerySlider from "@/components/GallerySlider";
import TravelTeaser from "@/components/TravelTeaser";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdfa] text-[#433422] selection:bg-pink-100">
      <Header />
      <Hero />

      {/* Primary Feature Pillars */}
      <MainFeatures />

      {/* Travel Teaser */}
      <TravelTeaser />

      {/* Gallery Section */}
      <GallerySlider />

      {/* Value Proposition Section */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-outfit text-[#2d241a] break-keep">왜 <span className="text-pink-500">도담</span>일까요?</h2>
            <p className="text-[#8b7355] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed break-keep">
              도담만의 세심한 큐레이션으로 반려견과 보호자 모두에게 최상의 행복을 드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Style Recommendation Card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white rounded-[48px] shadow-xl shadow-orange-50/40 border border-[#fff4e6] overflow-hidden transition-all flex flex-col h-full"
            >
              <div className="relative h-64 w-full">
                <Image
                  src="/images/why/styling_v3.png"
                  alt="Style Recommendation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4 font-outfit text-[#2d241a] break-keep">어울리는 스타일 추천</h3>
                <p className="text-[#8b7355] text-base md:text-lg leading-relaxed break-keep">우리 아이에게 가장 잘 어울리는 트렌디한 스타일링을 도담이 직접 제안해 드립니다.</p>
              </div>
            </motion.div>

            {/* Travel Suggestion Card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white rounded-[48px] shadow-xl shadow-orange-50/40 border border-[#fff4e6] overflow-hidden transition-all flex flex-col h-full"
            >
              <div className="relative h-64 w-full">
                <Image
                  src="/images/why/travel_v2.png"
                  alt="Travel Suggestion"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4 font-outfit text-[#2d241a] break-keep">맞춤형 여행지 제안</h3>
                <p className="text-[#8b7355] text-base md:text-lg leading-relaxed break-keep">아이의 성향과 취향을 고려하여, 함께 떠나기 좋은 최적의 여행지를 꼼꼼하게 선별합니다.</p>
              </div>
            </motion.div>

            {/* Premium Clothing Card */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white rounded-[48px] shadow-xl shadow-orange-50/40 border border-[#fff4e6] overflow-hidden transition-all flex flex-col h-full"
            >
              <div className="relative h-64 w-full">
                <Image
                  src="/images/why/items_v3.png"
                  alt="Premium Clothing"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-10 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4 font-outfit text-[#2d241a] break-keep">프리미엄 의류 추천</h3>
                <p className="text-[#8b7355] text-base md:text-lg leading-relaxed break-keep">우리 아이에게 꼭 필요한 고품질 기능성 의류와 액세서리를 도담만의 안목으로 추천합니다.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
