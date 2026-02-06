import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

async function getBase64FromUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, image, clothImage, accImage } = await req.json();
        if (!prompt || !image) return NextResponse.json({ error: "Missing data" }, { status: 400 });

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
                // REAL FITTING MODE
                instruction = (clothBase64 || accBase64)
                    ? `PERFORM A PRECISE VIRTUAL TRY-ON using the provided items.
                       [STRICT] KEEP the original dog (first image) face, body shape, and background identical.
                       [TASK] Dress the dog naturally in the ${clothBase64 ? 'clothing item' : ''}${clothBase64 && accBase64 ? ' and ' : ''}${accBase64 ? 'accessory' : ''} shown in the subsequent images. 
                       [DETAIL] Match the colors, patterns, and textures exactly. Ensure realistic layering and shadows.`
                    : `PERFORM A PRECISE VIRTUAL TRY-ON.
                       [STRICT] KEEP the original background and dog identity.
                       [TASK] Naturally dress the dog in: ${cleanPrompt}.
                       [DETAIL] Realistic fabric folds and shadows.`;
                
                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType } });
                if (clothBase64) parts.push({ inlineData: { data: clothBase64, mimeType } });
                if (accBase64) parts.push({ inlineData: { data: accBase64, mimeType } });
            } else {
                // PICTORIAL MODE
                const variation = i === 1 
                    ? "Front-facing high-end commercial studio shot."
                    : "Artistic, dynamic angle with dramatic lighting.";
                
                instruction = `TRANSFORM INTO A LUXURY FASHION PICTORIAL. ${variation}
                   [TASK] Entirely replace the background to match: ${cleanPrompt}.
                   [PRESERVE] Maintain the dog's core identity and facial features.`;
                
                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType } });
            }

            const result = await geminiImageModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: {
                    temperature: isVTO ? 0.4 : 0.9,
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