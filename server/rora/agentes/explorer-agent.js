import { llamarClaude } from '../utils/claude-api.js';
import { systemPromptExplorer } from '../prompts/system-prompt-explorer.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

export async function buscarPropiedadesParaCliente(datosCliente) {
  const { nombreCliente, presupuestoMax, zonaPreferida, habitacionesMin, caracteristicas } = datosCliente;

  try {
    const propiedadesRef = collection(db, 'propiedades');
    const q = query(propiedadesRef, where("estado", "==", "activa"));
    let snap;
    try {
        snap = await getDocs(q);
    } catch (e) {
        snap = await getDocs(propiedadesRef);
    }
    
    const propiedadesDisponibles = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => !p.estado || p.estado === 'activa');

    const promptUsuario = `
Client Profile:
- Nombre: ${nombreCliente}
- Presupuesto Máximo: ${presupuestoMax || 'No definido'}
- Zona Preferida: ${zonaPreferida || 'Cualquiera'}
- Habitaciones Mínimas: ${habitacionesMin || 0}
- Características Clave: ${(caracteristicas || []).join(', ')}

Available Properties in RORA Database:
${JSON.stringify(propiedadesDisponibles, null, 2)}

Por favor elabora el dossier siguiendo el formato JSON especificado.
`;

    const respuesta = await llamarClaude(systemPromptExplorer, promptUsuario);

    let jsonStr = respuesta;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn("Fallo al contactar con Claude o parsear. Filtro manual fallback activado.", error);
    
    let props = [];
    try {
        const snap = await getDocs(collection(db, 'propiedades'));
        props = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) {}
    
    const encajan = props.filter(p => {
        if (p.estado && p.estado !== 'activa') return false;
        const precioProp = Number(p.precio || p.price || 0);
        const pres = Number(presupuestoMax || 0);
        if (pres > 0 && precioProp > pres) return false;
        return true;
    }).slice(0, 5);

    return {
      "perfil_cliente": {
        "nombre": nombreCliente || "Cliente",
        "presupuesto_max": presupuestoMax || 0,
        "zona_preferida": zonaPreferida || "Cualquiera",
        "caracteristicas_clave": caracteristicas || []
      },
      "propiedades_encontradas": encajan.map(p => ({
        "id": p.id,
        "nombre": p.titulo || p.title || "Propiedad",
        "ubicacion": p.zona || p.location || "Ubicación desconocida",
        "precio": p.precio || p.price || 0,
        "compatibilidad": 85,
        "razon_compatibilidad": "Encaja dentro del presupuesto según nuestra base de datos.",
        "caracteristicas": p.caracteristicas || [],
        "url_imagen": p.imagen || p.image || null,
        "precio_minimo_aceptado": p.precio_minimo || null
      })),
      "mensaje_para_cliente": `Hola ${nombreCliente}, he revisado nuestra cartera de propiedades disponibles y he seleccionado las mejores opciones que se ajustan a tu presupuesto y requisitos. Échales un vistazo y seguimos hablando.`
    };
  }
}
