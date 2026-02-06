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

        // Generate 2 images in parallel using native Image-to-Image editing (Nano Banana Standard)
        const generationTasks = [1, 2].map(async (i) => {
            try {
                // If the prompt contains environment keywords (Pictorial mode), emphasize full scene transformation.
                // If it's pure outfit description (VTO mode), emphasize background preservation.
                const isVTO = prompt.toLowerCase().includes('virtual try-on') || prompt.toLowerCase().includes('fitting');
                
                let instruction = "";
                if (isVTO) {
                    instruction = `Using the provided image, perform a precise virtual try-on. KEEP THE ORIGINAL BACKGROUND and lighting. Modify ONLY the dog's clothing to: ${prompt.replace(/\n/g, ' ')}.`;
                } else {
                    instruction = `TRANSFORM THIS IMAGE into a high-end commercial pictorial. 
                    1. REPLACE THE BACKGROUND ENTIRELY with the scene described here: ${prompt.replace(/\n/g, ' ')}. 
                    2. Adjust the lighting and atmosphere to match the new scene. 
                    3. Maintain the EXACT identity, face, and fur color of the dog from the original photo. 
                    4. The dog must be wearing the specified fashion items naturally.`;
                }

                const result = await geminiImageModel.generateContent({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: instruction },
                                {
                                    inlineData: {
                                        data: base64Content,
                                        mimeType: mimeType
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        topP: 0.95,
                    }
                });

                const response = await result.response;
                const candidate = response.candidates?.[0];

                if (!candidate?.content?.parts) {
                    throw new Error(`Image ${i}: No response parts found.`);
                }

                const imagePart = candidate.content.parts.find(p => p.inlineData);
                if (!imagePart || !imagePart.inlineData) {
                    throw new Error(`Image ${i}: Response did not contain an image.`);
                }

                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            } catch (e: any) {
                console.error(`Generation Task ${i} failed:`, e);
                throw e;
            }
        });

        const urls = await Promise.all(generationTasks);

        return NextResponse.json({ urls });
    } catch (error: any) {
        console.error("Gemini Image Generation Error Details:", error);
        const status = error.status || 500;
        const message = error.message || "이미지 생성 중 알 수 없는 오류가 발생했습니다.";
        return NextResponse.json({ 
            error: "Generation failed", 
            details: message,
            model: "gemini-2.5-flash-image"
        }, { status });
    }
}
