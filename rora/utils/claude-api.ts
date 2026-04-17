// Utilidad: Llamadas a la API de Claude

const getEnv = (name) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  return process.env[name];
};

const RORA_BACKEND_URL = 'https://rora-app.onrender.com/api/rora/chat';

export async function llamarClaude(systemPrompt, mensajeUsuario, historial = [], tools = []) {
  try {
    const requestBody = {
      model: getEnv('VITE_CLAUDE_MODEL') || 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...historial,
      ]
    };

    if (mensajeUsuario) {
        requestBody.messages.push({ role: 'user', content: mensajeUsuario });
    }

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      // You can define tool_choice here if needed, defaults to auto
    }

    const response = await fetch(RORA_BACKEND_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        mensaje: mensajeUsuario,
        systemPrompt: systemPrompt,
        historial: historial,
        tools: tools
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error en la llamada a la API de Claude:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.reply) {
        return data.reply;
    }
    
    return data.error || 'Error en la respuesta del servidor RORA.';
    
  } catch (error) {
    console.error('Error al intentar llamar a Claude:', error);
    return 'RORA no está disponible en este momento. Intenta de nuevo.';
  }
}
