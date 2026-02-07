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
                // PREMIUM VIRTUAL TRY-ON (Aligned with Pictorial Quality)
                instruction = (clothBase64 || accBase64)
                    ? `Perform a MASTER-LEVEL Virtual Try-On. 
                       Dress the exact dog from the first image in the items shown in the following images. 
                       [STRICT] KEEP the original dog's face, gaze, and breed features identical. 
                       [QUALITY] Treat this as a LUXURY FASHION PICTORIAL. Use professional studio lighting and textures.
                       [TASK] Seamlessly blend the items onto the dog's body with realistic folds, shadows, and 3D depth. 
                       The result must be a high-end, commercial-grade photograph.`
                    : `Perform a luxury virtual try-on. Precisely dress this dog in: ${cleanPrompt}. 
                       Maintain the dog's exact identity. If background change is allowed, use a stunning matching location. 
                       Professional editorial quality with realistic fabric interaction.`;

                parts.push({ text: instruction });
                parts.push({ inlineData: { data: dogBase64, mimeType } });
                if (clothBase64) parts.push({ inlineData: { data: clothBase64, mimeType } });
                if (accBase64) parts.push({ inlineData: { data: accBase64, mimeType } });
            } else {
                // CLEAN & DIRECT PICTORIAL (Sales-Focused)
                instruction = `Transform this dog into a luxury fashion pictorial.
                   [STYLING] Dress the dog in the fashion items described: ${cleanPrompt}.
                   [FOCUS] Highlight the clothing details (texture, buttons, patterns) to make them look desirable and shoppable.
                   [SCENE] Change the background to a beautiful, matching location with a warm and cozy atmosphere.
                   [MOOD] Apply cinematic color grading and soft, dreamy lighting.
                   [PRESERVE] Maintain the dog's exact facial features and breed characteristics.
                   Ultra-realistic, professional commercial quality.`;

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