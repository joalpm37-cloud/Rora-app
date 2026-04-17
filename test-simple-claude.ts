import dotenv from 'dotenv';
dotenv.config();

import { llamarClaude } from './rora/utils/claude-api';

async function test() {
  console.log("--- Iniciando prueba SIMPLE de Claude API (Haiku) ---");
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Hola' }]
      })
    });
    
    const data = await response.json();
    console.log("\nRespuesta de Claude:");
    console.log(JSON.stringify(data, null, 2));
    
    if (response && response !== 'RORA no está disponible en este momento. Intenta de nuevo.') {
        console.log("\n✅ API KEY OPERATIVA.");
    } else {
        console.log("\n❌ API KEY NO RESPONDE CORRECTAMENTE.");
    }
  } catch (error) {
    console.error("Error en la prueba:", error);
  }
}

test();
