import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { GenerationSchema } from "@/lib/validations";
import listLimiter from "@/lib/rate-limit";

const limiter = listLimiter({ uniqueTokenPerInterval: 500, interval: 60000 });

async function getBase64FromUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { isRateLimited } = limiter.check(5, ip); // Stricter limit for generation

    if (isRateLimited) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    try {
        const body = await req.json();
        const validation = GenerationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Input", details: validation.error.format() }, { status: 400 });
        }
        const { prompt, image, clothImage, accImage } = validation.data;

        const dogBase64 = image.includes(",") ? image.split(",")[1] : image;

        // Handle both Base64 and external URLs for items
        const clothBase64 = clothImage
            ? (clothImage.startsWith("http") ? await getBase64FromUrl(clothImage) : (clothImage.includes(",") ? clothImage.split(",")[1] : clothImage))
            : null;
        const accBase64 = accImage
            ? (accImage.startsWith("http") ? await getBase64FromUrl(accImage) : (accImage.includes(",") ? accImage.split(",")[1] : accImage))
            : null;

        const mimeType = "image/jpeg";

        const generationTasks = [1, 2].map(async (i) => {
            const isVTO = prompt.includes('[VTO]');
            const cleanPrompt = prompt.replace(/\[VTO\]|\[PICTORIAL\]/g, '').trim();

            let instruction = "";
            const parts: any[] = [];

            if (isVTO) {
                // PREMIUM VIRTUAL TRY-ON (Identity & Spatial Preservation Strategy)
                instruction = (clothBase64 || accBase64)
                    ? `MISSION: MASTER-LEVEL VIRTUAL TRY-ON WITH EXTREME REALISM.
                       
                       [INPUTS]
                       - Image 1: The Base Model (Dog).
                       - Image 2/3: The Garment/Accessory to be worn.

                       [CRITICAL RULES]
                       1. **IDENTITY PRESERVATION**: The dog's face, gaze, eyes, and fur texture must be 100% IDENTICAL to Image 1. Do not act as a generator; act as a "compositor".
                       2. **PHYSICS & FIT**: The clothing must wrap around the dog's body naturally with realistic folds, gravity, and shadows.
                       ${validation.data.keepBackground ? `3. **BACKGROUND PRESERVATION**: You MUST keep the original background of Image 1 exactly as it is. Only change the dog's attire.` : `3. **BACKGROUND**: Use a high-end studio setting or a location that perfectly matches the clothing's vibe.`}

                       [EXECUTION]
                       - Seamlessly blend the items onto the dog. 
                       - Maintain the exact camera angle and lighting of the original dog photo.
                       - The result must look like a raw photograph, not a 3D render.`
                    : `MISSION: LUXURY FASHION STYLING.
                       
                       [REQUEST]
                       Dress this specific dog in: ${cleanPrompt}.

                       [CRITICAL RULES]
                       1. **IDENTITY**: The dog in the output MUST be the same dog as the input.
                       ${validation.data.keepBackground ? `2. **BACKGROUND**: PRESERVE the original background completely.` : `2. **BACKGROUND**: Transport the dog to a luxury location matching the outfit.`}
                       3. **QUALITY**: Hyper-realistic textures. Cloth must interact with fur naturally.`;

                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType } });
                if (clothBase64) parts.push({ inlineData: { data: clothBase64, mimeType } });
                if (accBase64) parts.push({ inlineData: { data: accBase64, mimeType } });
            } else {
                // HIGH-END PICTORIAL (Concept & Mood Focus)
                instruction = `MISSION: HIGH-END FASHION PICTORIAL.
                   
                   [CONCEPT]
                   Transform this photo into a magazine-quality editorial shot based on: ${cleanPrompt}.

                   [DIRECTIVES]
                   - **IDENTITY**: Retain the dog's key features (breed, color, expression).
                   - **STYLING**: The outfit should be detailed, textured, and fashionable.
                   - **ATMOSPHERE**: Use cinematic lighting and color grading to match the concept.
                   - **COMPOSITION**: ${validation.data.keepBackground ? "Keep the original composition and background, but enhance the lighting and mood." : "Create a completely new, immersive background that tells a story."}
                   
                   Make it look like a cover of Vogue or Elle for dogs.`;

                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType } });
            }

            const result = await geminiImageModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: {
                    temperature: isVTO ? 0.4 : 0.7, // Lowered Pictorial temp for better coherence
                    topP: 0.95,
                }
            });

            const response = await result.response;
            const candidate = response.candidates?.[0];
            const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

            if (!imagePart?.inlineData) throw new Error(`Image ${i} generation failed`);
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        });

        const urls = await Promise.all(generationTasks);
        return NextResponse.json({ urls });
    } catch (error: any) {
        return NextResponse.json({ error: "Generation failed", details: error.message }, { status: 500 });
    }
}