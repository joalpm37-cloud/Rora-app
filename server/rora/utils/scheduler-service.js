import { llamarGemini } from '../utils/gemini-api.js';

const systemPromptScheduler = `
Eres la lógica de agendamiento integrada de Lira, el agente de ventas de RORA.
Tu misión es analizar la disponibilidad de un calendario y proponer los 3 mejores huecos para una cita.
Dada una lista de eventos ocupados (busy) y un perfil de cliente, busca huecos de 30 minutos entre las 9:00 y las 18:00 (lunes a viernes).
Devuelve SIEMPRE un JSON con esta estructura:
{
  "propuestas": [
    { "inicio": "ISO_TIMESTAMP", "fin": "ISO_TIMESTAMP", "label": "Lunes 10 de Octubre, 10:00 AM" }
  ]
}
No añadas texto extra.
`;

export async function generarPropuestasCita(availabilityData, leadProfile) {
  const prompt = `
  Disponibilidad del Asesor (Ocupado): ${JSON.stringify(availabilityData)}
  Perfil del Lead: ${JSON.stringify(leadProfile)}
  Por favor genera las 3 mejores propuestas de cita.
  `;

  try {
    const respuesta = await llamarGemini(systemPromptScheduler, prompt);
    let jsonStr = respuesta;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error en scheduler service:", error);
    return { propuestas: [] };
  }
}
