/**
 * Definición de Tools para Claude (GHL Super-Agent Matrix)
 * Optimizadas para Managed Agents - V2.7
 */

export const GHL_TOOLS = [
  // --- CALENDARS ---
  {
    name: "calendars_get-events",
    description: "Obtener eventos del calendario. Parámetros: calendarId, startTime, endTime.",
    input_schema: {
      type: "object",
      properties: { calendarId: { type: "string" }, startTime: { type: "string" }, endTime: { type: "string" } }
    }
  },
  {
    name: "calendars_get-appointment-notes",
    description: "Recuperar notas de una cita específica por ID.",
    input_schema: { type: "object", properties: { appointmentId: { type: "string" } }, required: ["appointmentId"] }
  },

  // --- CONTACTS ---
  {
    name: "contacts_get-tasks",
    description: "Obtiene todas las tareas asignadas a un contacto.",
    input_schema: { type: "object", properties: { contactId: { type: "string" } }, required: ["contactId"] }
  },
  {
    name: "contacts_add-tags",
    description: "Agrega etiquetas (tags) a un contacto.",
    input_schema: { 
      type: "object", 
      properties: { contactId: { type: "string" }, tags: { type: "array", items: { type: "string" } } },
      required: ["contactId", "tags"]
    }
  },
  {
    name: "contacts_remove-tags",
    description: "Elimina etiquetas de un contacto.",
    input_schema: { type: "object", properties: { contactId: { type: "string" }, tags: { type: "array", items: { type: "string" } } }, required: ["contactId", "tags"] }
  },
  {
    name: "contacts_get-contact",
    description: "Obtener perfil completo de un contacto por ID.",
    input_schema: { type: "object", properties: { contactId: { type: "string" } }, required: ["contactId"] }
  },
  {
    name: "contacts_update-contact",
    description: "Actualiza datos de un contacto existente.",
    input_schema: { type: "object", properties: { contactId: { type: "string" }, data: { type: "object" } }, required: ["contactId", "data"] }
  },
  {
    name: "contacts_upsert-contact",
    description: "Crea o actualiza un contacto basado en email/teléfono.",
    input_schema: { type: "object", properties: { data: { type: "object" } }, required: ["data"] }
  },
  {
    name: "contacts_create-contact",
    description: "Crea un nuevo contacto manualmente.",
    input_schema: { type: "object", properties: { data: { type: "object" } }, required: ["data"] }
  },
  {
    name: "contacts_get-contacts",
    description: "Lista contactos con filtros opcionales (query).",
    input_schema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } } }
  },

  // --- CONVERSATIONS ---
  {
    name: "conversations_search",
    description: "Buscar conversaciones por criterios (nombre, email).",
    input_schema: { type: "object", properties: { query: { type: "string" } } }
  },
  {
    name: "conversations_get-messages",
    description: "Obtiene los mensajes de una conversación específica.",
    input_schema: { type: "object", properties: { conversationId: { type: "string" } }, required: ["conversationId"] }
  },
  {
    name: "conversations_send-message",
    description: "Envía un nuevo mensaje (SMS/Email/WA) a un hilo.",
    input_schema: { 
      type: "object", 
      properties: { conversationId: { type: "string" }, message: { type: "string" }, type: { type: "string" } },
      required: ["conversationId", "message"]
    }
  },

  // --- LOCATIONS ---
  {
    name: "locations_get-details",
    description: "Obtiene detalles de la ubicación (subcuenta).",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "locations_get-custom-fields",
    description: "Lista las definiciones de campos personalizados.",
    input_schema: { type: "object", properties: {} }
  },

  // --- OPPORTUNITIES ---
  {
    name: "opportunities_search",
    description: "Buscar oportunidades en pipelines.",
    input_schema: { type: "object", properties: { query: { type: "string" } } }
  },
  {
    name: "opportunities_get-pipelines",
    description: "Lista todos los embudos (pipelines) disponibles.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "opportunities_get-one",
    description: "Obtiene una oportunidad específica por ID.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "opportunities_update",
    description: "Actualiza estado/valor de una oportunidad.",
    input_schema: { type: "object", properties: { id: { type: "string" }, data: { type: "object" } }, required: ["id", "data"] }
  },

  // --- SOCIAL MEDIA ---
  {
    name: "social_create-post",
    description: "Crea un post en redes sociales conectado.",
    input_schema: { type: "object", properties: { content: { type: "string" }, platform: { type: "string" } }, required: ["content"] }
  },
  {
    name: "social_get-post",
    description: "Detalles de un post específico.",
    input_schema: { type: "object", properties: { postId: { type: "string" } }, required: ["postId"] }
  },
  {
    name: "social_get-accounts",
    description: "Lista cuentas de redes sociales conectadas.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "social_get-stats",
    description: "Estadísticas de rendimiento de redes sociales.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "social_get-posts",
    description: "Lista posts recientes publicados.",
    input_schema: { type: "object", properties: {} }
  },

  // --- EMAILS ---
  {
    name: "emails_get-templates",
    description: "Lista plantillas de correo disponibles.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "emails_create-template",
    description: "Crea una nueva plantilla de correo.",
    input_schema: { type: "object", properties: { name: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["name", "subject", "body"] }
  }
];
