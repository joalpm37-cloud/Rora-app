import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error('No API Key');
        return;
    }

    const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    try {
        console.log('Listing all models...');
        let result = await client.models.list();
        let models = Array.isArray(result) ? result : (result.models || []);
        
        console.log('\n--- MODELS CONTAINING "3" ---');
        models.filter(m => 
            m.name.includes('3') || 
            (m.displayName && m.displayName.includes('3'))
        ).forEach(m => {
            console.log(`- Name: ${m.name} | Display: ${m.displayName}`);
        });

        console.log('\n--- MODELS CONTAINING "FLASH" ---');
        models.filter(m => 
            m.name.toLowerCase().includes('flash')
        ).forEach(m => {
            console.log(`- Name: ${m.name} | Display: ${m.displayName}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

run();
