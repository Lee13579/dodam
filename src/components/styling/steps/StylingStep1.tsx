"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import UploadZone from "@/components/UploadZone";

interface StylingStep1Props {
    file: File | null;
    setFile: (file: File | null) => void;
    dogName: string;
    setDogName: (name: string) => void;
    mode: 'pictorial' | 'vto' | null;
    setMode: (mode: 'pictorial' | 'vto' | null) => void;
    loading: boolean;
    loadingStep: string;
    onSubmit: () => void;
}

const modes = [
    { id: 'pictorial', label: '감성 화보', desc: '배경과 조명까지 완벽하게', icon: '✨' },
    { id: 'vto', label: '리얼 피팅', desc: '실제 옷을 입은 듯한 현실적 피팅', icon: '🤖' }
] as const;

export default function StylingStep1({
    file,
    setFile,
    dogName,
    setDogName,
    mode,
    setMode,
    loading,
    loadingStep,
    onSubmit
}: StylingStep1Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
        >
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-[#2d241a] font-outfit tracking-tight">아이의 매력을 보여주세요</h2>
                <p className="text-[#8b7355] text-lg max-w-xl mx-auto break-keep">정면 사진을 올려주시면 도담이 가장 잘 어울리는 스타일을 찾아드릴게요.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-[#fff4e6] shadow-2xl shadow-orange-100/20">
                <UploadZone onFileSelect={setFile} selectedFile={file} />

                {file && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="max-w-md mx-auto mt-12 space-y-10"
                    >
                        <div className="text-center">
                            <label className="block text-base font-bold text-[#5d4d3d] mb-4">아이의 소중한 이름을 알려주세요</label>
                            <input
                                type="text"
                                value={dogName}
                                onChange={(e) => setDogName(e.target.value)}
                                placeholder="예: 두부, 별이"
                                className="w-full px-8 py-5 rounded-3xl border-2 border-[#fff4e6] outline-none text-center text-xl font-bold shadow-inner focus:border-pink-300 transition-all bg-white"
                            />
                        </div>

                        <div className="space-y-6">
                            <label className="block text-base font-bold text-[#5d4d3d] text-center">어떤 스타일링을 원하시나요?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modes.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-start gap-4 ${mode === m.id
                                                ? "border-pink-500 bg-pink-50/50 shadow-lg"
                                                : "border-[#fff4e6] bg-white hover:border-pink-200"
                                            }`}
                                    >
                                        <div className={`text-2xl p-2 rounded-xl ${mode === m.id ? "bg-white" : ""}`}>
                                            {m.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#2d241a] text-lg">{m.label}</h4>
                                            <p className="text-xs text-[#8b7355] mt-1 line-clamp-2 break-keep">{m.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onSubmit}
                    disabled={!file || !mode || loading}
                    className="group relative px-16 py-6 bg-pink-500 hover:bg-pink-400 text-white rounded-[32px] font-bold text-xl disabled:opacity-50 shadow-2xl shadow-pink-200 transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-6 h-6" />
                            <span>{loadingStep}</span>
                        </>
                    ) : (
                        "다음 단계로 가기"
                    )}
                </button>
            </div>
        </motion.div>
    );
}
