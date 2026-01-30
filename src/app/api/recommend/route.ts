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
      CRITICAL MISSION: DEEP SPATIAL ANALYSIS AND CREATIVE STYLING.
      
      You are a world-class pet fashion photographer and AI prompt engineer.
      1. SPATIAL ANALYSIS: Detect the dog's body and face. Provide bounding boxes [ymin, xmin, ymax, xmax] normalized to 0-1000.
      2. RECOMMENDATION: Invent 3 UNIQUE, highly realistic premium styling concepts tailored to this specific dog's appearance and "vibe".

      OUTPUT REQUIREMENT: Return a SINGLE JSON object with a key named "concepts" which is an array of 3 objects.

      JSON STRUCTURE per Concept in the "concepts" array:
      - "id": String (ai_1 to ai_3)
      - "name": 감각적인 스타일 명칭 (한글)
      - "description": 왜 이 스타일이 추천되는지 (한글, 따뜻한 문체)
      - "koreanAnalysis": 결과 화면에 보여줄 2-3문장의 정교한 스타일링 분석 (한글, "이 친구의 ~한 특징과 ~한 배경이 어우러져..." 식의 일기/비평체)
      - "customPrompt": For a native image-to-image editing model. 
         Template: "Using the provided image of this dog, please modify it into a photorealistic [shot type] where the dog is [action] and wearing [DETAILED OUTFIT]. Set the scene in [ENVIRONMENT]. [LIGHTING], [MOOD]. The dog's face and unique features must remain a 1:1 match."
      - "spatialAnalysis": { "body": [y1, x1, y2, x2], "face": [y1, x1, y2, x2] }

      GUIDELINES:
      - Be creative: Hanbok, Luxury suits, High-end knitwear, etc.
      - Concepts must be distinct.
      - Use ONLY JSON.
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
