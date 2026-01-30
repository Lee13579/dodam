"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    selectedFile?: File | null;
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
            alert("Please upload an image file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
            onFileSelect(file);
        };
        reader.readAsDataURL(file);
    };

    const clearFile = () => {
        setPreview(null);
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
                        className={`relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${dragActive
                            ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleChange}
                            accept="image/*"
                        />
                        <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-500 mb-4 shadow-sm">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">
                            여기에 사진을 드래그하거나 클릭하세요
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            JPG, PNG 또는 WEBP (최대 5MB)
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-3xl overflow-hidden border border-slate-100 glass-card p-4 bg-white shadow-sm"
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-80 object-cover rounded-2xl"
                        />
                        <button
                            onClick={clearFile}
                            className="absolute top-6 right-6 p-2 bg-white/90 text-slate-900 rounded-full hover:bg-white shadow-md transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mt-4 flex items-center text-indigo-600 text-sm font-bold">
                            <ImageIcon className="w-4 h-4 mr-2" /> 사진이 성공적으로 업로드되었습니다
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
