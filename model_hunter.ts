import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function findWorkingModel() {
    const client = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite-preview-02-05"
    ];

    console.log("🧪 Probando modelos...");

    for (const model of modelsToTry) {
        try {
            console.log(`- Probando ${model}...`);
            const response = await client.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts: [{ text: "hi" }] }]
            });
            console.log(`✅ ¡ÉXITO con ${model}!`);
            process.exit(0);
        } catch (e) {
            console.log(`  ❌ Fallo ${model}: ${e.message.split('\n')[0]}`);
        }
    }
    console.log("💀 Ningún modelo funcionó.");
}

findWorkingModel();
