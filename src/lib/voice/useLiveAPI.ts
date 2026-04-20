import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { AudioPlayer } from './audioPlayer';
import { AudioRecorder } from './audioRecorder';
import { db } from '../firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';

export interface TaskData {
  agente: string;
  tarea: string;
  estado: string;
  comentarios: string;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);

const INSTRUCTION = `Eres RORA, la Directora de Operaciones AI de un asesor inmobiliario independiente (tu jefe/usuario). Tu misión es orquestar el trabajo de 4 agentes especializados:
- Lumen: Contenidos, fotos, videos y guiones.
- Aura: Campañas de marketing y Meta Ads.
- Lyra: Calificación de leads y atención por WhatsApp.
- Atlas: Búsqueda de propiedades y confección de dossiers.

PERSONALIDAD Y TONO
- Eres su mano derecha: directa, ejecutiva y resolutiva.
- No le ofreces servicios, tú trabajas para él.
- Tu objetivo es resumir lo que los agentes han hecho y pedirle aprobación o instrucciones.
- Siempre en español.

FLUJO DE CONVERSACIÓN
1. SALUDO INICIAL (si te saluda):
   "Hola. Tengo actualizaciones del equipo. ¿Quieres un resumen de las tareas pendientes de aprobación, o tienes alguna directiva nueva?"
2. ORQUESTACIÓN:
   Informa sobre una tarea pendiente (invéntala basada en el agente) o procesa una orden del usuario.
   "Aura preparó la campaña de pauta para la casa del centro. ¿La aprobamos para lanzamiento o la frenamos?"
3. CONFIRMACIÓN Y EJECUCIÓN:
   Según su respuesta (aprobar o denegar), confirmas y ejecutas.
   "Entendido. Marcando la campaña de Aura como aprobada."
4. ACCIÓN DEL SISTEMA:
   Inmediatamente llama a la herramienta 'gestionar_tarea' para registrar la decisión en la interfaz.

REGLAS DE CONTINUIDAD
- Nunca digas "hasta luego" a menos que él se despida, esto es un walkie-talkie abierto.
- Máximo 2 frases por turno.
- No uses listas ni bullets — estás hablando.

HABILIDAD DE CONSULTA (REPORTES)
- Tienes la capacidad de "mirar" lo que hacen los agentes.
- Si el usuario pregunta "¿Cómo vamos?", "¿Qué ha hecho Lumen?", "¿Reporte de Aura?", etc., DEBES llamar a la función 'obtener_informe_equipo'.
- Una vez tengas los datos, resúmelos de forma ejecutiva.`;

