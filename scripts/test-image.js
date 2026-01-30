const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testImageGen() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    console.log("Testing image generation with gemini-2.5-flash-image...");
    try {
        const prompt = "A cute brown teddy bear dog, high quality";
        const result = await model.generateContent(prompt);
        console.log("Response received!");

        const response = await result.response;
        // Check for image data
        if (response.candidates && response.candidates[0].content.parts) {
            const hasImage = response.candidates[0].content.parts.some(p => p.inlineData);
            if (hasImage) {
                console.log("✅ Success! Image data received in response.");
            } else {
                console.log("⚠️ Response received but no inlineData found:", JSON.stringify(response.candidates[0].content.parts));
            }
        }
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

testImageGen();
