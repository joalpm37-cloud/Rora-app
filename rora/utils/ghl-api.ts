// Utilidad: Llamadas a la API de GoHighLevel (GHL) usando MCP

const getEnv = (name) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  return process.env[name];
};

/**
 * Ejecuta una herramienta del servidor MCP de GoHighLevel.
 * @param {string} name - El nombre de la herramienta (ej. "contacts_create-contact")
 * @param {object} args - Los argumentos que requiere la herramienta
 * @returns {object|null} - Respuesta procesada o null si falla
 */
export async function ejecutarHerramientaMCP(name, args) {
  try {
    const response = await fetch('https://services.leadconnectorhq.com/mcp/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getEnv('VITE_GHL_PIT_TOKEN')}`,
        'locationId': getEnv('VITE_GHL_LOCATION_ID'),
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(), // ID consecutivo
        method: "tools/call",
        params: {
          name: name,
          arguments: args
        }
      })
    });

    if (!response.ok) {
      console.error(`Error en API GHL MCP (${name}): ${response.status}`);
      return null;
    }

    const responseText = await response.text();
    let resData;
    try {
      const match = responseText.match(/data:\s*({.*})/);
      if (match) {
         const parsedSse = JSON.parse(match[1].trim());
         if (parsedSse.result && parsedSse.result.content && parsedSse.result.content[0] && parsedSse.result.content[0].text) {
             resData = JSON.parse(parsedSse.result.content[0].text);
             resData.mcpWrapper = parsedSse;
         } else {
             resData = parsedSse;
         }
      } else {
         resData = JSON.parse(responseText);
      }
    } catch(e) {
      console.error("No se pudo parsear el JSON de MCP.");
      console.log('--- RESTR: ', responseText);
      return null;
    }
    
    return resData;
  } catch (error) {
    console.error(`Error al intentar ejecutar la herramienta GHL MCP (${name}):`, error);
    return null;
  }
}

/**
 * Función heredada y refactorizada para crear contactos mediante MCP.
 */
export async function crearContactoGHL(datos) {
  // Paso 1: Buscar contacto existente por email o teléfono
  const paramBusqueda = datos.email || datos.telefono;
  if (paramBusqueda) {
    const contactoExistente = await buscarContactoGHL(paramBusqueda);
    if (contactoExistente) {
      // Paso 2: Si existe, devolvemos existia: true
      return { existia: true, contacto: contactoExistente };
    }
  }

  // Paso 3: Si no existe, creamos
  const args = {
    firstName: datos.nombre || "Contacto RORA",
    phone: datos.telefono || "",
  };

  if (datos.email) {
    args.email = datos.email;
  }

  const resultado = await ejecutarHerramientaMCP("contacts_create-contact", args);

  let idNuevo = null;
  if (resultado && resultado.data && resultado.data.contact) {
    idNuevo = resultado.data.contact.id;
  } else if (resultado && resultado.status === 400 && resultado.data && resultado.data.message && resultado.data.message.includes('duplicated') && resultado.data.meta && resultado.data.meta.contactId) {
    // Si GHL lanza error 400 de duplicado (ej. diferente formato de número), lo atrapamos como existia
    return { existia: true, contacto: { id: resultado.data.meta.contactId } };
  } else if (resultado && resultado.contact) {
    idNuevo = resultado.contact.id;
  } else if (resultado && resultado.success) {
    idNuevo = "id-creado-exitosamente";
  }

  return { existia: false, contacto: idNuevo ? { id: idNuevo, ...datos } : resultado };
}

export async function buscarContactoGHL(query) {
  const args = { query };
  const resultado = await ejecutarHerramientaMCP("contacts_get-contacts", args);
  
  if (resultado && resultado.data && resultado.data.contacts && resultado.data.contacts.length > 0) {
      return resultado.data.contacts[0];
  }
  return null;
}

export async function obtenerContactosGHL(limit = 100) {
  const args = { limit };
  const resultado = await ejecutarHerramientaMCP("contacts_get-contacts", args);
  if (resultado && resultado.data && resultado.data.contacts) {
    return resultado.data.contacts;
  }
  return [];
}

export async function buscarConversacionesGHL() {
  const args = { }; // Traer conversaciones recientes
  const resultado = await ejecutarHerramientaMCP("conversations_search-conversation", args);
  
  if (resultado && resultado.data && resultado.data.conversations) {
      return resultado.data.conversations;
  }
  return [];
}

export async function obtenerMensajesGHL(conversationId) {
  const args = { conversationId, limit: 20 };
  const resultado = await ejecutarHerramientaMCP("conversations_get-messages", args);
  
  if (resultado && resultado.data && resultado.data.messages) {
      // Mapear al formato esperado por la UI central
      return resultado.data.messages.map(m => ({
          id: m.id,
          text: m.body || "",
          sender: m.direction === 'inbound' ? 'lead' : 'agent',
          timestamp: new Date(m.dateAdded)
      })).reverse(); // Orden cronológico (más viejo a más reciente)
  }
  return [];
}

export async function obtenerSlotsCalendario() {
  const now = new Date();
  const args = { 
     calendarId: getEnv('VITE_GHL_CALENDAR_ID'),
     startTime: now.getTime().toString(),
     endTime: (now.getTime() + 30 * 24 * 60 * 60 * 1000).toString()
  };
   const resultado = await ejecutarHerramientaMCP("calendars_get-calendar-events", args);
  
  if (resultado && resultado.data && resultado.data.events) {
      return resultado.data.events;
  }
  return [];
}

/**
 * SOCIAL MEDIA MCP METHODS FOR CONTENT AGENT
 */
export async function obtenerCuentasSocialGHL() {
  const resultado = await ejecutarHerramientaMCP("social-media-posting_get-account", {
    locationId: getEnv('VITE_GHL_LOCATION_ID')
  });

  if (resultado && resultado.data && resultado.data.accounts) {
      return resultado.data.accounts;
  }
  return resultado;
}

export async function programarPublicacionGHL(datos) {
  const args = {
    locationId: getEnv('VITE_GHL_LOCATION_ID'),
    accountIds: datos.accountIds || [],
    type: "post",
    status: datos.scheduledAt ? "scheduled" : "published",
    summary: datos.text || "",
    media: (datos.mediaUrls || []).map(url => ({ fileUrl: url }))
  };

  if (datos.scheduledAt) {
    args.scheduleDate = datos.scheduledAt;
  }

  const resultado = await ejecutarHerramientaMCP("social-media-posting_create-post", args);
  return resultado;
}

export async function enviarMensajeGHL(conversationId, mensaje) {
  const args = {
      conversationId: conversationId,
      message: mensaje,
      type: "SMS" // Por defecto SMS si no se especifica
  };
  
  const resultado = await ejecutarHerramientaMCP("conversations_send-a-new-message", args);
  return resultado;
}

export async function crearCitaGHL(datos) {
  // datos: { calendarId, contactId, startTime, title, ... }
  const args = {
      calendarId: datos.calendarId || getEnv('VITE_GHL_CALENDAR_ID'),
      locationId: getEnv('VITE_GHL_LOCATION_ID'),
      contactId: datos.contactId,
      startTime: datos.startTime,
      title: datos.title || "Visita RORA"
  };

  const resultado = await ejecutarHerramientaMCP("calendars_create-appointment", args);
  return resultado;
}
