import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Add extra style guidance for better results
        // Gemini Image (Imagen) doesn't support aspectRatio/negativePrompt in config yet via generic API, so we put it in prompt.
        const negativePrompt = "bad anatomy, extra legs, extra paws, deformed, blurry, ugly, text, watermark, signature";
        const enhancedPrompt = `${prompt} 
        
        photorealistic, high-end grooming studio background, cinematic lighting.
        Aspect Ratio: 3:4 Portrait.
        
        Negative prompt: ${negativePrompt}`;

        // Generate 2 images in parallel
        const generationTasks = [1, 2].map(async () => {
            const result = await geminiImageModel.generateContent(enhancedPrompt);
            const response = await result.response;
            const candidate = response.candidates?.[0];

            if (!candidate?.content?.parts) {
                throw new Error("No image data in Gemini response");
            }

            const imagePart = candidate.content.parts.find(p => p.inlineData);
            if (!imagePart || !imagePart.inlineData) {
                throw new Error("Gemini response did not contain an image part");
            }

            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        });

        const urls = await Promise.all(generationTasks);

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
