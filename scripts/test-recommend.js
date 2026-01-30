const fs = require('fs');
const path = require('path');

async function testRecommend() {
    const imagePath = path.join(process.cwd(), 'public/images/styles/hawaiian.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    console.log("Testing /api/recommend with gemini-3-flash-preview...");
    try {
        const response = await fetch("http://localhost:3000/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageBase64 })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.concepts) {
            console.log("Success! Recommended concepts count:", data.concepts.length);
            console.log("First concept:", data.concepts[0].name);
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testRecommend();
