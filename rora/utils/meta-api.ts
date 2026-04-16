/**
 * Meta Ads API Utility
 * Integra RORA con la Graph API de Meta para gestionar campañas publicitarias.
 * Requiere variables de entorno: META_ACCESS_TOKEN y META_AD_ACCOUNT_ID
 */

const META_VERSION = 'v19.0';
const ACCESS_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN;
const AD_ACCOUNT_ID = import.meta.env.VITE_META_AD_ACCOUNT_ID;

const checkConfig = () => {
  if (!ACCESS_TOKEN || !AD_ACCOUNT_ID) {
    return { simulado: true, mensaje: "Meta API no configurada aún (faltan variables de entorno)" };
  }
  return null;
};

export async function crearCampanaMeta(estructura) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  try {
    const response = await fetch(`https://graph.facebook.com/${META_VERSION}/act_${AD_ACCOUNT_ID}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: estructura.nombre_campana,
        objective: estructura.objetivo,
        status: 'PAUSED', // Siempre empezamos en pausa por seguridad
        daily_budget: estructura.presupuesto_diario_total * 100, // Meta usa centavos
        special_ad_categories: ['HOUSING'], // Crítico para inmobiliaria
        access_token: ACCESS_TOKEN
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en crearCampanaMeta:", error);
    throw error;
  }
}

export async function crearAdSetMeta(campanaId, adSetData) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  // Implementación simplificada para la estructura inicial
  try {
    const response = await fetch(`https://graph.facebook.com/${META_VERSION}/act_${AD_ACCOUNT_ID}/adsets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: adSetData.nombre,
        campaign_id: campanaId,
        daily_budget: (adSetData.presupuesto_porcentaje / 100) * 1000, // Placeholder
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LEAD_GENERATION',
        targeting: JSON.stringify(adSetData.targeting),
        status: 'PAUSED',
        access_token: ACCESS_TOKEN
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en crearAdSetMeta:", error);
    throw error;
  }
}

export async function crearAnuncioMeta(adSetId, creativo) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  // Placeholder para creación de anuncio
  return { simulado: true, message: "Funcionalidad de creación de anuncios en desarrollo" };
}

export async function obtenerMetricasCampana(campanaId) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  try {
    const response = await fetch(`https://graph.facebook.com/${META_VERSION}/${campanaId}/insights?fields=spend,impressions,clicks,ctr,cpm,actions,cost_per_action_type&date_preset=last_7d&access_token=${ACCESS_TOKEN}`);
    return await response.json();
  } catch (error) {
    console.error("Error en obtenerMetricasCampana:", error);
    throw error;
  }
}

export async function pausarAdSet(adSetId) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  try {
    const response = await fetch(`https://graph.facebook.com/${META_VERSION}/${adSetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'PAUSED',
        access_token: ACCESS_TOKEN
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en pausarAdSet:", error);
    throw error;
  }
}

export async function actualizarPresupuesto(campanaId, nuevoDiario) {
  const errorConfig = checkConfig();
  if (errorConfig) return errorConfig;

  try {
    const response = await fetch(`https://graph.facebook.com/${META_VERSION}/${campanaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_budget: nuevoDiario * 100,
        access_token: ACCESS_TOKEN
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Error en actualizarPresupuesto:", error);
    throw error;
  }
}
