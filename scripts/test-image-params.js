const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testImageParams() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    console.log("Testing aspect ratio and negative prompt...");

    // Test with aspect ratio and negative prompt if SDK supports it in generationConfig or elsewhere
    // Note: The Node SDK structure for image generation often passes these in generationConfig?
    // Let's try to pass them and see if it errors or works.

    const prompt = "A cute dog astronaut";

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                // Trying standard Imagen style params
                aspectRatio: "3:4",
                // negativePrompt: "bad anatomy", // Not standard in core Gemini generateContent yet?
                // Let's see if it accepts these.
            }
        });

        console.log("Response received!");
        const response = await result.response;
        console.log("Success with 3:4 aspect ratio?");
        // If it didn't throw, it might be supported or ignored. 
    } catch (e) {
        console.error("Failed with aspect ratio:", e.message);
    }
}

testImageParams();
