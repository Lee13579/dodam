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
- name: Korean style name (Korean only)
- description: Korean recommendation reason (2 sentences, Korean only)
- koreanAnalysis: Korean styling analysis (2-3 sentences, diary style, Korean only)
- customPrompt: English image-to-image prompt template
- spatialAnalysis: {body: [y1,x1,y2,x2], face: [y1,x1,y2,x2]}
- searchKeywords: An array of 2-3 Korean keywords for shopping search (e.g., ["강아지 한복", "강아지 조바위"])

Style guidance: Pick 3 wildly different, dog-appropriate styles that best fit the photo. Ensure items are real fashion items.
Important: For name/description/koreanAnalysis/searchKeywords, output must be Korean only.
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
