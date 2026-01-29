import { geminiModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { image, style } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Convert base64 to parts for Gemini
        const base64Content = image.split(",")[1];

        const prompt = `
      Analyze this dog photo. Identify the breed, color, and current facial features.
      Then, describe how this dog would look if it were wearing an outfit in the "${style}" style.
      
      STYLES GUIDE:
      - "Teddy Bear": Focus on a rounded face cut and soft fur texture.
      - "Formal Tuxedo": A tiny, perfectly fitted black tuxedo with a crisp white shirt and red bow tie.
      - "Streetwear": A trendy oversized hoodie (e.g., grey or yellow) and miniature aviator sunglasses.
      - "Summer Breeze": A bright, colorful Hawaiian floral shirt and a small straw hat.
      - "Cozy Winter": An ivory cable-knit sweater and a chunky red or green wool scarf.
      - "Rainy Day": A vibrant yellow slicker raincoat and matching yellow rain boots on its paws.

      Provide a concise prompt (under 600 characters) for DALL-E 3 to create a high-quality, photorealistic image of THIS EXACT DOG (same breed, same color, same face) but wearing the apparel described for "${style}" style. 
      The dog should be posing naturally in a high-end, bright, minimalist studio.
      
      CRITICAL: The "analysis" field in the return JSON MUST BE IN KOREAN.
      
      Return the response in JSON format: { "analysis": "아이의 새로운 룩에 대한 매력적인 설명 (한국어)...", "generationPrompt": "DALL-E prompt in English..." }
    `;

        const result = await geminiModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handling potential markdown markers)
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
