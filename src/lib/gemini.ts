import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "fallback_key";

const genAI = new GoogleGenerativeAI(apiKey);

// Verified available models
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
export const geminiImageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
