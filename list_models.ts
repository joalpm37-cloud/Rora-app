import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("🔍 Listando modelos disponibles...");
    try {
        const client = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });

        // Intentar listar modelos
        const result = await client.models.list();
        console.log("Modelos encontrados:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("❌ Error al listar modelos:", error.message);
    }
}

listModels();
