import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "fallback_key";

const genAI = new GoogleGenerativeAI(apiKey);

// Optimized models for production stability and performance based on 2026 Nano Banana standards
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
export const geminiImageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
