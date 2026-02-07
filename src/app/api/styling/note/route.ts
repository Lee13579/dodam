import { geminiModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt, mode, dogName } = await req.json();
        
        const analysisPrompt = `
            You are a luxury fashion editor for dogs named "Dodam".
            Context: ${prompt}
            Dog's Name: ${dogName || "아이"}
            Mode: ${mode === 'pictorial' ? 'Luxury Pictorial Concept' : 'Real Fitting/VTO Style'}

            Task: Write an elegant 'Editor's Choice' recommendation note (in Korean).
            - Focus on why this style/item is the "Best Choice" for this specific dog.
            - Mention specific fashion styles (e.g., Preppy, Urban Chic, Modern Hanbok).
            - End with a natural transition like "Complete this look with the items below."
            - Tone: Sophisticated, warm, and professional (Fashion Magazine Style).
            - Length: 3-4 sentences.
            - Output: Pure Korean text only. No quotes, no intro/outro.
        `;

        const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
        });

        const text = result.response.text();
        return NextResponse.json({ analysis: text.trim() });
    } catch (error: any) {
        return NextResponse.json({ error: "Note generation failed", details: error.message }, { status: 500 });
    }
}
