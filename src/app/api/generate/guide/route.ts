import { geminiImageModel } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import listLimiter from "@/lib/rate-limit";
import crypto from "crypto";

const limiter = listLimiter({ uniqueTokenPerInterval: 500, interval: 60000 });

// Helper to create a hash of the prompt for DB lookups
const getPromptHash = (prompt: string) => {
    return crypto.createHash("md5").update(prompt).digest("hex");
};

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { isRateLimited } = limiter.check(20, ip);

    if (isRateLimited) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    try {
        const { visualPrompt, itemName } = await req.json();

        if (!visualPrompt) {
            return NextResponse.json({ error: "visualPrompt is required" }, { status: 400 });
        }

        const promptHash = getPromptHash(visualPrompt);

        // 1. Check Cache in Supabase
        const { data: cachedAsset, error: fetchError } = await supabase
            .from("style_assets")
            .select("image_url")
            .eq("prompt_hash", promptHash)
            .single();

        if (cachedAsset?.image_url) {
            console.log(`[Cache Hit] Returning existing image for: ${itemName || visualPrompt}`);
            return NextResponse.json({ url: cachedAsset.image_url, cached: true });
        }

        // 2. Generate if not in cache
        console.log(`[Cache Miss] Generating new image for: ${itemName || visualPrompt}`);
        const result = await geminiImageModel.generateContent({
            contents: [{ 
                role: "user", 
                parts: [{ text: visualPrompt }] 
            }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
            }
        });

        const response = await result.response;
        const candidate = response.candidates?.[0];
        const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

        if (!imagePart?.inlineData) throw new Error("Guide image generation failed");

        const base64Data = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        // 3. Store in Supabase (Image as DataURL or move to Storage)
        // For efficiency, in a real production env, you would upload to Supabase Storage 
        // and save the resulting URL. For this MVP, we save the dataUrl if it's small, 
        // or just the URL from Storage.
        
        // Let's attempt to save to DB (Note: Large strings might need Storage)
        const { error: insertError } = await supabase
            .from("style_assets")
            .insert({
                prompt_hash: promptHash,
                prompt: visualPrompt,
                image_url: dataUrl,
                item_name: itemName
            });

        if (insertError) {
            console.error("Failed to cache style asset:", insertError);
        }

        return NextResponse.json({ 
            url: dataUrl,
            cached: false
        });
    } catch (error: any) {
        console.error("Guide Generation Error:", error);
        return NextResponse.json({ error: "Generation failed", details: error.message }, { status: 500 });
    }
}
