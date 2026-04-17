async function testSessionNoTools() {
  const url = 'https://api.anthropic.com/v1/sessions';
  const apiKey = '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';
  const envId = 'env_01VdjE16ZD5VrM4pZX6v2QA7';
  const agentId = 'agent_011Ca82NXWoe3hWykRQCd6bv';

  console.log('--- Probando Creación de Sesión SIN TOOLS (Managed Agents) ---');

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
        environment_id: envId
      })
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('Respuesta:', JSON.stringify(data, null, 2));

    if (response.ok) {
        console.log('\n✅ ¡SESIÓN CREADA! El problema era el envío redundante de "tools".');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSessionNoTools();
