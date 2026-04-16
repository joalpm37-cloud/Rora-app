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

// NUEVA FUNCIÓN: Crear un Managed Agent (Beta)
export async function crearAgenteManaged(nombre, systemPrompt) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/agents', {
      method: 'POST',
      headers: {
        'x-api-key': getEnv('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: nombre,
        model: 'claude-3-5-sonnet-20240620', // Cambiado de 20241022 por soporte en Beta
        system: systemPrompt
      })
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Error creando agente:', errorData);
        throw new Error(`Error en Managed Agents: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en crearAgenteManaged:', error);
    throw error;
  }
}

// NUEVA FUNCIÓN: Llamar a un Managed Agent por ID
export async function llamarAgenteManaged(agentId, mensajeUsuario, historial = []) {
    try {
      const response = await fetch(`https://api.anthropic.com/v1/agents/${agentId}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': getEnv('ANTHROPIC_API_KEY'),
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'managed-agents-2026-04-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          max_tokens: 1024,
          messages: [
            ...historial,
            { role: 'user', content: mensajeUsuario }
          ]
        })
      });
  
      if (!response.ok) {
          const error = await response.text();
          throw new Error(`Error llamando al agente: ${response.status} - ${error}`);
      }
  
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error en llamarAgenteManaged:', error);
      throw error;
    }
  }
