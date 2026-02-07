import { geminiModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { StylingNoteSchema } from "@/lib/validations";
import listLimiter from "@/lib/rate-limit";

const limiter = listLimiter({ uniqueTokenPerInterval: 500, interval: 60000 });

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { isRateLimited } = limiter.check(20, ip);

    if (isRateLimited) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    try {
        const body = await req.json();
        const validation = StylingNoteSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Input", details: validation.error.format() }, { status: 400 });
        }
        const { prompt, mode, dogName } = validation.data;

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
