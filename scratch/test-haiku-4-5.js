import dotenv from 'dotenv';
dotenv.config();

async function testModelAccess() {
  const model = 'claude-haiku-4-5-20251001';
  console.log(`📡 Probando acceso al modelo: ${model} desde Ohio...`);
  
  try {
    const response = await fetch('https://rora-app.onrender.com/api/rora/agents/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: 'Confirmar modelo' })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModelAccess();
