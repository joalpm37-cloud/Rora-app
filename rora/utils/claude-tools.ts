// Definición de herramientas para Tool Calling nativo de Claude

export const GHL_TOOLS = [
  {
    name: "crear_contacto",
    description: "Crea un contacto nuevo en GoHighLevel con los datos proporcionados.",
    input_schema: {
      type: "object",
      properties: {
        nombre: {
          type: "string",
          description: "Nombre completo del contacto"
        },
        telefono: {
          type: "string",
          description: "Teléfono del contacto"
        },
        email: {
          type: "string",
          description: "Correo electrónico del contacto"
        },
        notas: {
          type: "string",
          description: "Notas adicionales sobre el lead"
        }
      },
      required: ["nombre"]
    }
  },
  {
    name: "buscar_contacto",
    description: "Busca si un contacto ya existe en el sistema usando nombre, email o teléfono.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Parámetro de búsqueda (email o teléfono)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "obtener_conversaciones",
    description: "Trae el historial de mensajes de un contacto a través de GoHighLevel.",
    input_schema: {
      type: "object",
      properties: {
        contactId: {
          type: "string",
          description: "ID del contacto a buscar conversaciones"
        }
      },
      required: ["contactId"]
    }
  },
  {
    name: "obtener_calendario",
    description: "Trae los próximos eventos del calendario (reuniones, visitas) desde GoHighLevel.",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "enviar_mensaje",
    description: "Envía un mensaje a una conversación activa vía GoHighLevel.",
    input_schema: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
          description: "ID de la conversación en GoHighLevel"
        },
        mensaje: {
          type: "string",
          description: "El texto del mensaje a enviar"
        }
      },
      required: ["conversationId", "mensaje"]
    }
  }
];
