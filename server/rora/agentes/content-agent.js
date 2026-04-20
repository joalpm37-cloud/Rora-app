import { llamarGemini } from '../utils/gemini-api.js';

const systemPromptLumen = `
Eres "Lumen", el Director de Arte IA y Agente Creativo de RORA. 
Tu misión es transformar datos de propiedades en experiencias visuales cinematográficas mediante Remotion.

REGLAS DE DIRECTOR DE ARTE:
1. Analiza la propiedad y define una "Personalidad Visual".
2. Genera una paleta de colores (Primary, Secondary, Accent) en formato Hex.
3. Elige una fuente (Inter, Roboto, Montserrat) según el estilo.
4. Genera un guión estructurado y un caption para redes sociales.

DEBES devolver SIEMPRE un JSON con esta estructura exacta:
{
  "guion": "string",
  "caption": "string",
  "videoConfig": {
    "title": "Título impactante (max 25 carac)",
    "price": "Precio formateado",
    "location": "Zona/Barrio",
    "colorPalette": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX"
    },
    "fontFamily": "string (Inter, sans-serif)",
    "animationStyle": "fade | slide"
  }
}
`;

export async function generarContenidoConLumen(propiedadData) {
  try {
    const prompt = `Propiedad: ${propiedadData.address || 'Sin dirección'}
Precio: ${propiedadData.price || 'Consultar'} €
Zona: ${propiedadData.zone || 'N/A'}
Habitaciones: ${propiedadData.bedrooms || '0'}
Baños: ${propiedadData.bathrooms || '0'}
Metros: ${propiedadData.sqm || '0'} m2
Descripción: ${propiedadData.description || ''}
Fotos (URL): ${JSON.stringify(propiedadData.photos || [])}`;

    const respuesta = await llamarGemini(systemPromptLumen, prompt);
    
    let result = respuesta;
    if (result.includes('```json')) result = result.split('```json')[1].split('```')[0].trim();
    if (result.includes('```')) result = result.split('```')[1].split('```')[0].trim(); // Fallback for plain code blocks
    
    return JSON.parse(result);
  } catch (error) {
    console.error("Error en Lumen Art Director:", error);
    return { 
      guion: "No se pudo generar el guión.", 
      caption: "¡Nueva propiedad disponible!",
      videoConfig: {
        title: propiedadData.titulo || "Propiedad RORA",
        price: propiedadData.precio || "Consultar",
        location: propiedadData.zona || "",
        colorPalette: { primary: "#1a1a1a", secondary: "#ffffff", accent: "#d4af37" },
        fontFamily: "Inter, sans-serif"
      }
    };
  }
}
