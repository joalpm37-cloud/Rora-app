const RORA_BACKEND_URL = 'https://rora-app.onrender.com/api/rora/chat';

async function testFrontendRedirection() {
  console.log('📡 Simulando llamada desde el chat de app.rora.com.es...');
  
  const payload = {
    mensaje: "Busca a Joseph Peña y dime si tiene algún tag especial.",
    systemPrompt: "Eres RORA, Directora de Orquesta. Responde siempre con amabilidad.",
    historial: [],
    tools: null // El backend usará GHL_TOOLS por defecto
  };

  try {
    const response = await fetch(RORA_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Respuesta de RORA desde Ohio:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testFrontendRedirection();
