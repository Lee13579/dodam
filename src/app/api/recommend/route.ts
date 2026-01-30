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
- name: Korean style name (Korean only; no English/roman characters)
- description: Korean recommendation reason (2 sentences, Korean only; no English/roman characters)
- koreanAnalysis: Korean styling analysis (2-3 sentences, diary style, Korean only; no English/roman characters)
- customPrompt: English image-to-image prompt template: "Using the provided image of this dog, modify it into a photorealistic [shot type] where the dog is [action/wearing]. Scene: [environment]. [Lighting], [mood]. Preserve dog's unique features."
- spatialAnalysis: {body: [y1,x1,y2,x2], face: [y1,x1,y2,x2]} (normalized 0-1000)

Style guidance: Pick 3 wildly different, dog-appropriate styles that best fit the photo (breed, coat, pose, mood). Keep all concepts clearly dog-centric (canine activities, dog-friendly outfits, pet-safe props). Avoid human-only costumes or unsafe items. Do not lock to any preset list or theme families; invent the best three for the specific photo.
Important: Concepts must be mutually distinct with no overlap in clothing, setting, or mood.
Important: For name/description/koreanAnalysis, output must be Korean only with no English letters, romanization, or mixed-language text. The only English allowed anywhere in the response is inside customPrompt.
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
