// Sales Agent - Cualificación y seguimiento de Leads
import { llamarGemini } from '../utils/gemini-api.js';
import SYSTEM_PROMPT_SALES from '../prompts/system-prompt-sales.js';
import { dbAdmin } from '../../src/lib/firebase-admin.js';

export async function procesarMensajeSalesAgent({ contactId, nombre, channel, mensaje, historial = [] }) {
  try {
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
    const bantMatch = respuestaGemini.match(/ANALISIS_BANT:\s*({.*})/i);
    
    const clasificacion = clasificacionMatch ? clasificacionMatch[1].trim().toLowerCase() : "necesita-info";
    const siguientePaso = siguienteMatch ? siguienteMatch[1].trim() : "pedir-mas-info";
    let bantData = null;
    try {
      if (bantMatch) bantData = JSON.parse(bantMatch[1]);
    } catch (e) {
      console.warn("⚠️ Error parseando BANT JSON:", e.message);
    }
    
    const respuestaLimpia = respuestaGemini
      .replace(/CLASIFICACION:.*(\r?\n|$)/ig, '')
      .replace(/SIGUIENTE:.*(\r?\n|$)/ig, '')
      .replace(/ANALISIS_BANT:.*(\r?\n|$)/ig, '')
      .trim();

    // d. Reconstruir la conversación
    const now = new Date();
    const conversacionGuardar = [
      ...historial.map(m => ({ 
        sender: m.role === 'user' ? 'lead' : 'agent',
        text: m.content,
        timestamp: now
      })),
      { sender: 'lead', text: mensaje, timestamp: now },
      { sender: 'agent', text: respuestaLimpia, timestamp: new Date() }
    ];

    // e. Intentar guardar en Firebase (Admin)
    if (contactId) {
      try {
        // Guardar conversación
        const convRef = dbAdmin.collection('sales-conversations').doc(String(contactId));
        await convRef.set({
          contactId,
          channel: channel || "desconocido",
          nombre: nombre || "Prospecto",
          conversacion: conversacionGuardar,
          clasificacion,
          bant: bantData,
          ultimaActualizacion: new Date()
        }, { merge: true });

        // Sincronizar con el Lead Profile para el Dashboard
        const leadRef = dbAdmin.collection('leads').doc(String(contactId));
        await leadRef.set({
          bant: bantData,
          status: clasificacion === 'calificado' ? 'Calificado' : 'En seguimiento',
          lastInteraction: new Date(),
          qualifiedAlert: clasificacion === 'calificado' // Trigger para el toast
        }, { merge: true });

        console.log(`✅ Lead Profile & BANT actualizado para: ${contactId}`);
      } catch (fbError) {
        console.error("❌ Fallo persistencia en Firebase (Admin):", fbError.message);
      }
    }

    return {
      respuesta: respuestaLimpia,
      clasificacion,
      siguientePaso,
      bant: bantData,
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
