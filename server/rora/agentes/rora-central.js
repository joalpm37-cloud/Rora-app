import { llamarGemini } from '../utils/gemini-api.js';
import SYSTEM_PROMPT_RORA from '../prompts/system-prompt-rora.js';

export async function procesarMensajeRora(mensajeUsuario, historial = []) {
  try {
    console.log('🤖 RORA Orquestador (Prod-Gemini) procesando...');
    
    // 1. Llamada a Gemini 3 Flash
    const respuestaGemini = await llamarGemini(SYSTEM_PROMPT_RORA, mensajeUsuario, historial);
    
    if (!respuestaGemini) {
      throw new Error("Respuesta nula desde Gemini API.");
    }

    // 2. Extraer Acción y limpiar respuesta
    const accionMatch = respuestaGemini.match(/ACCION:\s*(.*)/i);
    const accion = accionMatch ? accionMatch[1].trim() : 'ninguna';
    
    // Filtro Anti-Asteriscos y limpieza de etiquetas
    const mensajeParaMostrar = respuestaGemini
        .replace(/ACCION:.*(\r?\n|$)/ig, '')
        .replace(/DATOS:.*(\r?\n|$)/ig, '')
        .replace(/\*/g, '') // Eliminación agresiva de asteriscos
        .trim();

    return {
      mensajeParaMostrar,
      accion,
      datos: ''
    };

  } catch (err) {
    console.error("❌ Error en RORA Central (Producción):", err);
    return {
      mensajeParaMostrar: 'Hola, soy RORA 👋 Estoy afinando mi orquesta tecnológica. ¿En qué puedo ayudarte?',
      accion: 'ninguna',
      datos: ''
    };
  }
}
