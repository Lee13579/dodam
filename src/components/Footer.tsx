"use client";

import React from 'react';

export default function Footer() {
    return (
        <footer className="py-20 bg-white text-[#8b7355] text-center border-t border-[#fff4e6]">
            <div className="container mx-auto px-6">
                <p className="font-outfit text-2xl font-bold mb-4 text-[#2d241a]">도담</p>
                <div className="flex justify-center gap-8 mb-8 text-sm font-medium">
                    <a href="#" className="hover:text-pink-500 transition-colors">이용약관</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">개인정보처리방침</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">고객센터</a>
                </div>
                <p className="opacity-50 text-sm">© 2026 도담. 모든 아이들이 도담도담 건강하게 자랄 수 있는 세상을 꿈꿉니다.</p>
            </div>
        </footer>
    );
}
