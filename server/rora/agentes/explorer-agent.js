import { llamarGemini } from '../utils/gemini-api.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

const systemPromptAtlas = `
Eres "Atlas", el agente buscador de RORA. Tu misión es encontrar las mejores propiedades en nuestro inventario interno que coincidan con el perfil BANT del lead.
Reglas:
1. Analiza el presupuesto, zona y habitaciones.
2. Devuelve un JSON con las 3 mejores opciones.
3. Estructura del JSON:
{
  "propiedades": [
    { "id": "string", "titulo": "string", "precio": number, "zona": "string", "habitaciones": number, "image": "string", "match": number }
  ],
  "explicacion": "Breve texto de por qué estas opciones."
}
`;

export async function buscarAlternativasConAtlas(leadBant) {
  try {
    const propsRef = collection(db, 'propiedades');
    const q = query(propsRef, where("status", "==", "active"));
    const snap = await getDocs(q);
    
    const inventario = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const prompt = `
    Perfil BANT del lead: ${JSON.stringify(leadBant)}
    Inventario disponible: ${JSON.stringify(inventario)}
    Encuentra las 3 mejores coincidencias.
    `;

    const respuesta = await llamarGemini(systemPromptAtlas, prompt);
    let result = respuesta;
    if (result.includes('```json')) result = result.split('```json')[1].split('```')[0].trim();
    
    return JSON.parse(result);
  } catch (error) {
    console.error("Error en Atlas:", error);
    return { propiedades: [], explicacion: "No pude encontrar alternativas en este momento." };
  }
}
