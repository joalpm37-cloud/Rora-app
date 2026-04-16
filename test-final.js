import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import { 
  obtenerSlotsCalendario, 
  crearContactoGHL 
} from './rora/utils/ghl-api.js';

async function runTests() {
  const results = {};
  
  try {
    results.PruebaA = await obtenerSlotsCalendario();
  } catch(e) {
    results.PruebaA_Error = e.message;
  }

  try {
    results.PruebaB = await crearContactoGHL({telefono: "111-222-3333"});
  } catch(e) {
    results.PruebaB_Error = e.message;
  }

  try {
    results.PruebaC = await crearContactoGHL({
      nombre: "Maria García",
      telefono: "999-888-7777",
      email: "maria.garcia.rora@test.com"
    });
  } catch(e) {
    results.PruebaC_Error = e.message;
  }

  fs.writeFileSync('final-results.json', JSON.stringify(results, null, 2));
}

runTests();
