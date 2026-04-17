import { crearAgenteManaged } from '../utils/claude-api.js';
import { GHL_TOOLS } from '../utils/claude-tools.js';
import dotenv from 'dotenv';
dotenv.config();

// Probamos con solo las primeras 5 herramientas para diagnosticar el 403
const SUBSET_TOOLS = GHL_TOOLS.slice(0, 5);

const RORA_SYSTEM_PROMPT = `Eres RORA. Tienes 5 herramientas iniciales para diagnótico.`;

async function diagnoseRora() {
  console.log("🧪 Diagnosticando... Probando inyección de 5 herramientas...");
  try {
    const agent = await crearAgenteManaged("Rora Test", RORA_SYSTEM_PROMPT, SUBSET_TOOLS);
    console.log(`✅ Éxito con 5 herramientas. ID: ${agent.id}`);
    console.log("Esto sugiere que el error 403 es por la cantidad o el contenido de las 26 herramientas.");
  } catch (error) {
    console.error("❌ Fallo incluso con 5 herramientas. El problema es la estructura de inyección.");
    console.error(error);
  }
}

diagnoseRora();
