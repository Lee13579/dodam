import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "fallback_key";

const genAI = new GoogleGenerativeAI(apiKey);

// Optimized models for production stability and performance
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const geminiImageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
