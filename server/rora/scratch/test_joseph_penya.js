import { llamarAgenteManaged } from '../utils/claude-api.js';
import dotenv from 'dotenv';
dotenv.config();

async function runJosephTest() {
  console.log("🔍 Iniciando prueba real de RORA V2.9.0...");
  console.log("Pregunta: ¿Busca si tenemos algún lead llamado Joseph peña?\n");

  try {
    const result = await llamarAgenteManaged("Busca si tenemos algún lead llamado Joseph peña");
    
    console.log("\n-----------------------------------------");
    console.log("🎭 RESPUESTA DE RORA:");
    console.log(result.reply);
    console.log("-----------------------------------------");
    console.log(`🆔 ID de Sesión: ${result.sessionId}`);
  } catch (error) {
    console.error("\n❌ Fallo en la prueba de orquestación:", error.message);
  }
}

runJosephTest();
