import { llamarClaude } from '../utils/claude-api';
import SYSTEM_PROMPT_RORA from '../prompts/system-prompt-rora';
import { GHL_TOOLS } from '../utils/claude-tools';
import { 
  crearContactoGHL, 
  buscarContactoGHL, 
  buscarConversacionesGHL, 
  obtenerSlotsCalendario, 
  enviarMensajeGHL 
} from '../utils/ghl-api';

export async function procesarMensajeRora(mensajeUsuario, historial = []) {
  try {
    // 1. Delegación total al backend de Render (Ohio)
    // llamarClaude ya está redirigido a https://rora-app.onrender.com/api/rora/chat
    const respuestaRora = await llamarClaude(SYSTEM_PROMPT_RORA, mensajeUsuario, historial, GHL_TOOLS);
    
    // El backend devuelve el texto final procesado o un mensaje de error detallado
    if (typeof respuestaRora === 'string') {
        const accionMatch = respuestaRora.match(/ACCION:\s*(.*)/i);
        const accion = accionMatch ? accionMatch[1].trim() : 'ninguna';
        const mensajeParaMostrar = respuestaRora.replace(/ACCION:.*(\r?\n|$)/ig, '').replace(/DATOS:.*(\r?\n|$)/ig, '').trim();
        
        return { 
          mensajeParaMostrar, 
          accion, 
          datos: '' 
        };
    }

    // Si por alguna razón devuelve un objeto (legacy), intentamos extraer el texto
    const textBlock = respuestaRora?.content?.find(block => block.type === 'text');
    return {
      mensajeParaMostrar: textBlock ? textBlock.text : (respuestaRora?.reply || 'RORA procesó tu mensaje correctamente.'),
      accion: 'ninguna',
      datos: ''
    };

  } catch (err) {
    console.error("Error en RORA Central:", err);
    return {
      mensajeParaMostrar: `Error de conexión: ${err.message}. Por favor, asegúrate de estar conectado y refresca la página.`,
      accion: 'ninguna',
      datos: ''
    };
  }
}
