import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Inicialización diferida (Lazy Loading) para evitar crashes si la API KEY está vacía al arrancar
let genAI = null;
let model = null;

function getModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("🚨 [Gemini] ERROR: GEMINI_API_KEY no configurada.");
        throw new Error("API Key de Gemini no disponible. Revisa los Secretos de GitHub.");
    }

    if (!model) {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
        });
    }
    return model;
}

/**
 * Llama a la API de Gemini (Versión Flash)
 */
export async function llamarGemini(systemPrompt, userPrompt, history = []) {
    try {
        const activeModel = getModel();
        console.log("💎 Generando respuesta con Gemini 3 Flash...");
        
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Entendido. Actuaré según estas instrucciones." }] },
            ...history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || m.text }]
            })),
            { role: 'user', parts: [{ text: userPrompt }] }
        ];

        const result = await activeModel.generateContent({ contents });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("❌ Error en llamarGemini:", error.message);
        throw error;
    }
}
