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
        model: 'claude-sonnet-4-6', // Actualizado a modelo 4.6 soportado por la Beta en 2026
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

// NUEVA FUNCIÓN: Llamar a un Managed Agent (Protocolo Sesión -> Evento -> Polling)
export async function llamarAgenteManaged(agentId, mensajeUsuario, environmentId) {
    try {
      console.log(`🚀 Iniciando comunicación con Agente: ${agentId}`);
      
      const commonHeaders = {
        'x-api-key': getEnv('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'content-type': 'application/json'
      };

      // 1. Crear Sesión
      const sessionResponse = await fetch('https://api.anthropic.com/v1/sessions', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({ 
          agent: agentId,
          environment_id: environmentId,
          metadata: { context: 'RORA_TEST_SESSION' }
        })
      });

      if (!sessionResponse.ok) {
        const err = await sessionResponse.text();
        throw new Error(`Fallo al crear sesión: ${sessionResponse.status} - ${err}`);
      }

      const session = await sessionResponse.json();
      const sessionId = session.id;
      console.log(`📂 Sesión creada: ${sessionId}`);

      // 2. Enviar Mensaje (Evento en Array)
      const eventBody = {
        events: [
          {
            type: 'user.message',
            content: [{ type: 'text', text: mensajeUsuario }]
          }
        ]
      };
      
      console.log('📡 Enviando Evento a Sesión:', JSON.stringify(eventBody));

      const eventResponse = await fetch(`https://api.anthropic.com/v1/sessions/${sessionId}/events`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(eventBody)
      });

      if (!eventResponse.ok) {
        const err = await eventResponse.text();
        throw new Error(`Fallo al enviar mensaje: ${eventResponse.status} - ${err}`);
      }

      // 3. Polling de Respuesta
      let attempts = 0;
      const MAX_ATTEMPTS = 15;
      
      console.log('⏳ Esperando respuesta de Rora (Polling)...');
      
      while (attempts < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos entre polls
        
        const pollResponse = await fetch(`https://api.anthropic.com/v1/sessions/${sessionId}/events`, {
          method: 'GET',
          headers: commonHeaders
        });

        if (pollResponse.ok) {
          const pollData = await pollResponse.json();
          // Los eventos suelen venir en un array 'data' o similar
          const events = pollData.data || pollData;
          
          if (Array.isArray(events)) {
            // Buscamos el último evento de tipo agent.message o similar que contenga texto
            const lastResponse = events.reverse().find(e =>  e.type === 'agent.message' || e.type === 'text');
            if (lastResponse) {
              // El formato exacto depende de la beta, usualmente e.content[0].text o e.text
              const text = lastResponse.text || (lastResponse.content && lastResponse.content[0].text);
              if (text) {
                console.log('✅ Respuesta recibida de Rora.');
                return text;
              }
            }
          }
        }
        
        attempts++;
        console.log(`...intento ${attempts}/${MAX_ATTEMPTS}`);
      }

      throw new Error('Tiempo de espera agotado esperando respuesta del Agente Managed.');

    } catch (error) {
      console.error('Error en llamarAgenteManaged (Bridge):', error);
      throw error;
    }
  }
