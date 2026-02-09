import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { GenerationSchema } from "@/lib/validations";
import listLimiter from "@/lib/rate-limit";

const limiter = listLimiter({ uniqueTokenPerInterval: 500, interval: 60000 });

async function getBase64FromUrl(url: string): Promise<{ base64: string; mimeType: string }> {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type");
        
        // Detect MIME type from buffer if header is missing or generic
        let mimeType = contentType || "image/jpeg";
        if (!contentType || contentType === 'application/octet-stream') {
             // Simple magic number check could be added here, but defaulting to jpeg/png based on url extension is a safe fallback
             if (url.endsWith('.png')) mimeType = "image/png";
             else if (url.endsWith('.webp')) mimeType = "image/webp";
        }

        return {
            base64: Buffer.from(buffer).toString("base64"),
            mimeType
        };
    } catch (e) {
        console.error("Image fetch failed:", url, e);
        // Return a 1x1 pixel transparent gif as fallback to prevent crash, or rethrow
        return { base64: "", mimeType: "image/jpeg" }; 
    }
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

        // Handle both Base64 and external URLs for items with proper MIME detection
        let clothData = null;
        if (clothImage) {
            if (clothImage.startsWith("http")) {
                clothData = await getBase64FromUrl(clothImage);
            } else if (clothImage.includes(",")) {
                const [header, data] = clothImage.split(",");
                clothData = { base64: data, mimeType: header.match(/:(.*?);/)?.[1] || "image/jpeg" };
            } else {
                clothData = { base64: clothImage, mimeType: "image/jpeg" };
            }
        }

        let accData = null;
        if (accImage) {
             if (accImage.startsWith("http")) {
                accData = await getBase64FromUrl(accImage);
            } else if (accImage.includes(",")) {
                const [header, data] = accImage.split(",");
                accData = { base64: data, mimeType: header.match(/:(.*?);/)?.[1] || "image/jpeg" };
            } else {
                accData = { base64: accImage, mimeType: "image/jpeg" };
            }
        }

        // Validate fetched data
        if (clothImage && (!clothData || !clothData.base64)) console.warn("Cloth image load failed, proceeding without it.");
        if (accImage && (!accData || !accData.base64)) console.warn("Acc image load failed, proceeding without it.");

        const generationTasks = [1, 2].map(async (i) => {
            const isVTO = prompt.includes('[VTO]');
            const cleanPrompt = prompt.replace(/\[VTO\]|\[PICTORIAL\]/g, '').trim();

            let instruction = "";
            const parts: any[] = [];

            if (isVTO) {
                // PREMIUM VIRTUAL TRY-ON (Identity & Spatial Preservation Strategy)
                const hasItems = (clothData?.base64 || accData?.base64);
                
                if (hasItems) {
                    instruction = `MISSION: MASTER-LEVEL VIRTUAL TRY-ON (SIMULATION).
                       
                       [INPUTS]
                       - Image 1: The Base Model (Dog).
                       - Image 2/3: The Garment/Accessory to be visualized.

                       [USER NOTES]
                       The user explicitly requested: "${cleanPrompt}". 
                       -> Apply this request delicately (e.g., "tilt the hat", "roll up sleeves") while ensuring the item itself remains recognizable.

                       [CRITICAL RULES]
                       1. **IDENTITY PRESERVATION**: The dog's face, gaze, eyes, and fur texture must be 100% IDENTICAL to Image 1.
                       2. **PHYSICS & FIT**: The clothing must wrap around the dog's body naturally.
                       ${validation.data.keepBackground ? `3. **BACKGROUND PRESERVATION**: You MUST keep the original background of Image 1 exactly as it is.` : `3. **BACKGROUND**: Use a high-end studio setting that matches the clothing's vibe.`}
                       4. **INTEGRITY**: Do not distort the branding or key design elements of the clothing. This is a product simulation.

                       [EXECUTION]
                       - Seamlessly blend the items onto the dog. 
                       - Maintain the exact camera angle and lighting of the original dog photo.
                       - ${i === 1 ? "Focus on a precise, realistic product fit." : "Focus on a natural, comfortable look with the user's styling notes applied."}`;
                } else {
                     instruction = `MISSION: LUXURY FASHION STYLING.
                       
                       [REQUEST]
                       Dress this specific dog in: ${cleanPrompt}.

                       [CRITICAL RULES]
                       1. **IDENTITY**: The dog in the output MUST be the same dog as the input.
                       ${validation.data.keepBackground ? `2. **BACKGROUND**: PRESERVE the original background completely.` : `2. **BACKGROUND**: Transport the dog to a luxury location matching the outfit.`}
                       3. **QUALITY**: Hyper-realistic textures. Cloth must interact with fur naturally.`;
                }

                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType: "image/jpeg" } }); // Dog is usually resized jpeg
                if (clothData?.base64) parts.push({ inlineData: { data: clothData.base64, mimeType: clothData.mimeType } });
                if (accData?.base64) parts.push({ inlineData: { data: accData.base64, mimeType: accData.mimeType } });
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
                parts.push({ inlineData: { data: dogBase64, mimeType: "image/jpeg" } });
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