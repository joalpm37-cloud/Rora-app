import { llamarClaude } from '../utils/claude-api.js';
import SYSTEM_PROMPT_SALES from '../prompts/system-prompt-sales.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

export async function procesarMensajeSalesAgent({ contactId, nombre, canal, mensaje, historial = [] }) {
  try {
    const contextoConstruido = `Canal: ${canal || "desconocido"}. Nombre del lead: ${nombre || "Prospecto"}.\nMensaje del lead: ${mensaje}`;
    
    const respuestaClaude = await llamarClaude(SYSTEM_PROMPT_SALES, contextoConstruido, historial);
    
    if (!respuestaClaude) {
      throw new Error("Respuesta nula desde Claude API.");
    }

    const clasificacionMatch = respuestaClaude.match(/CLASIFICACION:\s*(.*)/i);
    const siguienteMatch = respuestaClaude.match(/SIGUIENTE:\s*(.*)/i);
    
    const clasificacion = clasificacionMatch ? clasificacionMatch[1].trim() : "necesita-info";
    const siguientePaso = siguienteMatch ? siguienteMatch[1].trim() : "pedir-mas-info";
    
    const respuestaLimpia = respuestaClaude
      .replace(/CLASIFICACION:.*(\r?\n|$)/ig, '')
      .replace(/SIGUIENTE:.*(\r?\n|$)/ig, '')
      .trim();

    const conversacionGuardar = [
      ...historial.map(m => ({ 
        role: m.role === 'user' ? 'lead' : (m.role === 'assistant' ? 'agente' : m.role),
        content: m.content 
      })),
      { role: 'lead', content: mensaje },
      { role: 'agente', content: respuestaLimpia }
    ];

    if (contactId) {
      const docRef = doc(db, 'sales-conversations', String(contactId));
      await setDoc(docRef, {
        contactId,
        canal: canal || "desconocido",
        nombre: nombre || "Prospecto",
        conversacion: conversacionGuardar,
        clasificacion,
        ultimaActualizacion: serverTimestamp()
      }, { merge: true });
    }

    return {
      respuesta: respuestaLimpia,
      clasificacion,
      siguientePaso,
      contactId
    };
  } catch (error) {
    console.error("Error procesando mensaje en Sales Agent:", error);
    return {
      respuesta: "Me estoy reiniciando en este momento, dame unos minutos. 😊",
      clasificacion: "necesita-info",
      siguientePaso: "pedir-mas-info",
      contactId
    };
  }
}
