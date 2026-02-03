"use client";

import { Product } from "@/types";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ProductRecommendationProps {
    products: Product[];
}

export default function ProductRecommendation({ products }: ProductRecommendationProps) {
    return (
        <section className="py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">스타일 유지 아이템</h2>
                    <p className="text-slate-500">현재 스타일에 가장 잘 어울리는 추천 제품들입니다.</p>
                </div>
                <div className="hidden sm:block text-indigo-600 font-medium">
                    {products.length}개의 추천 상품
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group glass-card rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all overflow-hidden bg-white shadow-sm hover:shadow-md"
                    >
                        <div className="h-48 bg-slate-50 relative overflow-hidden">
                            <div className="absolute top-3 left-3 z-10 bg-white/90 shadow-sm text-[10px] font-bold px-2 py-1 rounded text-slate-500 uppercase">
                                {product.category === "Clothing" ? "의류/패션" : product.category === "Grooming" ? "미용/케어" : "액세서리"}
                            </div>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                {product.description}
                            </p>

                            <div className="flex flex-col gap-2 w-full">
                                <a
                                    href={product.url || `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(product.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 text-white hover:bg-pink-600 rounded-2xl text-sm font-bold transition-all w-full"
                                >
                                    최저가 보러가기 <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
