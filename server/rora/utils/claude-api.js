// Utilidad: Llamadas a la API de Claude (Backend version)

const getEnv = (name) => {
  return process.env[name] || process.env[`VITE_${name}`];
};

export async function llamarClaude(systemPrompt, mensajeUsuario, historial = [], tools = []) {
  try {
    const requestBody = {
      model: getEnv('CLAUDE_MODEL') || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...historial,
      ]
    };

    if (mensajeUsuario) {
        requestBody.messages.push({ role: 'user', content: mensajeUsuario });
    }

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': getEnv('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error en la llamada a la API de Claude:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (tools && tools.length > 0) {
        return data; 
    }
    
    return data.content[0].text;
    
  } catch (error) {
    console.error('Error al intentar llamar a Claude:', error);
    return 'RORA no está disponible en este momento. Intenta de nuevo.';
  }
}
