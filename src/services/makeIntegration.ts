export const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/gvba9pbfguh4fvqedl69j7d2kfckrm8d';

export type EventType =
  | 'NEW_LEAD'
  | 'UPDATE_LEAD'
  | 'NEW_APPOINTMENT'
  | 'NEW_MESSAGE'
  | 'AI_AGENT_AUTOMATION'
  | 'NEW_PROPERTY';

/**
 * Servicio unificado para enviar eventos de Rora hacia Make.com / Go High Level
 */
export const MakeIntegration = {
  sync: async (eventType: EventType, payload: any) => {
    try {
      const data = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload
      };

      console.log(`[Make.com] Enviando evento ${eventType}`, data);

      if (MAKE_WEBHOOK_URL.includes('tu-url-unica')) {
        console.warn('⚠️ Webhook de Make.com no configurado. Pon tu VITE_MAKE_WEBHOOK_URL en .env');
        // No bloqueamos en entorno local si no hay webhook, pero en prd debería estar.
      }

      await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(`[Make.com] Evento ${eventType} enviado exitosamente.`);
    } catch (error) {
      console.error(`[Make.com] Error al sincronizar evento ${eventType}:`, error);
    }
  }
};

export const sendEventToMake = async (event: any) => {
  try {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL || MAKE_WEBHOOK_URL;
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...event
      })
    });
  } catch (error) {
    console.error("Error enviando a Make:", error);
  }
};
