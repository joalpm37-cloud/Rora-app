import { llamarGemini } from '../utils/gemini-api.js';
import { systemPromptExplorer } from '../prompts/system-prompt-explorer.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/lib/firebase.js';

export async function buscarPropiedadesParaCliente(datosCliente) {
  const { nombreCliente, presupuestoMax, zonaPreferida, habitacionesMin, caracteristicas } = datosCliente;

  try {
    // Paso 1: Traer propiedades del inventario interno
    const propiedadesRef = collection(db, 'propiedades');
    // Traemos de forma proactiva para que el agente filtre en base al contexto
    const snap = await getDocs(propiedadesRef);
    const inventario = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Paso 2: Filtro inicial por estado activo (si aplica)
    const disponibles = inventario.filter(p => !p.estado || p.estado === 'activa');

    // Paso 3: Construir contexto para Gemini
    const promptUsuario = `
Available Properties in RORA Database (Current Inventory):
${JSON.stringify(disponibles, null, 2)}

Requirements for ${nombreCliente}:
- Presupuesto Max: €${presupuestoMax || 'No definido'}
- Zona: ${zonaPreferida || 'Marbella/Costa del Sol'}
- Habitaciones min: ${habitacionesMin || 0}
- Preferencias: ${(caracteristicas || []).join(', ')}

Selecciona las TOP 3 que mejor encajen.
`;

    const respuesta = await llamarGemini(systemPromptExplorer, promptUsuario);

    // Paso 4: Parsea JSON y garantiza el Top 3
    let jsonStr = respuesta;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const finalResult = JSON.parse(jsonStr);
    
    // Validar que no hay más de 3
    if (finalResult.propiedades_encontradas) {
        finalResult.propiedades_encontradas = finalResult.propiedades_encontradas.slice(0, 3);
    }

    return finalResult;
  } catch (error) {
    console.error("❌ Atlas falló, usando filtro estricto manual.", error.message);
    
    // Fallback Manual 
    const snap = await getDocs(collection(db, 'propiedades'));
    const props = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const coinciden = props.filter(p => {
        const pPrecio = Number(p.precio || 0);
        const pMax = Number(presupuestoMax || 999999999);
        return pPrecio <= pMax;
    }).slice(0, 3);

    return {
      "perfil_cliente": { "nombre": nombreCliente, "presupuesto_max": presupuestoMax },
      "propiedades_encontradas": coinciden.map(p => ({
        "id": p.id,
        "nombre": p.nombre || p.address || "Propiedad Rora",
        "ubicacion": p.ubicacion || p.zone || "No especificada",
        "precio": p.precio || 0,
        "compatibilidad": 90,
        "razon_compatibilidad": "Filtro manual por presupuesto.",
        "url_imagen": p.url_imagen || p.coverPhoto || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"
      })),
      "mensaje_para_cliente": `Hola ${nombreCliente}, he encontrado estas 3 opciones que encajan perfectamente con lo que buscas.`
    };
  }
}
