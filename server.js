import express from 'express';
import dotenv from 'dotenv';
import { procesarMensajeSalesAgent } from './rora/agentes/sales-agent.js';
import { db } from './src/lib/firebase.js';
import { dbAdmin } from './src/lib/firebase-admin.js';

dotenv.config();

const app = express();
app.use(express.json());

// Endpoint de Salud (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    // 1. Verificar Firebase (Admin para saltar reglas)
    let firebaseStatus = 'connected';
    let propertiesMsg = 'Lectura exitosa';
    
    try {
      const snapshot = await dbAdmin.collection('properties').limit(1).get();
      if (snapshot.empty) propertiesMsg = 'Colección vacía';
    } catch (dbError) {
      console.error("Error en lectura Admin:", dbError.message);
      firebaseStatus = `Error: ${dbError.message}`;
      propertiesMsg = 'Fallo de permisos Admin';
    }
    
    // 2. Verificar Gemini API Key
    const geminiStatus = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'TU_GEMINI_API_KEY' 
      ? 'Configurada' 
      : 'Pendiente (Placeholder en .env)';

    res.json({
      status: firebaseStatus === 'connected' ? 'operational' : 'degraded',
      firebase: firebaseStatus,
      propertiesCount: propertiesMsg,
      geminiEngine: 'Gemini 2.0 Flash',
      geminiKey: geminiStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint (webhook) para recibir mensajes desde GHL
app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { contactId, nombre, telefono, canal, mensaje, historial, type, source, direction } = req.body;
    
    // Identificación dinámica del canal (WA/IG)
    const normalizedChannel = (type || source || canal || 'sms').toLowerCase();
    const finalChannel = normalizedChannel.includes('whatsapp') ? 'whatsapp' : 
                         normalizedChannel.includes('instagram') ? 'instagram' : 'sms';
    
    // CORTOCIRCUITO: Solo procesar mensajes que vienen del Lead (inbound)
    // Si direction existe y no es 'inbound', o si el mensaje es del sistema, ignoramos.
    if (direction && direction !== 'inbound') {
      console.log(`⏭️ Ignorando mensaje saliente (outbound) de ${nombre || contactId} para evitar bucle.`);
      return res.json({ success: true, message: 'Mensaje saliente ignorado' });
    }

    console.log(`📥 Procesando mensaje entrante de ${nombre || contactId} canal: ${finalChannel}`);

    // Llamamos a la lógica del Agente de Ventas
    const resultado = await procesarMensajeSalesAgent({
      contactId,
      nombre,
      telefono,
      channel: finalChannel,
      mensaje,
      historial: historial || [],
      isAutomated: true // Nueva bandera para control de costes
    });

    // Devolver la respuesta en el formato JSON esperado
    res.json({
      respuesta: resultado.respuesta,
      clasificacion: resultado.clasificacion,
      siguientePaso: resultado.siguientePaso
    });

  } catch (error) {
    console.error('Error en el webhook /api/sales-agent/mensaje:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de Webhooks de RORA escuchando en el puerto ${PORT}`);
});
