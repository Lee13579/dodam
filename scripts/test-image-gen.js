const fs = require('fs');
const path = require('path');

async function testImageGen() {
    const imagePath = path.join(process.cwd(), 'public/images/styles/hawaiian.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    console.log("Testing /api/generate with gemini-2.5-flash-image...");
    try {
        const response = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: "A cute dog wearing a stylish tuxedo, cinematic lighting.", 
                image: imageBase64 
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.urls) {
            console.log("Success! Generated images count:", data.urls.length);
        } else {
            console.log("Error Details:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testImageGen();
