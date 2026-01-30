"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GallerySlider from "@/components/GallerySlider";
import StylingWorkflow from "@/components/StylingWorkflow";
import { Smile, ShoppingBag, Heart, Scissors, Trophy } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdfa] text-[#433422] selection:bg-pink-100">
      <Header />
      <Hero />

      <GallerySlider />

      {/* Styling Section */}
      <section id="styling" className="py-24 bg-[#fff9f2] border-y border-[#ffe8cc]">
        <StylingWorkflow />
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">왜 <span className="text-pink-500">도담</span>일까요?</h2>
          <p className="text-[#8b7355] text-xl max-w-xl mx-auto">도담만의 세심한 스타일링으로 반려견과 보호자 모두에게 행복을 드립니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-orange-50/50 border border-[#fff4e6] text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-500 mx-auto mb-8 shadow-inner">
              <Smile className="w-8 h-8 fill-pink-500/20" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-outfit">실감나는 스타일 시각화</h3>
            <p className="text-[#8b7355] text-lg leading-relaxed">미용실 예약 전, 우리 아이가 어떤 모습일지 미리 확인하세요.</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-orange-50/50 border border-[#fff4e6] text-center transform md:-translate-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-8 shadow-inner">
              <Heart className="w-8 h-8 fill-orange-500/20" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-outfit">어울리는 스타일 추천</h3>
            <p className="text-[#8b7355] text-lg leading-relaxed">강아지의 종과 모질을 분석해 가장 잘 어울리는 스타일을 제안합니다.</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-orange-50/50 border border-[#fff4e6] text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-3xl flex items-center justify-center text-yellow-600 mx-auto mb-8 shadow-inner">
              <ShoppingBag className="w-8 h-8 fill-yellow-600/20" />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-outfit">스마트 케어 쇼핑</h3>
            <p className="text-[#8b7355] text-lg leading-relaxed">새로운 스타일 유지를 위한 프리미엄 케어 제품을 추천해 드립니다.</p>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-white text-[#8b7355] text-center border-t border-[#fff4e6]">
        <div className="container mx-auto px-6">
          <p className="font-outfit text-xl mb-2 text-[#2d241a]">도담</p>
          <p className="opacity-60 text-sm">© 2026 도담. 모든 아이들이 행복했으면 좋겠어요.</p>
        </div>
      </footer>
    </main>
  );
}
