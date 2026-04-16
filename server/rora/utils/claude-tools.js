/**
 * Definición de Tools para Claude (GHL MCP)
 */

export const GHL_TOOLS = [
  {
    name: "crear_contacto",
    description: "Crea un nuevo contacto o lead en GoHighLevel con los datos proporcionados.",
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string", description: "Nombre completo del contacto" },
        email: { type: "string", description: "Email de contacto" },
        telefono: { type: "string", description: "Número de teléfono" },
        notes: { type: "string", description: "Notas adicionales sobre el lead" }
      },
      required: ["nombre"]
    }
  },
  {
    name: "buscar_contacto",
    description: "Busca un contacto existente en la base de datos de GHL.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Nombre, email o teléfono a buscar" }
      },
      required: ["query"]
    }
  },
  {
    name: "obtener_conversaciones",
    description: "Obtiene las conversaciones recientes de WhatsApp, Instagram y SMS desde GHL.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "obtener_calendario",
    description: "Obtiene los slots de tiempo disponibles en el calendario del Realtor.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "enviar_mensaje",
    description: "Envía un mensaje de texto a una conversación específica en GHL.",
    input_schema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "ID de la conversación de GHL" },
        mensaje: { type: "string", description: "Contenido del mensaje a enviar" }
      },
      required: ["conversationId", "mensaje"]
    }
  }
];
