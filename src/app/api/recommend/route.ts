import { geminiModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Convert base64 to parts for Gemini
        const base64Content = image.includes(",") ? image.split(",")[1] : image;

        const prompt = `
Pet fashion expert: analyze this dog photo and create 3 unique styling concepts.

Return JSON with "concepts" array (3 objects):
- id: "ai_1" to "ai_3"
- name: Korean style name
- description: Korean recommendation reason (2 sentences)
- koreanAnalysis: Korean styling analysis (2-3 sentences, diary style)
- customPrompt: English image-to-image prompt template: "Using the provided image of this dog, modify it into a photorealistic [shot type] where the dog is [action/wearing]. Scene: [environment]. [Lighting], [mood]. Preserve dog's unique features."
- spatialAnalysis: {body: [y1,x1,y2,x2], face: [y1,x1,y2,x2]} (normalized 0-1000)

Styles: Hanbok, luxury suits, high-end fashion, etc. Be creative and distinct.
Output ONLY valid JSON.
`;

        // Use JSON mode
        const result = await geminiModel.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                data: base64Content,
                                mimeType: image.match(/data:([^;]+);/)?.[1] || "image/jpeg",
                            },
                        },
                        { text: prompt },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const response = await result.response;
        const text = response.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Gemini Recommendation JSON Parse Error:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Gemini Recommendation Error:", error);
        return NextResponse.json({
            error: "Recommendation failed",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
