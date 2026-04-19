import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Configuración del Cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // O el ID exacto de Gemini 3 Flash si es diferente
});

/**
 * Llama a la API de Gemini (Versión Flash)
 */
export async function llamarGemini(systemPrompt, userPrompt, history = []) {
    try {
        console.log("💎 Generando respuesta con Gemini 3 Flash...");
        
        // Conversión de historial al formato de Google
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Entendido. Actuaré según estas instrucciones." }] },
            ...history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || m.text }]
            })),
            { role: 'user', parts: [{ text: userPrompt }] }
        ];

        const result = await model.generateContent({ contents });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("❌ Error en llamarGemini (Producción):", error.message);
        throw error;
    }
}
