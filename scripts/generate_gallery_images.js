const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

async function generateAndSave(prompt, filename) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY found");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(key);
    // Using the same model as in the codebase
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    console.log(`Generating image for: ${prompt}`);
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;

        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        if (part && part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            const outputPath = path.join(process.cwd(), "public", filename);
            fs.writeFileSync(outputPath, buffer);
            console.log(`✅ Saved to ${outputPath}`);
        } else {
            console.error("❌ No image data received");
            console.log("Response parts:", JSON.stringify(response.candidates[0].content.parts));
        }
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node generate_gallery_images.js <prompt> <filename>");
    process.exit(1);
}

generateAndSave(args[0], args[1]);
