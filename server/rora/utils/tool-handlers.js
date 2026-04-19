import * as ghl from './ghl-api.js';

/**
 * Manejador centralizado de herramientas MCP para GoHighLevel (Producción).
 */
export async function executeGhlTool(name, args) {
    console.log(`🛠️ Ejecutando herramienta GHL (Prod): ${name}`, args);

    switch (name) {
        case 'crear_contacto':
            return await ghl.crearContactoGHL(args);

        case 'buscar_contacto':
            return await ghl.buscarContactoGHL(args.query);

        case 'obtener_conversaciones':
            return await ghl.obtenerMensajesGHL(args.contactId);

        case 'obtener_calendario':
            return await ghl.obtenerSlotsCalendario();

        case 'enviar_mensaje':
            return await ghl.enviarMensajeGHL(args.conversationId, args.mensaje);

        default:
            console.warn(`⚠️ Herramienta no reconocida: ${name}`);
            return { error: `Herramienta ${name} no implementada.` };
    }
}
