import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt, image } = await req.json();

        if (!prompt || !image) {
            return NextResponse.json({ error: "Prompt and image are required" }, { status: 400 });
        }

        const base64Content = image.includes(",") ? image.split(",")[1] : image;
        const mimeType = image.match(/data:([^;]+);/)?.[1] || "image/jpeg";

        // Generate 2 images in parallel using native Image-to-Image editing
        const generationTasks = [1, 2].map(async () => {
            const result = await geminiImageModel.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        data: base64Content,
                        mimeType: mimeType
                    }
                }
            ]);

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
    } catch (error: any) {
        console.error("Gemini Image Generation Error:", error);
        return NextResponse.json({ error: "Generation failed", details: error.message }, { status: 500 });
    }
}
