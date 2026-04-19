import { llamarGemini } from '../utils/gemini-api.js';
import SYSTEM_PROMPT_RORA from '../prompts/system-prompt-rora.js';
import { GHL_TOOLS } from '../utils/claude-tools.js';

export async function procesarMensajeRora(mensajeUsuario, historial = []) {
  try {
    // Migración a Gemini 2.0 Flash Local
    const respuestaRora = await llamarGemini(SYSTEM_PROMPT_RORA, mensajeUsuario, historial, GHL_TOOLS);
    
    if (typeof respuestaRora === 'string') {
        const accionMatch = respuestaRora.match(/ACCION:\s*(.*)/i);
        const accion = accionMatch ? accionMatch[1].trim() : 'ninguna';
        const mensajeParaMostrar = respuestaRora
          .replace(/ACCION:.*(\r?\n|$)/ig, '')
          .replace(/DATOS:.*(\r?\n|$)/ig, '')
          .trim();
        
        return { 
          mensajeParaMostrar, 
          accion, 
          datos: '' 
        };
    }

    return {
      mensajeParaMostrar: respuestaRora || 'RORA procesó tu mensaje correctamente.',
      accion: 'ninguna',
      datos: ''
    };

  } catch (err) {
    console.error("Error en RORA Central con Gemini:", err.message);
    return {
      mensajeParaMostrar: `Error de conexión con Gemini: ${err.message}.`,
      accion: 'ninguna',
      datos: ''
    };
  }
}
