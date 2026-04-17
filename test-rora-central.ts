import dotenv from 'dotenv';
dotenv.config();

import { procesarMensajeRora } from './rora/agentes/rora-central';

async function test() {
  console.log("--- Iniciando prueba de RORA Central ---");
  const mensaje = "Hola RORA, ¿puedes buscar si existe un contacto llamado 'Test RORA'?";
  
  try {
    console.log(`Mensaje: "${mensaje}"`);
    const resultado = await procesarMensajeRora(mensaje);
    console.log("\nResultado de RORA:");
    console.log(JSON.stringify(resultado, null, 2));
    
    if (resultado.mensajeParaMostrar) {
        console.log("\n✅ PRUEBA EXITOSA: RORA respondió correctamente.");
    } else {
        console.log("\n❌ PRUEBA FALLIDA: RORA no devolvió un mensaje.");
    }
  } catch (error) {
    console.error("Error en la prueba:", error);
  }
}

test();
