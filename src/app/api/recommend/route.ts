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
      Analyze this dog photo. Identify the breed, color, and unique "vibe" (e.g., goofy, noble, shy, tough).
      
      Based on this analysis, **INVENT 5 DIFFERENT creative styling concepts** that would look amazing on this specific dog.
      Each concept should have a DISTINCT theme. Use variety: Elegant, Funny, Tough, Cute, Trendy, Fantasy, etc.
      
      Examples of diverse concepts:
      - "강남 힙합왕" (Hip-Hop King) - for a tough vibe
      - "중세 기사단장" (Medieval Knight) - for a noble look
      - "핑크 발레리나" (Pink Ballerina) - for a cute, elegant dog
      - "우주 비행사" (Astronaut) - for a futuristic theme
      - "숲속의 요정" (Forest Fairy) - for a mystical vibe

      CRITICAL: Return the response in JSON format with an array of 5 concepts.
      {
        "concepts": [
          {
            "id": "ai_1",
            "name": "Concept Name (Korean, max 10 chars)",
            "description": "Why this fits (Korean, witty, under 60 chars)",
            "customPrompt": "Detailed description for image generator (English)"
          },
          ... (4 more concepts)
        ]
      }
    `;

        // Use JSON mode
        const result = await geminiModel.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: base64Content,
                                mimeType: image.match(/data:([^;]+);/)?.[1] || "image/jpeg",
                            },
                        },
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
