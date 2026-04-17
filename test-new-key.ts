import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("--- Probando NUEVA API Key con el modelo solicitado ---");
  const url = 'https://api.anthropic.com/v1/messages';
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  
  // Usamos el modelo que el usuario proporcionó en su ejemplo
  const model = "claude-haiku-4-5-20251001"; 

  console.log(`🤖 Usando modelo: ${model}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 100,
        messages: [{ role: 'user', content: '¿Estás operativo? Responde brevemente.' }]
      })
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('Respuesta:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log("\n✅ ¡EXITO! La nueva API Key y el modelo están funcionando.");
    } else {
        console.log("\n❌ ERROR: La petición falló.");
        if (data.error && data.error.message.includes("model")) {
            console.log("💡 Tip: Es posible que el nombre del modelo sea incorrecto o no tengas acceso.");
        }
    }
  } catch (error) {
    console.error('Error durante la llamada:', error);
  }
}

test();
