/**
 * GoHighLevel (GHL) API Utility (V2 Super-Agent Hub)
 */

const getEnv = (name) => {
  return process.env[name] || process.env[`VITE_${name}`];
};

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const PIT_TOKEN = getEnv('GHL_PIT_TOKEN');
const LOCATION_ID = getEnv('GHL_LOCATION_ID');

// Helper genérico para llamadas a GHL
async function callGHL(endpoint, method = 'GET', body = null) {
  try {
    const url = new URL(`${GHL_API_BASE}${endpoint}`);
    // Siempre inyectamos el locationId si no está presente en la query
    if (!url.searchParams.has('locationId') && endpoint.includes('?')) {
        url.searchParams.append('locationId', LOCATION_ID);
    } else if (!endpoint.includes('?')) {
        url.href += `?locationId=${LOCATION_ID}`;
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url.href, options);
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`GHL Error ${response.status}: ${errText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Fallo en GHL [${method} ${endpoint}]:`, error.message);
    throw error;
  }
}

// DISPATCHER: Resuelve cualquier acción de la lista de 26 herramientas
export async function executeGHLAction(action, args) {
  switch (action) {
    // --- Calendars ---
    case 'calendars_get-events':
      return await callGHL(`/calendars/events?calendarId=${args.calendarId || ''}&startTime=${args.startTime || ''}&endTime=${args.endTime || ''}`);
    case 'calendars_get-appointment-notes':
      return await callGHL(`/calendars/appointments/${args.appointmentId}/notes`);

    // --- Contacts ---
    case 'contacts_get-tasks':
      return await callGHL(`/contacts/${args.contactId}/tasks`);
    case 'contacts_add-tags':
      return await callGHL(`/contacts/${args.contactId}/tags`, 'POST', { tags: args.tags });
    case 'contacts_remove-tags':
      return await callGHL(`/contacts/${args.contactId}/tags`, 'DELETE', { tags: args.tags });
    case 'contacts_get-contact':
      return await callGHL(`/contacts/${args.contactId}`);
    case 'contacts_update-contact':
      return await callGHL(`/contacts/${args.contactId}`, 'PUT', args.data);
    case 'contacts_upsert-contact':
      return await callGHL(`/contacts/upsert`, 'POST', { ...args.data, locationId: LOCATION_ID });
    case 'contacts_create-contact':
      return await callGHL(`/contacts/`, 'POST', { ...args.data, locationId: LOCATION_ID });
    case 'contacts_get-contacts':
      return await callGHL(`/contacts/?query=${args.query || ''}`);

    // --- Conversations ---
    case 'conversations_search':
      return await callGHL(`/conversations/search?query=${args.query || ''}`);
    case 'conversations_get-messages':
      return await callGHL(`/conversations/${args.conversationId}/messages`);
    case 'conversations_send-message':
      return await callGHL(`/conversations/messages`, 'POST', { 
          type: args.type || 'SMS', 
          message: args.message, 
          conversationId: args.conversationId 
      });

    // --- Locations ---
    case 'locations_get-details':
      return await callGHL(`/locations/${LOCATION_ID}`);
    case 'locations_get-custom-fields':
      return await callGHL(`/locations/${LOCATION_ID}/custom-fields`);

    // --- Opportunities ---
    case 'opportunities_search':
      return await callGHL(`/opportunities/search?query=${args.query || ''}`);
    case 'opportunities_get-pipelines':
      return await callGHL(`/opportunities/pipelines`);
    case 'opportunities_get-one':
      return await callGHL(`/opportunities/${args.id}`);
    case 'opportunities_update':
      return await callGHL(`/opportunities/${args.id}`, 'PUT', args.data);

    // --- Social & Emails (Mapeos Simplificados) ---
    case 'social_create-post':
      return await callGHL(`/social-media-posting/posts`, 'POST', args);
    case 'social_get-post':
      return await callGHL(`/social-media-posting/posts/${args.postId}`);
    case 'social_get-accounts':
      return await callGHL(`/social-media-posting/accounts`);
    case 'social_get-stats':
      return await callGHL(`/social-media-posting/stats`);
    case 'social_get-posts':
      return await callGHL(`/social-media-posting/posts`);
    case 'emails_get-templates':
      return await callGHL(`/emails/templates`);
    case 'emails_create-template':
      return await callGHL(`/emails/templates`, 'POST', args);

    default:
      throw new Error(`Acción ${action} no soportada en el Dispatcher.`);
  }
}

// Mantener exportaciones antiguas para compatibilidad
export const crearContactoGHL = (d) => executeGHLAction('contacts_create-contact', { data: d });
export const buscarContactoGHL = (q) => executeGHLAction('contacts_get-contacts', { query: q });
export const buscarConversacionesGHL = () => executeGHLAction('conversations_search', {});
export const obtenerSlotsCalendario = () => callGHL(`/calendars/slots`);
export const enviarMensajeGHL = (cid, m) => executeGHLAction('conversations_send-message', { conversationId: cid, message: m });
