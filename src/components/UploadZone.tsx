"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface UploadZoneProps {
    onFileSelect: (file: File | null) => void;
    selectedFile?: File | null;
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync preview with selectedFile prop
    useEffect(() => {
        if (!selectedFile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일을 선택해주세요.");
            return;
        }
        onFileSelect(file);
    };

    const clearFile = () => {
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative h-80 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center transition-all duration-500 ${dragActive
                            ? "border-pink-300 bg-pink-50/50 scale-[1.02]"
                            : "border-[#ffe8cc] bg-[#fffbf5]/80 backdrop-blur-sm hover:bg-[#fff9f0] hover:border-pink-200"
                            }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleChange}
                            accept="image/*"
                        />
                        <div className="p-6 rounded-[30px] bg-white text-pink-400 mb-6 shadow-xl shadow-orange-100/50">
                            <Upload className="w-10 h-10" />
                        </div>
                        <p className="text-xl font-bold text-[#2d241a] font-outfit">
                            여기에 사진을 드래그하거나 클릭하세요
                        </p>
                        <p className="text-sm text-[#8b7355] mt-3 font-medium">
                            JPG, PNG 또는 WEBP (최대 5MB)
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-[40px] overflow-hidden border border-[#fff4e6] p-6 bg-white/60 backdrop-blur-xl shadow-2xl shadow-orange-100/30"
                    >
                        <div className="relative rounded-[32px] overflow-hidden group h-96">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        </div>
                        <button
                            onClick={clearFile}
                            className="absolute top-10 right-10 p-3 bg-white/90 text-[#2d241a] rounded-full hover:bg-white shadow-2xl transition-all scale-100 active:scale-90 hover:text-pink-500 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="mt-6 flex items-center justify-center text-pink-500 text-base font-bold font-outfit">
                            <ImageIcon className="w-5 h-5 mr-3" /> 아이의 사진이 완벽하게 등록되었습니다
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
