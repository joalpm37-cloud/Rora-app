import dotenv from 'dotenv';
dotenv.config();

// Sobrescribimos el key de claude temporalmente para forzar el fallback y probar
process.env.CLAUDE_API_KEY = 'invalid_key_for_test';

import { buscarPropiedadesParaCliente } from './rora/agentes/explorer-agent.js';
import { generarDossierPDF } from './rora/utils/pdf-generator.js';
import fs from 'fs';

async function runTests() {
  console.log("Iniciando prueba de Explorer Agent con fallback...");
  
  const datosBusqueda = {
    nombreCliente: "Joseph",
    presupuestoMax: 100000,
    zonaPreferida: "Valencia",
    habitacionesMin: 3,
    caracteristicas: ["garaje", "terraza"]
  };

  try {
    const resultado = await buscarPropiedadesParaCliente(datosBusqueda);
    console.log("JSON Devuelto (Fallack de Firebase):");
    console.log(JSON.stringify(resultado, null, 2));
    
    console.log("\nGenerando PDF...");
    const filePath = await generarDossierPDF(resultado);
    console.log(`¡PDF Generado! Ruta del archivo: ${filePath}`);

  } catch (error) {
    console.error("Error en la prueba:", error);
  }
}

runTests();
