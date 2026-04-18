/**
 * GoHighLevel (GHL) API Utility (V2 Super-Agent Hub)
 */

const getEnv = (name) => {
  return process.env[name] || process.env[`VITE_${name}`];
};

const PIT_TOKEN = getEnv('GHL_PIT_TOKEN');
const LOCATION_ID = getEnv('GHL_LOCATION_ID');

/**
 * MOTOR MCP CLOUD: Ejecuta herramientas vía LeadConnector MCP Hub
 */
async function callGHLMCP(toolName, toolArgs) {
  try {
    if (!PIT_TOKEN || !LOCATION_ID) {
      throw new Error(`GHL Config MISSING on Render.`);
    }

    const response = await fetch('https://services.leadconnectorhq.com/mcp/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'locationId': LOCATION_ID,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: toolArgs
        }
      })
    });

    const text = await response.text();
    
    // GHL MCP Hub devuelve eventos SSE. 
    // Buscamos todas las líneas que empiezan con "data:"
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('data:')) {
        const jsonStr = line.replace('data:', '').trim();
        if (!jsonStr) continue;

        try {
          const parsedChunk = JSON.parse(jsonStr);
          // Si el chunk tiene el resultado directo, lo extraemos y retornamos
          if (parsedChunk.result && parsedChunk.result.content && parsedChunk.result.content[0]) {
             const content = parsedChunk.result.content[0];
             if (content.text) {
               try {
                 return JSON.parse(content.text);
               } catch(e) {
                 return content.text;
               }
             }
             return content;
          }
          // Si es un error del JSON-RPC
          if (parsedChunk.error) {
            throw new Error(`JSON-RPC Error: ${JSON.stringify(parsedChunk.error)}`);
          }
        } catch (e) {
          if (e.message.includes('JSON-RPC Error')) throw e;
          console.warn("Retrying chunk parse or skip:", e.message);
        }
      }
    }

    if (!response.ok) {
        throw new Error(`GHL MCP Error ${response.status}: ${text.substring(0, 100)}`);
    }

    // Fallback: si no es SSE o falló el split, intentamos parseo directo
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  } catch (error) {
    console.error(`❌ MCP [${toolName}] Failure:`, error.message);
    throw error;
  }
}

// DISPATCHER: Mapea las llamadas del agente al Hub MCP
export async function executeGHLAction(action, args) {
  console.log(`📡 Dispatching MCP Action: ${action}`);
  
  // Mapeo directo de nombres (Standardización)
  let mcpToolName = action;
  
  // Ajustes de compatibilidad de nombres si es necesario
  if (action === 'contacts_get-contacts') mcpToolName = 'contacts_get-contacts';
  if (action === 'contacts_get-contact') mcpToolName = 'contacts_get-contact';
  
  return await callGHLMCP(mcpToolName, args);
}

// Mantener exportaciones antiguas para compatibilidad
export const crearContactoGHL = (d) => executeGHLAction('contacts_create-contact', { data: d });
export const buscarContactoGHL = (q) => executeGHLAction('contacts_get-contacts', { query: q });
export const buscarConversacionesGHL = () => executeGHLAction('conversations_search', {});
export const obtenerSlotsCalendario = () => callGHL(`/calendars/slots`);
export const enviarMensajeGHL = (cid, m) => executeGHLAction('conversations_send-message', { conversationId: cid, message: m });
