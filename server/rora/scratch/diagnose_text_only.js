import dotenv from 'dotenv';
dotenv.config();

async function testPureText() {
  console.log("🧪 Diagnóstico Final: Probando TEXTO PURO (Sin Tools, Sin nada)...");
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Di hola' }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("❌ Fallo Texto Puro:", data);
    } else {
        console.log("✅ Éxito Texto Puro!");
        console.log(data.content[0].text);
    }
  } catch (error) {
    console.error("❌ Error fatal:", error);
  }
}

testPureText();
