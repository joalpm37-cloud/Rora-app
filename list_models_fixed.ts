import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function run() {
    try {
        const client = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });

        console.log("Listing models...");
        const response = await client.models.list();
        
        // In @google/genai, the response might be an array or have a models property
        const modelList = Array.isArray(response) ? response : (response.models || []);
        
        modelList.forEach(m => {
            console.log(`Name: ${m.name} | Actions: ${m.supportedActions.join(', ')}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
