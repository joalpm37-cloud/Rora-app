import dotenv from 'dotenv';
dotenv.config();

import { programarPublicacionGHL } from './rora/utils/ghl-api.js';
import fs from 'fs';

async function runTests() {
  console.log("Ejecutando prueba de publicación...");
  const result = {};

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Mañana a las 10:00 AM

    const payload = {
        accountIds: [process.env.GHL_INSTAGRAM_ACCOUNT_ID],
        text: "🏡 Test de integración RORA — Sistema de publicación automática activo. #RORA #InmobiliariaIA",
        scheduledAt: tomorrow.toISOString() // Formato ISO 8601 utc
    };

    const respuesta = await programarPublicacionGHL(payload);
    result.RespuestaGHL = respuesta;
  } catch (error) {
    result.ErrorGHL = error.message;
  }

  fs.writeFileSync('test-post-result.json', JSON.stringify(result, null, 2));
  console.log("Prueba finalizada. Resultado guardado en test-post-result.json");
}

runTests();