export function useLiveAPI(onTask: (data: TaskData) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionRef = useRef<Promise<any> | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  const connect = useCallback(async () => {
    if (isConnected) return;
    try {
      audioPlayerRef.current = new AudioPlayer();
      audioRecorderRef.current = new AudioRecorder();

      sessionRef.current = ai.live.connect({
        model: "gemini-2.0-flash-exp", // Actualizado a 2.0 que es el soportado para Live
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            audioRecorderRef.current?.start((base64Data) => {
              sessionRef.current?.then((session) => {
                session.sendRealtimeInput({ audio: { mimeType: 'audio/pcm;rate=16000', data: base64Data } });
              });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioPlayerRef.current?.interrupt();
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              audioPlayerRef.current?.playBase64PCM(base64Audio);
              // reset speaking state after a while
              setTimeout(() => setIsSpeaking(false), 800); 
            }

            if (message.toolCall) {
              const calls = message.toolCall.functionCalls;
              
              for (const call of calls) {
                if (call.name === "gestionar_tarea") {
                  const args = call.args as any;
                  onTask({
                    agente: args.agente || "",
                    tarea: args.tarea || "",
                    estado: args.estado || "",
                    comentarios: args.comentarios || "",
                  });

                  window.dispatchEvent(new CustomEvent("tarea_managed", {
                    detail: {
                      agente: args.agente,
                      tarea: args.tarea,
                      estado: args.estado,
                      comentarios: args.comentarios
                    }
                  }));

                  sessionRef.current?.then(session => {
                    session.sendToolResponse({
                      functionResponses: [{
                        name: call.name,
                        id: call.id,
                        response: { success: true }
                      }]
                    });
                  });
                }

                if (call.name === "obtener_informe_equipo") {
                  const args = call.args as any;
                  const agente = args.agente || "Todos";
                  
                  // Generar informe de forma asíncrona
                  const generateReport = async () => {
                    let reportText = "";
                    
                    if (agente === "Aura" || agente === "Todos") {
                      const q = query(collection(db, 'campanas'), limit(3));
                      const snap = await getDocs(q);
                      const camps = snap.docs.map(d => d.data());
                      reportText += `Aura tiene ${snap.size} campañas activas. `;
                      if (camps.length > 0) reportText += `La última campaña reporta un CPL promedio de ${camps[0].cpl_promedio || 'no disponible'}. `;
                    }

                    if (agente === "Lumen" || agente === "Todos") {
                        const q = query(collection(db, 'logs-agentes'), orderBy('timestamp', 'desc'), limit(5));
                        const snap = await getDocs(q);
                        const lumenLogs = snap.docs.filter(d => d.data().agente === 'Lumen');
                        reportText += `Lumen ha generado ${lumenLogs.length} piezas de contenido recientemente. El último fue: ${lumenLogs[0]?.data()?.mensaje.split('guion para')[1] || 'un guion nuevo'}. `;
                    }

                    if (agente === "Atlas" || agente === "Todos") {
                        const q = query(collection(db, 'logs-agentes'), orderBy('timestamp', 'desc'), limit(10));
                        const snap = await getDocs(q);
                        const atlasLogs = snap.docs.filter(d => d.data().agente === 'Atlas');
                        reportText += `Atlas ha completado ${atlasLogs.length} misiones de exploración. `;
                    }

                    // Reporte de Visitas (Lyra / Calendario)
                    if (agente === "Lyra" || agente === "Todos") {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const q = query(collection(db, 'calendarEvents'), orderBy('date', 'asc'));
                        const snap = await getDocs(q);
                        
                        const todayVisits = snap.docs.filter(d => {
                            const dDate = d.data().date?.toDate();
                            return dDate && dDate >= today && dDate < new Date(today.getTime() + 86400000);
                        });

                        if (todayVisits.length > 0) {
                            reportText += `Hoy tienes ${todayVisits.length} visitas programadas: `;
                            todayVisits.forEach(v => {
                                const data = v.data();
                                reportText += `${data.title} a las ${data.time} ${data.location ? 'en ' + data.location : ''}. `;
                            });
                        } else {
                            reportText += "No tienes visitas programadas para el día de hoy. ";
                        }
                    }

                    sessionRef.current?.then(session => {
                        session.sendToolResponse({
                          functionResponses: [{
                            name: call.name,
                            id: call.id,
                            response: { reportContent: reportText }
                          }]
                        });
                    });
                  };
                  
                  generateReport();
                }
              }
            }
          },
          onclose: () => {
            setIsConnected(false);
            setIsSpeaking(false);
            audioPlayerRef.current?.stop();
            audioRecorderRef.current?.stop();
          },
          onerror: (err) => {
            console.error(err);
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction: INSTRUCTION,
          tools: [{
            functionDeclarations: [{
              name: "gestionar_tarea",
              description: "Registra en el sistema la aprobación, rechazo o asignación de una tarea de un agente.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  agente: { type: Type.STRING, description: "Lumen, Aura, Lyra, Atlas o RORA" },
                  tarea: { type: Type.STRING, description: "Descripción breve de la tarea gestionada" },
                  estado: { type: Type.STRING, description: "'Aprobada', 'Denegada', 'Pendiente'" },
                  comentarios: { type: Type.STRING, description: "Instrucciones del realtor" }
                },
                required: ["agente", "tarea", "estado"]
              }
            },
            {
              name: "obtener_informe_equipo",
              description: "Obtiene un resumen de las métricas, actividades y resultados de Aura (Ads), Lumen (Contenido) y Atlas (Exploración).",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  agente: { type: Type.STRING, description: "Aura, Lumen, Atlas o Todos" }
                }
              }
            }]
          }]
        },
      });

    } catch (err) {
      console.error("Failed to start Live API", err);
    }
  }, [isConnected, onTask]);

  const disconnect = useCallback(() => {
    sessionRef.current?.then(session => session.close());
    sessionRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    audioPlayerRef.current?.stop();
    audioRecorderRef.current?.stop();
  }, []);

  return { connect, disconnect, isConnected, isSpeaking };
}
