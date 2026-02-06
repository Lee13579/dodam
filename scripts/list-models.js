const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
    // Some SDK versions might have different ways to list models. 
    // If the above fails, we'll try another way.
    console.log("Available models:");
    result.models.forEach(m => console.log(m.name));
  } catch (e) {
    // Alternative method for listing
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("Available models (via fetch):");
        data.models?.forEach(m => console.log(m.name));
    } catch (fetchError) {
        console.error("Failed to list models:", fetchError);
    }
  }
}

listModels();
