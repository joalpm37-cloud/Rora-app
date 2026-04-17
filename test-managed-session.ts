import dotenv from 'dotenv';
dotenv.config();

async function testManagedSession() {
  const url = 'https://api.anthropic.com/v1/sessions';
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const envId = 'env_01VdjE16ZD5VrM4pZX6v2QA7';
  const agentId = 'agent_011Ca82NXWoe3hWykRQCd6bv'; // De backend-rora.js

  console.log('--- Probando Creación de Sesión en Entorno Managed ---');
  console.log(`🌍 Entorno: ${envId}`);
  console.log(`🤖 Agente (ID del código): ${agentId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent: agentId,
        environment_id: envId,
        metadata: { diagnostic: 'test' }
      })
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('Respuesta:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('\n✅ ¡SESIÓN CREADA! El ID del entorno es válido y la API Key funciona con Managed Agents.');
    } else {
        console.log('\n❌ ERROR: No se pudo crear la sesión.');
        if (data.error && data.error.type === 'forbidden') {
            console.log('💡 Tip: Sigue dando 403. Esto indica un problema de permisos en el nivel de cuenta para Managed Agents.');
        }
    }
  } catch (error) {
    console.error('Error de red:', error.message);
  }
}

testManagedSession();
