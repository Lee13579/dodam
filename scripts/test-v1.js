const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testV1() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing with API version v1...");

    // Attempt to force v1 if possible, though the SDK might not expose it easily in high-level
    // We can try passing it in explicit config if supported, or falling back to a raw fetch if needed to prove the point.
    // For now, let's try standard SDK and see if we can perform a simple list models via REST to debug.

    // Raw REST test
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("✅ v1/models List success. Available models:");
            console.log(data.models.map(m => m.name).filter(n => n.includes("flash")).join(", "));
        } else {
            console.log("❌ v1/models failed:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

testV1();
