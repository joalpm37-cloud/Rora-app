import dotenv from 'dotenv';
dotenv.config();

// Shim per Vite's import.meta.env
global.import = { meta: { env: process.env } };

import { procesarMensajeRora } from '../rora/agentes/rora-central';

async function simulateChat() {
  console.log('--- SIMULATING REALTOR MESSAGE ---');
  const message = "Tengo un lead nuevo. Se llama Ana Torres, su teléfono es 611-222-333, busca apartamento en Madrid con presupuesto de 250,000 euros. Está muy interesada.";
  
  console.log('Message:', message);
  console.log('Processing with RORA Central...');

  try {
    const result = await procesarMensajeRora(message);
    
    console.log('\n--- RORA RESPONSE ---');
    console.log('Mensaje:', result.mensajeParaMostrar);
    console.log('Acción:', result.accion);
    console.log('Datos:', result.datos);
    
    if (result.accion === 'lead') {
        console.log('\nSUCCESS: RORA detected a lead and should have triggered GHL/Firebase logic.');
    } else {
        console.log('\nWARNING: RORA did not detect a lead. result.accion was:', result.accion);
    }
  } catch (err) {
    console.error('Error during simulation:', err);
    // If Claude fails with 403, report it here
  }
}

simulateChat();
