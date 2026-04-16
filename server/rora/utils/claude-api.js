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
export async function llamarAgenteManaged(agentId, mensajeUsuario, environmentId, sessionId = null) {
    try {
      console.log(`🚀 Comunicación con Agente: ${agentId} ${sessionId ? '(Sesión Reusada)' : '(Nueva Sesión)'}`);
      
      const commonHeaders = {
        'x-api-key': getEnv('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'content-type': 'application/json'
      };

      let activeSessionId = sessionId;

      // 1. Crear Sesión si no existe
      if (!activeSessionId) {
        console.log('🌐 Creando nueva sesión de orquestación...');
        const sessionResponse = await fetch('https://api.anthropic.com/v1/sessions', {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({ 
            agent: agentId,
            environment_id: environmentId,
            metadata: { 
              context: 'RORA_ORCHESTRATOR',
              // Token Efficiency: Mark as cache-eligible if supported in beta
              cache_control: { type: "ephemeral" } 
            }
          })
        });

        if (!sessionResponse.ok) {
          const err = await sessionResponse.text();
          throw new Error(`Fallo al crear sesión: ${sessionResponse.status} - ${err}`);
        }

        const session = await sessionResponse.json();
        activeSessionId = session.id;
        console.log(`📂 Sesión creada: ${activeSessionId}`);
      }

      // 2. Enviar Mensaje (Evento en Array con Cache Hint)
      const eventBody = {
        events: [
          {
            type: 'user.message',
            content: [
              { 
                type: 'text', 
                text: mensajeUsuario,
                // Token Efficiency: Hint to cache the context prefix
                cache_control: { type: "ephemeral" } 
              }
            ]
          }
        ]
      };
      
      const eventResponse = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(eventBody)
      });

      if (!eventResponse.ok) {
        const err = await eventResponse.text();
        // Si la sesión expiró, intentamos una vez más sin sessionId
        if (eventResponse.status === 404 && sessionId) {
          console.warn('⚠️ Sesión expirada. Reintentando con nueva sesión...');
          return llamarAgenteManaged(agentId, mensajeUsuario, environmentId, null);
        }
        throw new Error(`Fallo al enviar mensaje: ${eventResponse.status} - ${err}`);
      }

      // Devolvemos el sessionId para que el frontend lo guarde
      const responseText = await (async () => {
        let attempts = 0;
        const MAX_ATTEMPTS = 15;
        console.log(`⏳ Esperando respuesta de Rora en sesión ${activeSessionId}...`);
        
        while (attempts < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const pollResponse = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
            method: 'GET',
            headers: commonHeaders
          });

          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            const events = pollData.data || pollData;
            
            if (Array.isArray(events)) {
              // Filtrar eventos de respuesta del agente
              const lastResponse = events.reverse().find(e =>  
                e.type === 'agent.message' || 
                (e.type === 'text' && e.role === 'assistant')
              );
              
              if (lastResponse) {
                const text = lastResponse.text || (lastResponse.content && lastResponse.content[0].text);
                if (text) {
                  console.log('✅ Respuesta recibida.');
                  return text;
                }
              }
            }
          }
          attempts++;
        }
        throw new Error('Timeout esperando respuesta del agente.');
      })();

      return {
        reply: responseText,
        sessionId: activeSessionId
      };

    } catch (error) {
      console.error('Error en llamarAgenteManaged:', error);
      throw error;
    }
}
