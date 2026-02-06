import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "fallback_key";

const genAI = new GoogleGenerativeAI(apiKey);

// Balance: Smart reasoning with 3.0 Flash, Cost-effective imaging with 2.5 Flash
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
export const geminiImageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
