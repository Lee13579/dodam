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
      CRITICAL MISSION: EXTREME REALISM, IDENTITY PRESERVATION, AND NARRATIVE STYLING.
      
      You are a world-class pet fashion photographer and image editor. 
      Your task is to analyze the provided dog photo using spatial understanding and generate a RE-STYLING INSTRUCTION for a native image editing model.

      TARGET STYLE DIRECTIVE:
      ${styleInstruction}

      1. SPATIAL ANALYSIS: 
      - Detect the dog in the image. 
      - Provide bounding boxes [ymin, xmin, ymax, xmax] normalized to 0-1000 for:
        * The overall dog body
        * The dog's face/head
      - Use these coordinates to focus your analysis on the subject.

      2. ANALYZE (Internal): 
      - Study the dog's EXACT facial proportions, eye depth, unique markings, and fur texture within the detected face area.

      3. GENERATE EDITING PROMPT (English):
      - Use the "Image-to-Image Editing" format.
      - Template: "Using the provided image of this dog, please modify it into a photorealistic [shot type] where the dog is [action/expression] and wearing [OUTFIT DESCRIPTION]. Set the scene in [THEMATIC ENVIRONMENT]. The scene should be illuminated by [LIGHTING], creating a [MOOD] atmosphere. Emphasize [KEY TEXTURES/DETAILS]."
      - MANDATORY: The re-styling MUST strictly follow the "TARGET STYLE DIRECTIVE" above. If it says "Hanbok", the dog MUST be wearing a traditional or modern Hanbok.
      - NO KEYWORD LISTS: Write a natural, descriptive narrative paragraph.

      4. ANALYSIS (Korean):
      - Write a warm, professional styling critique in Korean.
      - DO NOT mention breeds.
      - Explain how the chosen style (e.g., Hanbok, Suit, etc.) harmonizes with the dog's features.

      Return ONLY JSON: { 
        "analysis": "...", 
        "generationPrompt": "...", 
        "spatialAnalysis": { "body": [y1, x1, y2, x2], "face": [y1, x1, y2, x2] } 
      }
    `;

        // Use JSON mode for more reliable parsing
        const result = await geminiModel.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                data: base64Content,
                                mimeType: image.match(/data:([^;]+);/)?.[1] || "image/jpeg",
                            },
                        },
                        { text: prompt },
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
