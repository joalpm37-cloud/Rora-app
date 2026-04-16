/**
 * GoHighLevel (GHL) API Utility (Backend version)
 */

const getEnv = (name) => {
  return process.env[name] || process.env[`VITE_${name}`];
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const PIT_TOKEN = getEnv('GHL_PIT_TOKEN');
const LOCATION_ID = getEnv('GHL_LOCATION_ID');

export async function crearContactoGHL(datos) {
  try {
    const response = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: datos.nombre,
        email: datos.email,
        phone: datos.telefono,
        locationId: LOCATION_ID,
        customFields: datos.customFields || []
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en crearContactoGHL:", error);
    throw error;
  }
}

export async function buscarContactoGHL(query) {
  try {
    const response = await fetch(`${GHL_API_BASE}/contacts/search?locationId=${LOCATION_ID}&query=${query}`, {
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28'
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error en buscarContactoGHL:", error);
    throw error;
  }
}

export async function buscarConversacionesGHL() {
  try {
    const response = await fetch(`${GHL_API_BASE}/conversations/search?locationId=${LOCATION_ID}`, {
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28'
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error en buscarConversacionesGHL:", error);
    throw error;
  }
}

export async function obtenerSlotsCalendario() {
  try {
    const calendarId = getEnv('GHL_CALENDAR_ID');
    const response = await fetch(`${GHL_API_BASE}/calendars/${calendarId}/slots`, {
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28'
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error en obtenerSlotsCalendario:", error);
    throw error;
  }
}

export async function enviarMensajeGHL(conversationId, mensaje) {
  try {
    const response = await fetch(`${GHL_API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'SMS', // O 'Email' o 'WhatsApp'
        message: mensaje
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en enviarMensajeGHL:", error);
    throw error;
  }
}
