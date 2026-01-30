"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dog } from "lucide-react";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
                        <Dog className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold font-outfit text-[#2d241a] tracking-tight">도담</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#gallery" className="text-[#5d4d3d] hover:text-pink-500 font-medium transition-colors">갤러리</Link>
                    <Link href="/#styling" className="text-[#5d4d3d] hover:text-pink-500 font-medium transition-colors">스타일링</Link>
                    <a href="#" className="text-[#5d4d3d] hover:text-pink-500 font-medium transition-colors">추천상품</a>
                </nav>

                <button
                    onClick={() => document.getElementById('styling')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-2.5 bg-pink-500 hover:bg-pink-400 text-white rounded-full font-bold transition-all shadow-md shadow-pink-100 hover:shadow-lg font-outfit"
                >
                    시작하기
                </button>
            </div>
        </header>
    );
}
