import { llamarGemini } from '../utils/gemini-api.js';
import { systemPromptContent } from '../prompts/system-prompt-content.js';

export async function procesarSolicitudContenido(datosPropiedad) {
  const { nombre, ubicacion, precio, habitaciones, banos, metros, caracteristicas, tipoContenido } = datosPropiedad;

  const promptUsuario = `
Por favor, genera el contenido solicitado para la siguiente propiedad:

Nombre/Título: ${nombre || 'No especificado'}
Ubicación: ${ubicacion || 'No especificada'}
Precio: ${precio || 'No especificado'}
Habitaciones: ${habitaciones || 'No especificado'}
Baños: ${banos || 'No especificado'}
Metros Cuadrados: ${metros || 'No especificado'}
Características Especiales: ${caracteristicas || 'No especificadas'}
Tipo de Contenido Solicitado: ${tipoContenido || 'No especificado'}

Recuerda devolver SOLAMENTE el JSON con la estructura solicitada, sin formato markdown extra alrededor.
`;

  try {
    const respuesta = await llamarGemini(
      systemPromptContent,
      promptUsuario
    );

    let jsonStr = respuesta;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const resultadoParseado = JSON.parse(jsonStr);
    return resultadoParseado;
  } catch (error) {
    console.warn("Fallo al contactar con Gemini o al parsear la respuesta. Devolviendo fallback del Content Agent.", error.message);
    return {
      "guion_60s": `(Gancho visual: Vista aérea desde el dron entrando por la terraza hacia la piscina infinita)\\n¿Te imaginas despertar cada mañana con el Mediterráneo a tus pies?\\n(Recorrido: Cámara flota desde la cocina abierta hacia el salón bañado de luz natural)\\nBienvenido a ${nombre || 'esta joya inmobiliaria'}, en el corazón de ${ubicacion || 'la mejor zona'}. Un refugio de lujo donde el diseño moderno se funde con el horizonte.\\n(Características: Detalles de la suite principal y los acabados en piedra natural)\\nCon ${habitaciones || 'amplias'} suites, ${banos || 'exquisitos'} baños y un inigualable nivel de privacidad, cada rincón está pensado para el máximo confort.\\n(Llamada a la acción: Planos del exterior al atardecer)\\nTu nueva vida te espera. Comenta 'QUIERO VERLA' o envíanos un mensaje directo para agendar una visita privada.`,
      "caption_instagram": `💎 Eleva tu estilo de vida en ${ubicacion || 'la ubicación más exclusiva'}.\\n\\nDescubre ${nombre || 'esta obra maestra'}, un santuario de diseño moderno donde el lujo y la tranquilidad se encuentran ✨.\\n\\nDetalles de la propiedad:\\n🛏️ ${habitaciones || '-'} Habitaciones de lujo\\n🛁 ${banos || '-'} Baños con acabados premium\\n📏 ${metros || '-'} m² de diseño excepcional\\n\\n${caracteristicas || 'Disfruta de espacios amplios, luz natural y vistas inigualables'}. Todo esto por ${precio || 'un precio inmejorable'}.\\n\\n¿Deseas conocer más detalles? 📩 Envíanos un DM con la palabra "LUJO" o comenta abajo para recibir el dossier completo.\\n\\n#BienesRaicesLujo #InmobiliariaPremium #VidaDeLujo`,
      "caption_facebook": `¿Buscando la propiedad de tus sueños? No busques más.\\n\\nTe presentamos en exclusiva ${nombre || 'este inmueble de lujo'}, estratégicamente ubicado en ${ubicacion || 'una de las zonas más codiciadas'}. Esta propiedad redefine el concepto de elegancia contemporánea.\\n\\nImagina disfrutar de ${caracteristicas || 'sus increíbles vistas y acabados de primera calidad'}. Con una superficie de ${metros || '-'} metros cuadrados, ${habitaciones || '-'} amplias habitaciones y ${banos || '-'} elegantes baños, este hogar está diseñado meticulosamente para quienes aprecian la calidad absoluta, con un valor de ${precio || 'consultar precio'}.\\n\\nNo dejes pasar la oportunidad de invertir en calidad de vida. Contáctanos hoy mismo para concertar tu visita presencial o solicitar nuestro tour virtual detallado. Deja que nuestro equipo se encargue de todo el proceso.\\n\\n🔗 Haz clic en el enlace de nuestra biografía o envíanos un mensaje privado para más información.`,
      "hashtags": [
        "#RealEstateLujo",
        `#${(ubicacion || 'Propiedades').replace(/\s+/g, '')}Lujo`,
        "#PropiedadesExclusivas",
        "#MercadoInmobiliarioLujo",
        "#EstiloDeVidaPremium"
      ],
      "horario_recomendado": "Viernes a las 19:00",
      "titulo_contenido": `${nombre || 'Propiedad'} — Reel Sugerido`
    };
  }
}
