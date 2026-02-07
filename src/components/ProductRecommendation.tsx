"use client";

import React from 'react';
import { Product } from "@/types";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles, Loader2, Plus } from "lucide-react";
import Image from "next/image";

interface ProductRecommendationProps {
    products: Product[];
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export default function ProductRecommendation({ products, onLoadMore, loadingMore }: ProductRecommendationProps) {
    const [activeTab, setActiveTab] = React.useState<'ALL' | 'CLOTH' | 'ACC'>('ALL');

    if (products.length === 0) return null;

    // Filter products based on active tab
    // Note: Since 'category' in Product type is loose, we map it roughly.
    // Ideally, the API should return precise categories.
    const filteredProducts = products.filter(p => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'CLOTH') return p.category === 'Clothing' || p.category === 'Curation'; // 'Curation' often includes clothes
        if (activeTab === 'ACC') return p.category === 'Accessory';
        return true;
    });

    return (
        <section className="py-12 space-y-12">
            <div className="text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-black text-[#2D241A] font-outfit tracking-tight">
                    스타일을 완성할 <span className="text-pink-500">추천 아이템</span>
                </h2>

                {/* Category Tabs */}
                <div className="flex justify-center gap-2">
                    {[
                        { id: 'ALL', label: '전체 보기' },
                        { id: 'CLOTH', label: '의류' },
                        { id: 'ACC', label: '소품/액세서리' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${activeTab === tab.id
                                    ? "bg-pink-500 text-white border-pink-500 shadow-lg scale-105"
                                    : "bg-white text-stone-500 border-stone-200 hover:border-pink-200 hover:text-pink-400"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {filteredProducts.map((product, idx) => {
                    return (
                        <motion.div
                            key={`${product.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: (idx % 4) * 0.05 }}
                            className="group flex flex-col"
                        >
                            <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-[3/4] rounded-[40px] overflow-hidden bg-stone-100 mb-6 block border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-500"
                            >
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-md text-stone-900 px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-2xl">
                                        상세보기 <ExternalLink size={16} />
                                    </div>
                                </div>
                            </a>

                            <div className="px-4 space-y-2 text-center">
                                <h3 className="text-[#2D241A] font-bold text-base md:text-lg line-clamp-2 leading-snug group-hover:text-pink-500 transition-colors min-h-[2.8em] flex items-center justify-center">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-pink-500 font-black text-xl font-outfit">
                                        {product.price.toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="pt-12 text-center border-t border-stone-50">
                {onLoadMore && (
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="px-10 py-4 bg-white border-2 border-stone-200 hover:border-pink-300 hover:text-pink-500 rounded-full font-bold text-stone-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> 아이템 찾는 중...
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> 추천 아이템 더보기
                            </>
                        )}
                    </button>
                )}

                <p className="text-stone-400 text-[10px] mt-8 flex items-center justify-center gap-2 opacity-60">
                    <Sparkles size={10} />
                    아이의 스타일과 가장 잘 어울리는 아이템을 실시간으로 큐레이션합니다.
                </p>
            </div>
        </section>
    );
}
