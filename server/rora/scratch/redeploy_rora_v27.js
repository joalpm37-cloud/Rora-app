import { crearAgenteManaged } from '../utils/claude-api.js';
import { GHL_TOOLS } from '../utils/claude-tools.js';
import dotenv from 'dotenv';
dotenv.config();

const RORA_SYSTEM_PROMPT = `Eres RORA, el super agente orquestador de una plataforma diseñada para asesores inmobiliarios independientes. 
Tu misión es coordinar, delegar y ejecutar tareas en GoHighLevel (GHL) usando tus herramientas integradas.
Siempre que necesites buscar información, agendar citas o gestionar el CRM, utiliza tus herramientas de GHL de forma autónoma.
Tono: Profesional, ejecutivo, eficiente.`;

async function deploySuperRora() {
  console.log("🧬 Iniciando nacimiento de Super-Rora V2.7...");
  console.log(`🛠️ Inyectando ${GHL_TOOLS.length} capacidades de GHL...`);

  try {
    const newAgent = await crearAgenteManaged(
      "RORA — Directora de Orquesta (Super-Agent)", 
      RORA_SYSTEM_PROMPT, 
      GHL_TOOLS
    );

    console.log("\n✅ ¡Super-Rora ha nacido con éxito!");
    console.log("-----------------------------------------");
    console.log(`🆔 Nuevo AGENT_ID: ${newAgent.id}`);
    console.log("-----------------------------------------");
    console.log("👉 Copia este ID y actualízalo en server/index.js para activar el poder total.");
  } catch (error) {
    console.error("❌ Fallo en el despliegue del ADN de Rora:", error);
  }
}

deploySuperRora();
