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
      throw new Error(`Configuración GHL incompleta en Render (GHL_PIT_TOKEN o GHL_LOCATION_ID no detectados).`);
    }

    const response = await fetch('https://services.leadconnectorhq.com/mcp/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'locationId': LOCATION_ID,
        'Content-Type': 'application/json'
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
    let data;

    try {
      // El endpoint de MCP de GHL a veces devuelve SSE (data: {...})
      const match = text.match(/data:\s*({.*})/);
      if (match) {
        data = JSON.parse(match[1].trim());
      } else {
        data = JSON.parse(text);
      }
    } catch (e) {
      throw new Error(`Fallo al procesar respuesta MCP: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
        throw new Error(`GHL MCP Error ${response.status}: ${JSON.stringify(data)}`);
    }

    // Extraer el contenido útil del envoltorio JSON-RPC / MCP
    if (data.result && data.result.content && data.result.content[0]) {
        const content = data.result.content[0];
        if (content.text) {
            try {
                return JSON.parse(content.text);
            } catch (e) {
                return content.text; // Es texto libre, no JSON
            }
        }
        return content;
    }

    return data;
  } catch (error) {
    console.error(`❌ Fallo en MCP [${toolName}]:`, error.message);
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
