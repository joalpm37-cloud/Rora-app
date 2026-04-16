import dotenv from 'dotenv';
dotenv.config();

// Shim per Vite's import.meta.env
global.import = { 
  meta: { 
    env: process.env 
  } 
};

import { crearContactoGHL, buscarContactoGHL } from '../rora/utils/ghl-api';

async function testGHL() {
  console.log('--- TEST GHL ---');
  const name = "Ana Torres (Test)";
  const phone = "611-222-333";
  const email = "ana.torres@test.com";

  try {
    console.log(`Checking if contact exists: ${phone}`);
    const existing = await buscarContactoGHL(phone);
    if (existing) {
      console.log('Contact already exists in GHL:', existing.id);
    } else {
      console.log('Contact not found. Creating...');
      const result = await crearContactoGHL({
        nombre: name,
        telefono: phone,
        email: email
      });
      console.log('Result:', JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error('Error in testGHL:', err);
  }
}

testGHL();
