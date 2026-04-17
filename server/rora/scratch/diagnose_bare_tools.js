import dotenv from 'dotenv';
dotenv.config();

async function testBareTools() {
  console.log("🧪 Diagnóstico: Probando Tool Use BÁSICO (Sin Cache, Sin Beta Managed)...");
  
  const requestBody = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    tools: [
      {
        name: "test_tool",
        description: "Una herramienta de prueba.",
        input_schema: { type: "object", properties: { val: { type: "string" } } }
      }
    ],
    messages: [{ role: 'user', content: 'Usa la herramienta test_tool con val="hola"' }]
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("❌ Fallo:", data);
    } else {
        console.log("✅ Éxito con Tool Use Básico!");
        console.log(JSON.stringify(data.content, null, 2));
    }
  } catch (error) {
    console.error("❌ Error fatal:", error);
  }
}

testBareTools();
