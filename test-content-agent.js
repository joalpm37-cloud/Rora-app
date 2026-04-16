import dotenv from 'dotenv';
dotenv.config();

import { obtenerCuentasSocialGHL } from './rora/utils/ghl-api.js';
import { procesarSolicitudContenido } from './rora/agentes/content-agent.js';
import fs from 'fs';

async function runTests() {
  const result = {};

  console.log("Corriendo Prueba 1...");
  try {
    const cuentas = await obtenerCuentasSocialGHL();
    result.Prueba1 = cuentas;
  } catch (error) {
    result.Prueba1_Error = error.message;
  }

  console.log("Corriendo Prueba 2...");
  try {
    const datos = {
        nombre: "Villa Marítima", 
        ubicacion: "Marbella", 
        precio: "850,000€", 
        habitaciones: 4, 
        banos: 3, 
        metros: 320, 
        caracteristicas: "piscina infinita, vistas al mar, domótica completa", 
        tipoContenido: "instagram_reel"
    };

    const json = await procesarSolicitudContenido(datos);
    result.Prueba2 = json;
  } catch (error) {
    result.Prueba2_Error = error.message;
  }

  fs.writeFileSync('test-content.json', JSON.stringify(result, null, 2));
  console.log("Pruebas finalizadas. Resultado en test-content.json");
}

runTests();
