import { llamarClaude } from '../utils/claude-api.js';
import SYSTEM_PROMPT_RORA from '../prompts/system-prompt-rora.js';
import { GHL_TOOLS } from '../utils/claude-tools.js';
import { 
  crearContactoGHL, 
  buscarContactoGHL, 
  buscarConversacionesGHL, 
  obtenerSlotsCalendario, 
  enviarMensajeGHL 
} from '../utils/ghl-api.js';

export async function procesarMensajeRora(mensajeUsuario, historial = []) {
  try {
    // 1. Llamada inicial a Claude con tools
    const respuestaClaude = await llamarClaude(SYSTEM_PROMPT_RORA, mensajeUsuario, historial, GHL_TOOLS);
    
    if (typeof respuestaClaude === 'string') {
        const accionMatch = respuestaClaude.match(/ACCION:\s*(.*)/i);
        const accion = accionMatch ? accionMatch[1].trim() : 'ninguna';
        // Filtro Anti-Asteriscos
        const mensajeParaMostrar = respuestaClaude
            .replace(/ACCION:.*(\r?\n|$)/ig, '')
            .replace(/DATOS:.*(\r?\n|$)/ig, '')
            .replace(/\*\*/g, '')
            .replace(/__/g, '')
            .replace(/#{1,6}\s?/g, '')
            .trim();
        return { mensajeParaMostrar, accion, datos: '' };
    }

    if (!respuestaClaude || !respuestaClaude.content) {
      return {
        mensajeParaMostrar: 'RORA no está disponible en este momento. Intenta de nuevo.',
        accion: 'ninguna',
        datos: ''
      };
    }

    // 2. Revisar si Claude quiere usar una herramienta
    let toolUseBlock = respuestaClaude.content.find(block => block.type === 'tool_use');
    
    if (toolUseBlock) {
      let toolResult = null;
      let accionEjecutada = 'tool_call';
      
      // Ejecutar la herramienta correspondiente
      switch(toolUseBlock.name) {
        case 'crear_contacto':
          toolResult = await crearContactoGHL(toolUseBlock.input);
          accionEjecutada = 'lead';
          break;
        case 'buscar_contacto':
          toolResult = await buscarContactoGHL(toolUseBlock.input.query);
          break;
        case 'obtener_conversaciones':
          toolResult = await buscarConversacionesGHL();
          break;
        case 'obtener_calendario':
          toolResult = await obtenerSlotsCalendario();
          break;
        case 'enviar_mensaje':
          toolResult = await enviarMensajeGHL(toolUseBlock.input.conversationId, toolUseBlock.input.mensaje);
          accionEjecutada = 'mensaje_enviado';
          break;
      }

      // 3. Devolver resultado a Claude para resolución final
      const newMessages = [
        ...historial,
        { role: 'user', content: mensajeUsuario },
        { role: 'assistant', content: respuestaClaude.content },
        { 
          role: 'user', 
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: JSON.stringify(toolResult)
            }
          ]
        }
      ];

      // Segunda llamada sin herramientas para que devuelva texto final
      const respuestaFinal = await llamarClaude(SYSTEM_PROMPT_RORA, null, newMessages);
      
      if (typeof respuestaFinal === 'string') {
        const accionMatch = respuestaFinal.match(/ACCION:\s*(.*)/i);
        const accion = accionMatch ? accionMatch[1].trim() : accionEjecutada;
        // Filtro Anti-Asteriscos
        const mensajeParaMostrar = respuestaFinal
            .replace(/ACCION:.*(\r?\n|$)/ig, '')
            .replace(/DATOS:.*(\r?\n|$)/ig, '')
            .replace(/\*\*/g, '')
            .replace(/__/g, '')
            .replace(/#{1,6}\s?/g, '')
            .trim();
        return { mensajeParaMostrar, accion, datos: '' };
      }
    }

    // Si no usó herramienta, o es texto directo
    const textBlock = respuestaClaude.content.find(block => block.type === 'text');
    const responseText = textBlock ? textBlock.text : "Procesado sin respuesta.";
    
    const accionMatch = responseText.match(/ACCION:\s*(.*)/i);
    const accion = accionMatch ? accionMatch[1].trim() : 'ninguna';
    // Filtro Anti-Asteriscos
    const mensajeParaMostrar = responseText
        .replace(/ACCION:.*(\r?\n|$)/ig, '')
        .replace(/DATOS:.*(\r?\n|$)/ig, '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/#{1,6}\s?/g, '')
        .trim();

    return {
      mensajeParaMostrar,
      accion,
      datos: ''
    };

  } catch (err) {
    console.error("Error en RORA Central:", err);
    return {
      mensajeParaMostrar: 'Hola, soy RORA 👋 Tu agente principal en modo configuración local.',
      accion: 'ninguna',
      datos: ''
    };
  }
}
