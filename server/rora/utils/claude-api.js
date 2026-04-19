import { GHL_TOOLS } from './claude-tools.js';
import * as ghl from './ghl-api.js';

const getEnv = (name) => {
  const valley = process.env[name] || process.env[`VITE_${name}`];
  if (!valley && name !== 'ANTHROPIC_API_KEY' && name !== 'VITE_CLAUDE_API_KEY') {
    console.warn(`⚠️ Warning: Environment variable ${name} is NOT set.`);
  }
  return valley;
};

/**
 * MOTOR CORE V2.10.2: Ultra-Stable Native Sync
 * Eliminamos TODAS las dependencias de betas y modelos experimentales.
 * Usamos el estándar de oro de Anthropic para garantizar que tus créditos funcionen.
 */
export async function llamarAgenteManaged(mensajeUsuario, sessionId = null, systemPrompt = null, historial = [], tools = null, isAutomated = false) {
  console.log(`📡 [V2.10.2] Rora ${isAutomated ? 'Auto' : 'Sync'}: "${mensajeUsuario}"`);
  
  try {
    // Si es automatizado (Webhook), forzamos Haiku para ahorrar créditos.
    // Si no, usamos el modelo de la variable de entorno o Haiku como fallback.
    const modelToUse = isAutomated 
      ? 'claude-haiku-4-5-20251001' 
      : (getEnv('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001');

    const requestBody = {
      model: modelToUse,
      max_tokens: 1536,
      system: [
        {
          type: "text",
          text: systemPrompt || `Eres RORA, Directora de Orquesta de la plataforma inmobiliaria RORA.
      Tu misión es orquestar herramientas de GoHighLevel (GHL) para ayudar al usuario. 
      Usa las herramientas disponibles para obtener datos antes de responder.
      Hoy es ${new Date().toLocaleDateString()}.`,
          cache_control: { type: "ephemeral" }
        }
      ],
      tools: tools || GHL_TOOLS,
      messages: [
        ...(historial || []),
        ...(mensajeUsuario ? [{ role: 'user', content: mensajeUsuario }] : [])
      ]
    };

    let finalResponse = null;
    let turns = 0;
    const MAX_TURNS = 6;

    while (!finalResponse && turns < MAX_TURNS) {
      turns++;
      console.log(`⏳ Orquestando paso ${turns}...`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': getEnv('ANTHROPIC_API_KEY') || getEnv('VITE_CLAUDE_API_KEY'),
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
          'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Error de API (${response.status}): ${JSON.stringify(data)}`);
      }

      const messageContent = data.content;
      const textBlock = messageContent.find(c => c.type === 'text');
      const toolCalls = messageContent.filter(c => c.type === 'tool_use');

      if (toolCalls.length > 0) {
        requestBody.messages.push({ role: 'assistant', content: messageContent });
        
        const toolResults = await Promise.all(toolCalls.map(async (tc) => {
          console.log(`🛠️ Executando Tool: ${tc.name}`, tc.input);
          try {
            const result = await ghl.executeGHLAction(tc.name, tc.input);
            console.log(`✅ Resultado Tool [${tc.name}]:`, JSON.stringify(result).substring(0, 100) + '...');
            return {
              type: 'tool_result',
              tool_use_id: tc.id,
              content: JSON.stringify(result)
            };
          } catch (toolError) {
            console.error(`❌ Error en Tool [${tc.name}]:`, toolError.message);
            return {
              type: 'tool_result',
              tool_use_id: tc.id,
              content: JSON.stringify({ error: toolError.message, status: 'failed' }),
              is_error: true
            };
          }
        }));

        requestBody.messages.push({ role: 'user', content: toolResults });
      } else {
        finalResponse = textBlock?.text || "Proceso completado.";
      }
    }

    return {
      reply: finalResponse,
      sessionId: sessionId || `v2102_${Date.now()}`
    };

  } catch (error) {
    console.error('❌ Error en Motor Vanilla:', error.message);
    throw error;
  }
}

// Compatibilidad con versiones previas
export const llamarRoraPrime = (u, h, s) => llamarAgenteManaged(u, s);
export const llamarClaude = (sys, u, h, t, isAutomated) => llamarAgenteManaged(u, null, sys, h, t, isAutomated);
export const crearAgenteManaged = (n, s, t) => { return { id: "VANILLA_STABLE_V2.10.2" }; };
