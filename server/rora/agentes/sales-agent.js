import { llamarClaude } from '../utils/claude-api.js';
import SYSTEM_PROMPT_SALES from '../prompts/system-prompt-sales.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

export async function procesarMensajeSalesAgent({ contactId, nombre, canal, mensaje, historial = [], isAutomated = false }) {
  try {
    // 1. CORTOCIRCUITO: Detección de Ecos
    // Si el mensaje actual es idéntico a la última respuesta del agente, ignoramos.
    // a. Construye el contexto para Gemini
    const contextoConstruido = `Canal: ${channel || "desconocido"}. Nombre del lead: ${nombre || "Prospecto"}.\nMensaje del lead: ${mensaje}`;
    
    // b. Llama a llamarGemini
    const respuestaGemini = await llamarGemini(SYSTEM_PROMPT_SALES, contextoConstruido, historial);
    
    if (!respuestaGemini) {
      throw new Error("Respuesta nula desde Gemini API.");
    }

    // c. Toma la respuesta de Gemini y extrae los datos clave
    const clasificacionMatch = respuestaGemini.match(/CLASIFICACION:\s*(.*)/i);
    const siguienteMatch = respuestaGemini.match(/SIGUIENTE:\s*(.*)/i);
    
    const clasificacion = clasificacionMatch ? clasificacionMatch[1].trim() : "necesita-info";
    const siguientePaso = siguienteMatch ? siguienteMatch[1].trim() : "pedir-mas-info";
    
    const respuestaLimpia = respuestaGemini
      .replace(/CLASIFICACION:.*(\r?\n|$)/ig, '')
      .replace(/SIGUIENTE:.*(\r?\n|$)/ig, '')
      .trim();

    // d. Reconstruir la conversación
    const now = new Date();
    const conversacionGuardar = [
      ...historial.map(m => ({ 
        sender: m.role === 'user' ? 'lead' : 'agent',
        text: m.content || m.text,
        timestamp: now // Aproximado para historial
      })),
      { sender: 'lead', text: mensaje, timestamp: now },
      { sender: 'agent', text: respuestaLimpia, timestamp: new Date() }
    ];

    // e. Intentar guardar en Firebase con Admin
    if (contactId) {
      try {
        const docRef = dbAdmin.collection('sales-conversations').doc(String(contactId));
        await docRef.set({
          contactId,
          channel: channel || "desconocido",
          nombre: nombre || "Prospecto",
          conversacion: conversacionGuardar,
          clasificacion,
          ultimaActualizacion: new Date()
        }, { merge: true });
        console.log(`✅ Conversación persistida con éxito en Firestore para Lead: ${contactId}`);
      } catch (fbError) {
        console.error("❌ Fallo persistencia en Firebase (Admin) en servidor:", fbError.message);
      }
    }

    return {
      respuesta: respuestaLimpia,
      clasificacion,
      siguientePaso,
      contactId
    };
  } catch (error) {
    console.error("Error procesando mensaje en Sales Agent (Producción):", error);
    return {
      respuesta: "Me estoy reiniciando en este momento, dame unos minutos. 😊",
      clasificacion: "necesita-info",
      siguientePaso: "pedir-mas-info",
      contactId
    };
  }
}
