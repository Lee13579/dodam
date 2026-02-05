"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const GALLERY_ITEMS = [
    { src: "/gallery_1.png", title: "함께라서 더 행복한 시간" },
    { src: "/gallery_2.png", title: "전문가의 손길, 가위컷의 마법" },
    { src: "/images/styles/streetwear.png", title: "힙한 감성, 어반 스트릿" },
    { src: "/bichon_stylist.png", title: "완벽한 화보, 포인트 스타일링" },
    { src: "/images/styles/formal_tuxedo.png", title: "특별한 날의 신사, 턱시도" },
    { src: "/images/styles/teddy_bear.png", title: "뭉글뭉글 귀여운 테디베어 룩" },
    { src: "/images/styles/hawaiian.png", title: "시원한 여름날의 알로하" },
    { src: "/hero_poodle_clean.png", title: "로즈 벨벳의 고급스러운 우아함" },
    { src: "/gallery_velvet_cozy.png", title: "따스한 니트웨어와 벨벳의 포근함" },
    { src: "/gallery_walking_free.png", title: "햇살 가득한 자유로운 산책" },
];

export default function GallerySlider() {
    // Triple the items for a seamless long loop
    const duplicatedItems = [...GALLERY_ITEMS, ...GALLERY_ITEMS, ...GALLERY_ITEMS];

    return (
        <section id="gallery" className="py-16 bg-white overflow-hidden">
            <div className="container mx-auto px-6 mb-16">
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 font-outfit text-[#2d241a]">도담 갤러리</h2>
                    <p className="text-[#8b7355] text-xl">도담을 통해 새롭게 태어난 <br className="sm:hidden" /> 우리 아이들의 빛나는 순간들을 감상해 보세요.</p>
                </div>
            </div>

            <div className="relative flex overflow-hidden group">
                <motion.div
                    animate={{
                        x: ["0%", "-33.333%"],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-6 pr-6"
                >
                    {duplicatedItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[45vw] md:w-[350px] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative group/card shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <Image
                                src={item.src}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                <div className="transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                                    <p className="text-white/70 text-[10px] mb-1 font-bold tracking-widest uppercase">Styling Look</p>
                                    <p className="text-white font-bold text-lg md:text-xl line-clamp-1">{item.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Gradient overlays for smoother fade at edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
