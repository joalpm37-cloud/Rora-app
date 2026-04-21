import { llamarGemini } from '../utils/gemini-api.js';
import { getDb } from '../../lib/firebase.js';
import { collection, doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { generarPropuestasCita } from '../utils/scheduler-service.js';
import { getFreeBusy } from '../utils/google-api.js';

const systemPromptLira = `
Eres "Lira", el agente experto en ventas y atención al cliente de RORA. 
Tu objetivo es calificar leads basándote en el modelo BANT (Presupuesto, Autoridad, Necesidad, Tiempo).
Hablas de forma profesional, cercana y persuasiva.

Analiza la conversación y los datos actuales para devolver un JSON:
{
  "clasificacion": "nuevo" | "calificado" | "hot" | "descartado",
  "score": 0-100,
  "bant": {
    "presupuesto": number,
    "zona": string,
    "habitaciones": number,
    "necesidad": string
  },
  "resumen": "string",
  "siguiente_accion": "string"
}
`;

export async function procesarConversacionConLira(leadId, conversacionActual) {
  try {
    const db = getDb();
    const leadRef = doc(db, 'leads', leadId);
    
    // 1. Llamar a Lira para calificar
    const userPrompt = `Conversación actual: ${JSON.stringify(conversacionActual)}`;
    const respuesta = await llamarGemini(systemPromptLira, userPrompt);
    
    let result = respuesta;
    if (result.includes('```json')) result = result.split('```json')[1].split('```')[0].trim();
    const data = JSON.parse(result);

    // 2. Si está calificado/hot, disparar agendamiento bajo el nombre de Lira
    let extraActions = [];
    if (data.clasificacion === 'calificado' || data.clasificacion === 'hot') {
      try {
        const leadSnap = await getDoc(leadRef);
        const leadData = leadSnap.data();
        const userId = leadData.assignedTo || 'default-user'; // ID del asesor

        // Obtener ocupación del calendario
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const busySlots = await getFreeBusy(userId, now, nextWeek);

        // Generar propuestas vía el servicio de agendamiento
        const slotsResponse = await generarPropuestasCita(busySlots, data.bant);
        
              data: sugerencia.propuestas,
              status: 'pending',
              timestamp: new Date()
            })
          });
          console.log("✅ Sugerencia de Chronos añadida al timeline.");
        }
      } catch (err) {
        console.error("⚠️ Falló Chronos:", err.message);
      }
    }

    return {
      respuesta: respuestaLimpia,
      clasificacion,
      contactId
    };
  } catch (error) {
    console.error("❌ Error en Sales Agent:", error);
    return {
      respuesta: "Hola, estoy procesando tu solicitud. Un asesor te contactará pronto. 😊",
      clasificacion: "necesita-info"
    };
  }
}
