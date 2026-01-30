const fs = require('fs');
const path = require('path');

async function testGenerate() {
    const imagePath = path.join(process.cwd(), 'public/images/styles/hawaiian.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    const prompt = "Using the provided image of this dog, please modify it into a photorealistic close-up where the dog is wearing a small black tuxedo with a red bow tie. Set the scene in a luxury ballroom. Warm chandelier lighting, elegant mood.";

    console.log("Testing /api/generate with gemini-2.5-flash-image...");
    try {
        const response = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, image: imageBase64 })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.urls) {
            console.log("Success! Generated images count:", data.urls.length);
            console.log("First image data URL starts with:", data.urls[0].substring(0, 50));
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testGenerate();
