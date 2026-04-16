import { llamarClaude } from '../utils/claude-api';
import { systemPromptPerformance } from '../prompts/system-prompt-performance';
import { pausarAdSet, actualizarPresupuesto } from '../utils/meta-api';

export async function crearEstructuraCampana(datosCampana) {
  const { nombrePropiedad, presupuestoDiario, duracionDias, objetivo } = datosCampana;

  try {
    const promptUsuario = `
Crea la estructura de una campaña en Meta Ads para la siguiente propiedad:
- Propiedad: ${nombrePropiedad}
- Presupuesto Diario: ${presupuestoDiario} euros
- Duración: ${duracionDias} días
- Objetivo Principal: ${objetivo}

Por favor devuelve la estructura completa en el formato JSON especificado en tu system prompt.
`;

    const respuesta = await llamarClaude(systemPromptPerformance, promptUsuario);

    let jsonStr = respuesta;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error al crear estructura de campaña con Claude:", error);
    // Fallback con estructura de ejemplo realista
    return {
      "nombre_campana": `Campaña ${nombrePropiedad || 'Inmobiliaria'}`,
      "objetivo": objetivo === 'leads' ? "LEAD_GENERATION" : "CONVERSIONS",
      "presupuesto_diario_total": presupuestoDiario || 50,
      "duracion_dias": duracionDias || 30,
      "ad_sets": [
        {
          "nombre": "Audiencia Fría - Inversionistas",
          "tipo_audiencia": "fria",
          "presupuesto_porcentaje": 50,
          "targeting": { "intereses": ["Real Estate Investing", "Luxury Real Estate"], "edad": "30-65" },
          "creativos": [{ "titulo": "La casa de tus sueños", "copy_principal": "Descubre esta increíble propiedad...", "cta": "LEARN_MORE", "formato": "imagen" }]
        },
        {
          "nombre": "Retargeting - Visitantes Web",
          "tipo_audiencia": "retargeting",
          "presupuesto_porcentaje": 30,
          "targeting": { "intereses": ["Custom Audiences"], "edad": "30-65" },
          "creativos": [{ "titulo": "Sé que te gusta", "copy_principal": "Vuelve a ver esta villa exclusiva...", "cta": "CONTACT_US", "formato": "video" }]
        }
      ],
      "kpis_objetivo": {
        "cpl_maximo": 15,
        "ctr_minimo": 2.5,
        "frecuencia_maxima": 3.5,
        "leads_estimados": Math.floor((presupuestoDiario * duracionDias) / 12)
      },
      "reglas_optimizacion": ["Si CPL > €25 pausa ad set", "Si CTR < 1.5% cambia creativo"]
    };
  }
}

export async function analizarCampanaActiva(metricasCampana) {
  try {
    const promptUsuario = `
Analiza el rendimiento de esta campaña activa con las siguientes métricas:
${JSON.stringify(metricasCampana, null, 2)}

Devuelve el análisis en el formato JSON especificado en tu system prompt, separando acciones automáticas de las que requieren aprobación.
`;

    const respuesta = await llamarClaude(systemPromptPerformance, promptUsuario);

    let jsonStr = respuesta;
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error al analizar campaña:", error);
    return {
      "estado_general": "atención",
      "metricas_actuales": metricasCampana,
      "alertas": [{ "nivel": "info", "problema": "Claude no pudo procesar los datos", "accion_inmediata": "Revisar panel de Meta manualmente" }],
      "acciones_automaticas": [],
      "acciones_requieren_aprobacion": []
    };
  }
}

export async function ejecutarOptimizacion(campanaId, accion) {
  console.log(`Ejecutando optimización en ${campanaId}: ${JSON.stringify(accion)}`);
  
  if (accion.tipo === 'pausar_adset') {
    return await pausarAdSet(accion.adSetId);
  } else if (accion.tipo === 'actualizar_presupuesto') {
    return await actualizarPresupuesto(campanaId, accion.monto);
  }
  
  return { success: false, error: "Acción no reconocida" };
}
