import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Inicializamos el cliente de Google Gen AI (Nueva versión SDK)
const client = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

/**
 * Utilidad centralizada para llamar a Gemini 2.0 Flash
 */
export async function llamarGemini(systemPrompt, userPrompt, history = [], tools = []) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'TU_GEMINI_API_KEY' || !GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY no configurada. Por favor, añádela al archivo .env");
    }

    try {
        // En el nuevo SDK @google/genai, accedemos via client.models.generateContent
        const response = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: systemPrompt,
            },
            contents: [
                ...history,
                { role: 'user', parts: [{ text: userPrompt }] }
            ],
            tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined
        });

        // El SDK v1.x devuelve el texto directamente en el objeto de respuesta o vía .text()
        const text = response.text || (response.response && typeof response.response.text === 'function' ? response.response.text() : '');
        
        if (!text && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
            return response.candidates[0].content.parts[0].text;
        }

        return text;

    } catch (error) {
        console.error("Error al llamar a Gemini:", error.message);
        
        if (error.message.includes("429") || error.message.includes("quota")) {
            throw new Error("GEMINI_QUOTA_EXCEEDED: Por favor verifica los límites de tu API Key o intenta con gemini-1.5-flash.");
        }
        
        if (error.message.includes("API_KEY_INVALID")) {
            throw new Error("GEMINI_API_KEY_INVALID: Por favor verifica el archivo .env");
        }
        
        throw error;
    }
}
