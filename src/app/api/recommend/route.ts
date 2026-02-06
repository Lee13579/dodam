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
[SYSTEM: RESPONSE MUST BE ONLY A VALID JSON OBJECT. NO CHAT. NO MARKDOWN.]
반려견 스타일 추천 전문가로서 다음 사진을 분석해 '실제로 구매 가능한' 스타일 3가지를 골라줘.

JSON 구조:
{
  "concepts": [
    {
      "id": "ai_1",
      "name": "쉬운 한글 이름",
      "description": "추천 이유 (한글, 2줄)",
      "koreanAnalysis": "전문가 평 (한글, 2줄)",
      "customPrompt": "Detailed English Image-to-Image prompt. IMPORTANT: Set the background to a beautiful KOREAN location matching the style (e.g., Hanok Village, Jeju Beach, Seongsu Cafe).",
      "vtoOutfitEnglish": "English outfit description for fitting",
      "spatialAnalysis": {"body": [y1,x1,y2,x2], "face": [y1,x1,y2,x2]},
      "searchKeywords": ["키워드1", "키워드2"]
    }
  ]
}

규칙:
1. '모색' 대신 '털 색깔', '빈티지' 대신 '옛날 느낌' 등 쉬운 한글만 써.
2. 번역투 절대 금지. 담백한 사장님 말투로 써.
3. 모든 한글은 2~3줄 이내로 짧게 써.
4. JSON 형식 외에 어떤 말도 덧붙이지 마.
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
                maxOutputTokens: 2000, // Reduced to keep it concise and avoid truncation
                temperature: 0.2, // Lower temperature for stricter JSON adherence
            },
        });

        const response = await result.response;
        let text = response.text();
        console.log("Raw Gemini Response (first 100 chars):", text.substring(0, 100));
        
        // Robust JSON extraction
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        try {
            const data = JSON.parse(text.trim());
            if (!data.concepts || !Array.isArray(data.concepts)) {
                console.error("Invalid JSON structure:", text);
                throw new Error("데이터 구조 오류");
            }
            return NextResponse.json(data);
        } catch (parseError: any) {
            console.error("FULL FAILED TEXT:", text);
            return NextResponse.json({ 
                error: "데이터 해석 실패", 
                details: parseError.message
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Gemini Recommendation Error:", error);
        return NextResponse.json({
            error: "Recommendation failed",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
