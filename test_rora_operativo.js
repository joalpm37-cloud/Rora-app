import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const key = process.env.VITE_CLAUDE_API_KEY;
  console.log(`Debug Key: Prefix=${key?.substring(0, 10)}..., Length=${key?.length}`);
  console.log("--- Iniciando prueba de Claude API desde el Backend ---");
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [{ role: "user", content: "Responde solo: RORA operativo" }]
      })
    });

    const data = await response.json();
    console.log("Respuesta completa:");
    console.log(JSON.stringify(data, null, 2));

    if (data.content && data.content[0].text.includes("RORA operativo")) {
        console.log("\n✅ RESULTADO: RORA operativo");
    } else {
        console.log("\n❌ RESULTADO: Error en la respuesta o formato inesperado.");
    }
  } catch (error) {
    console.error("Error en la prueba:", error);
  }
}

test();
