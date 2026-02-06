"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dog } from "lucide-react";

interface HeaderProps {
    transparentMode?: boolean;
}

export default function Header({ transparentMode = false }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Text color logic:
    // If scrolled -> Dark text (standard)
    // If NOT scrolled + transparentMode -> White text
    // If NOT scrolled + normal -> Dark text
    const isDarkText = scrolled || !transparentMode;
    const textColorClass = isDarkText ? "text-[#5d4d3d]" : "text-white/90";
    const logoColorClass = isDarkText ? "text-[#2d241a]" : "text-white";

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !transparentMode
                    ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
                    : "bg-transparent py-5"
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group relative z-50">
                        <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
                            <Dog className="w-6 h-6" />
                        </div>
                        <span className={`text-2xl font-bold font-outfit tracking-tight ${logoColorClass}`}>도담</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/" className={`${textColorClass} hover:text-pink-500 font-bold transition-all text-lg font-outfit`}>홈</Link>
                        <Link href="/styling" className={`${textColorClass} hover:text-pink-500 font-bold transition-all text-lg font-outfit`}>스타일링</Link>
                        <Link href="/travel" className={`${textColorClass} hover:text-pink-500 font-bold transition-all text-lg font-outfit`}>여행</Link>
                        <Link href="/#about" className={`${textColorClass} hover:text-pink-500 font-bold transition-all text-lg font-outfit`}>브랜드 스토리</Link>
                    </nav>

                    <div className="hidden md:block w-8" />

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden relative z-50 p-2 text-[#2d241a]"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`} />
                        <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : 'mb-1.5'}`} />
                        <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-white transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-3xl font-bold text-[#2d241a] hover:text-pink-500 transition-colors font-outfit"
                    >
                        홈
                    </Link>
                    <Link
                        href="/styling"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-3xl font-bold text-[#2d241a] hover:text-pink-500 transition-colors font-outfit"
                    >
                        스타일링
                    </Link>
                    <Link
                        href="/travel"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-3xl font-bold text-[#2d241a] hover:text-pink-500 transition-colors font-outfit"
                    >
                        여행
                    </Link>
                    <Link
                        href="/#about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-3xl font-bold text-[#2d241a] hover:text-pink-500 transition-colors font-outfit"
                    >
                        브랜드 스토리
                    </Link>
                </div>
            </div>
        </>
    );
}
