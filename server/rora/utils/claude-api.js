import { GHL_TOOLS } from './claude-tools.js';
import * as ghl from './ghl-api.js';

const getEnv = (name) => {
  return process.env[name] || process.env[`VITE_${name}`];
};

export async function llamarClaude(systemPrompt, mensajeUsuario, historial = [], tools = []) {
  try {
    const requestBody = {
      model: getEnv('CLAUDE_MODEL') || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...historial]
    };
    if (mensajeUsuario) requestBody.messages.push({ role: 'user', content: mensajeUsuario });
    if (tools && tools.length > 0) requestBody.tools = tools;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': getEnv('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`Claude Error: ${response.status}`);
    const data = await response.json();
    return tools.length > 0 ? data : data.content[0].text;
  } catch (error) {
    console.error('Error en llamarClaude:', error);
    return 'RORA offline.';
  }
}

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
        model: 'claude-sonnet-4-6',
        system: systemPrompt
      })
    });
    if (!response.ok) throw new Error(`Agente Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error en crearAgenteManaged:', error);
    throw error;
  }
}

// RESOLVER: Ejecuta la función real basada en el nombre de la tool
async function resolveToolCall(toolName, args) {
  console.log(`🛠️ Ejecutando herramienta: ${toolName}`, args);
  try {
    switch (toolName) {
      case 'crear_contacto':
        return await ghl.crearContactoGHL(args);
      case 'buscar_contacto':
        return await ghl.buscarContactoGHL(args.query);
      case 'obtener_conversaciones':
        return await ghl.buscarConversacionesGHL();
      case 'obtener_calendario':
        return await ghl.obtenerSlotsCalendario();
      case 'enviar_mensaje':
        return await ghl.enviarMensajeGHL(args.conversationId, args.mensaje);
      default:
        return { error: `Herramienta ${toolName} no implementada.` };
    }
  } catch (error) {
    console.error(`❌ Error ejecutando ${toolName}:`, error);
    return { error: error.message };
  }
}

// NUEVA FUNCIÓN: Llamar a un Managed Agent con Tool Loop Autónomo de Alta Estabilidad
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

    // 1. Asegurar Sesión con Tools
    if (!activeSessionId) {
      const sessionResponse = await fetch('https://api.anthropic.com/v1/sessions', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({ 
          agent: agentId,
          environment_id: environmentId,
          tools: GHL_TOOLS,
          metadata: { context: 'RORA_STABLE_ORCHESTRATOR' }
        })
      });

      if (!sessionResponse.ok) throw new Error(`Fallo Sesión: ${sessionResponse.status}`);
      const session = await sessionResponse.json();
      activeSessionId = session.id;
    }

    // REGISTRO DE PUNTO DE PARTIDA (Para evitar leer eventos viejos)
    let lastHandledEventIndex = -1;
    const getNewEvents = async () => {
        const res = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
          method: 'GET',
          headers: commonHeaders
        });
        if (!res.ok) return [];
        const pollData = await res.json();
        const allEvents = pollData.data || pollData;
        return Array.isArray(allEvents) ? allEvents : [];
    };

    // 2. Enviar Mensaje Inicial
    const initialSend = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({
        events: [{
          type: 'user.message',
          content: [{ type: 'text', text: mensajeUsuario, cache_control: { type: "ephemeral" } }]
        }]
      })
    });

    if (!initialSend.ok) {
      if (initialSend.status === 404 && sessionId) return await llamarAgenteManaged(agentId, mensajeUsuario, environmentId, null);
      throw new Error(`Fallo Envío: ${initialSend.status}`);
    }

    // 3. BUCLE DE ORQUESTACIÓN (Tool execution Loop)
    let finalReply = null;
    let turnCount = 0;
    const MAX_TURNS = 6;

    while (!finalReply && turnCount < MAX_TURNS) {
      turnCount++;
      console.log(`⏳ Orquestando (Turno ${turnCount})...`);
      
      let nextEvent = null;
      let attempts = 0;
      
      while (attempts < 15 && !nextEvent) {
        await new Promise(r => setTimeout(r, 2000));
        const currentEvents = await getNewEvents();
        
        // Buscamos el primer evento del agente que ocurra después de nuestro último índice gestionado
        // Importante: No usamos .reverse() aquí para procesar en orden cronológico si hay varios
        for (let i = 0; i < currentEvents.length; i++) {
          if (i > lastHandledEventIndex) {
            const e = currentEvents[i];
            if (e.type === 'agent.message' || e.type === 'agent.tool_use') {
              nextEvent = e;
              lastHandledEventIndex = i;
              break;
            }
          } else {
             // Actualizamos el índice máximo visto para no procesar eventos de usuario previos
             lastHandledEventIndex = Math.max(lastHandledEventIndex, i);
          }
        }
        attempts++;
      }

      if (!nextEvent) break;

      if (nextEvent.type === 'agent.message') {
        finalReply = nextEvent.text || (nextEvent.content && nextEvent.content[0].text);
      } else if (nextEvent.type === 'agent.tool_use') {
        const result = await resolveToolCall(nextEvent.tool_name, nextEvent.input);
        
        await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({
            events: [{
              type: 'tool_result',
              tool_use_id: nextEvent.id,
              content: [{ type: 'text', text: JSON.stringify(result) }]
            }]
          })
        });
      }
    }

    return {
      reply: finalReply || "Rora ha completado la tarea en segundo plano.",
      sessionId: activeSessionId
    };

  } catch (error) {
    console.error('Error Stability Loop:', error);
    throw error;
  }
}
