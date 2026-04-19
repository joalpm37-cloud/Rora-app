import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testSDK() {
    console.log("🧪 Verificando SDK @google/genai...");
    try {
        const client = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });

        const response = await client.models.generateContent({
            model: "gemini-1.5-flash",
            // Note: systemInstruction is the correct field for Gemini 1.5/2.0 in many GenAI SDKs
            config: {
                systemInstruction: "Eres un asistente de prueba.",
            },
            contents: [
                { role: 'user', parts: [{ text: "Responde 'OK' si recibes esto." }] }
            ]
        });

        // Verificamos cómo acceder al texto
        console.log("Respuesta recibida:", JSON.stringify(response, null, 2));
        
        // En algunas versiones es response.text, en otras response.response.text()
        const text = response.text || (response.response && response.response.text && response.response.text());
        console.log("Texto extraído:", text);

        if (text) {
            console.log("✅ SDK verificado con éxito.");
        } else {
            console.log("⚠️ No se pudo extraer texto de la respuesta.");
        }
    } catch (error) {
        console.error("❌ Error en la prueba del SDK:", error.message);
        if (error.stack) console.error(error.stack);
    }
}

testSDK();
