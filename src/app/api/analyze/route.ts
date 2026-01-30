import { geminiModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { image, style, isCustom } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Convert base64 to parts for Gemini
        // Handle cases where the data: prefix might be missing
        const base64Content = image.includes(",") ? image.split(",")[1] : image;

        // Define style instructions based on isCustom flag
        let styleInstruction = "";

        if (isCustom) {
            styleInstruction = `
            CUSTOM STYLE REQUEST: The user wants to transform the dog into this specific concept: "${style}".
            Creatively interpret this request to make an amazing, high-quality image.
            `;
        } else {
            styleInstruction = `
             STYLES GUIDE:
             - "Teddy Bear": Focus on a rounded face cut and soft fur texture. Cute cozy vest.
             - "Formal Tuxedo": A tiny, perfectly fitted black tuxedo with a crisp white shirt and red bow tie.
             - "Streetwear": A trendy neon oversized hoodie and miniature aviator sunglasses.
             - "Hawaiian": A bright, colorful Hawaiian floral shirt and a small straw hat.
             
             Apply the "${style}" style from the guide above.
             `;
        }

        const prompt = `
      Analyze this dog photo. Identify the breed, color, and *unique* facial features. 
      Focus on specific details that make this dog look like itself: messy fur, asymmetric markings, specific eye shape, nose texture, and emotional expression.

      Then, describe how this dog would look if it were wearing an outfit based on the style instruction below.
      
      ${styleInstruction}

      Provide a concise prompt (under 600 characters) for an AI image generator to create a high-quality, photorealistic image of THIS EXACT DOG.
      
      CRITICAL INSTRUCTION - BALANCE IS KEY:
      - **IDENTITY (Top Priority)**: The dog's face, messy/natural fur texture, and unique imperfections MUST match the original photo exactly. Do not "fix" or genericize the dog.
      - **ATMOSPHERE (Cool Factor)**: While keeping the dog authentic, upgrade the *lighting, background, and composition* to be cinematic and high-end. 
      - **GOAL**: "The exact same dog (messy hair and all), but appearing in a luxury magazine shoot."
      
      The dog should be posing naturally in a high-end, bright, minimalist studio.
      KEYWORD: Best shot, Award winning photography, 8k resolution, Soft studio lighting, Golden Hour, Emotional connection, Shot on Sony A7R V, 85mm f/1.2 GM, Bokeh, Highly detailed fur texture.
      
      CRITICAL: The "analysis" field in the return JSON MUST BE IN KOREAN.
      
      Return the response in JSON format: { "analysis": "아이의 새로운 룩에 대한 매력적인 설명 (한국어)...", "generationPrompt": "Image generation prompt in English..." }
    `;

        // Use JSON mode for more reliable parsing
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
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT" as any,
                    threshold: "BLOCK_NONE" as any,
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH" as any,
                    threshold: "BLOCK_NONE" as any,
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
                    threshold: "BLOCK_NONE" as any,
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
                    threshold: "BLOCK_NONE" as any,
                },
            ],
        });

        const response = await result.response;
        const text = response.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Gemini JSON Parse Error:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);
        // Provide more detail in the error message for debugging
        return NextResponse.json({
            error: "Analysis failed",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
