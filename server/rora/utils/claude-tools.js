/**
 * Definición de Tools para Claude (GHL MCP)
 */

export const GHL_TOOLS = [
  {
    name: "crear_contacto",
    description: "Crea un lead en GHL con los datos provistos.",
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        email: { type: "string" },
        telefono: { type: "string" },
        notes: { type: "string" }
      },
      required: ["nombre"]
    }
  },
  {
    name: "buscar_contacto",
    description: "Busca contacto en GHL por nombre/datos.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Dato a buscar" }
      },
      required: ["query"]
    }
  },
  {
    name: "obtener_conversaciones",
    description: "Lista chats recientes de GHL.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "obtener_calendario",
    description: "Muestra disponibilidad del calendario Realtor.",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "enviar_mensaje",
    description: "Envía texto a un chat de GHL.",
    input_schema: {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        mensaje: { type: "string" },
      },
      required: ["conversationId", "mensaje"]
    }
  }
];
