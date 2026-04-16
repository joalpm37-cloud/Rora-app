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

// NUEVA FUNCIÓN: Llamar a un Managed Agent con Tool Loop Autónomo
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
      console.log('🌐 Inicializando sesión con herramientas activas...');
      const sessionResponse = await fetch('https://api.anthropic.com/v1/sessions', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({ 
          agent: agentId,
          environment_id: environmentId,
          tools: GHL_TOOLS, // Pasamos los esquemas de herramientas aquí
          metadata: { context: 'RORA_ACTIVE_ORCHESTRATOR' }
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

    // 2. Enviar Mensaje Inicial
    const eventBody = {
      events: [{
        type: 'user.message',
        content: [{ type: 'text', text: mensajeUsuario, cache_control: { type: "ephemeral" } }]
      }]
    };
    
    const initialSend = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(eventBody)
    });

    if (!initialSend.ok) {
      if (initialSend.status === 404 && sessionId) return llamarAgenteManaged(agentId, mensajeUsuario, environmentId, null);
      throw new Error(`Fallo al enviar mensaje: ${initialSend.status}`);
    }

    // 3. BUCLE DE EVENTOS (Tool execution Loop)
    let finalReply = null;
    let turnCount = 0;
    const MAX_TURNS = 5;

    while (!finalReply && turnCount < MAX_TURNS) {
      turnCount++;
      console.log(`⏳ Bucle de orquestación (Turno ${turnCount})...`);
      
      // Esperar eventos (Polling)
      const pollResponse = await (async () => {
        let attempts = 0;
        while (attempts < 10) {
          await new Promise(r => setTimeout(r, 2000));
          const res = await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
            method: 'GET',
            headers: commonHeaders
          });
          const pollData = await res.json();
          const events = pollData.data || pollData;
          
          if (Array.isArray(events)) {
            // Buscamos el último evento relevante del agente
            const lastAgentEvent = events.reverse().find(e => e.type === 'agent.message' || e.type === 'agent.tool_use');
            if (lastAgentEvent) return lastAgentEvent;
          }
          attempts++;
        }
        return null;
      })();

      if (!pollResponse) throw new Error('Timeout esperando eventos del agente.');

      // Caso A: El agente quiere hablar
      if (pollResponse.type === 'agent.message') {
        finalReply = pollResponse.text || (pollResponse.content && pollResponse.content[0].text);
        console.log('✅ Rora ha respondido.');
      } 
      // Caso B: El agente quiere actuar (TOOL USE)
      else if (pollResponse.type === 'agent.tool_use') {
        const toolResult = await resolveToolCall(pollResponse.tool_name, pollResponse.input);
        
        // Enviar el resultado de la herramienta de vuelta a la sesión
        console.log('📡 Enviando resultado de herramienta a Rora...');
        await fetch(`https://api.anthropic.com/v1/sessions/${activeSessionId}/events`, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({
            events: [{
              type: 'tool_result',
              tool_use_id: pollResponse.id,
              content: [{ type: 'text', text: JSON.stringify(toolResult) }]
            }]
          })
        });
        // El bucle continuará para obtener la siguiente respuesta del agente
      }
    }

    return {
      reply: finalReply || "Rora está procesando el resultado. Por favor espera un momento.",
      sessionId: activeSessionId
    };

  } catch (error) {
    console.error('Error en llamarAgenteManaged (Active Loop):', error);
    throw error;
  }
}
