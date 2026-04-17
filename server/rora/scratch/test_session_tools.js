import { llamarAgenteManaged } from '../utils/claude-api.js';
import dotenv from 'dotenv';
dotenv.config();

const RORA_AGENT_ID = "agent_011Ca82NXWoe3hWykRQCd6bv"; // El ID que sí funcionó antes
const OHIO_ENV_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder o el real

async function testSessionTools() {
  console.log("🧪 Probando inyección de herramientas a nivel de SESIÓN (V2.6.7 Stable Loop)...");
  try {
    const result = await llamarAgenteManaged(
      RORA_AGENT_ID, 
      "Busca si tenemos algún lead llamado Joseph peña.", 
      OHIO_ENV_ID,
      null // Nueva sesión
    );
    console.log("✅ Éxito!");
    console.log(result.reply);
  } catch (error) {
    console.error("❌ Fallo en sesión-level tools.");
    console.error(error);
  }
}

testSessionTools();
