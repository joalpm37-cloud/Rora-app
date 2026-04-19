import dotenv from 'dotenv';
import { llamarGemini } from './rora/utils/gemini-api.js';

dotenv.config();

async function testGeminiKey() {
  console.log("💎 Validando Gemini API Key...");
  
  try {
    const respuesta = await llamarGemini(
      "Hola Gemini, saludame como si fueras Lyra, la Agente de Ventas de RORA. Confirma que estás operativa.",
      [] // Sin herramientas para evitar errores de Firebase
    );

    console.log("\n🤖 RESPUESTA DE GEMINI:");
    console.log("--------------------------------------------------");
    console.log(respuesta.text);
    console.log("--------------------------------------------------");
    console.log("\n✅ ¡API KEY VALIDADA Y OPERATIVA!");
  } catch (error) {
    console.error("\n❌ ERROR DE GEMINI:", error.message);
  }
}

testGeminiKey();
