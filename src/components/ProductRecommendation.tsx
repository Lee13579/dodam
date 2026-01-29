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
                                {product.category === "Grooming" ? "미용/케어" : "액세서리"}
                            </div>
                            {/* Fallback pattern instead of missing image */}
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-50 to-pink-50 flex items-center justify-center">
                                <ShoppingCart className="w-12 h-12 text-slate-200" />
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                {product.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xl font-bold text-slate-900 font-mono">₩{product.price.toLocaleString()}</span>
                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-all"
                                >
                                    구매하기 <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
