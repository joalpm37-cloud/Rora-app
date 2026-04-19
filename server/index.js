import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { procesarMensajeSalesAgent } from './rora/agentes/sales-agent.js';
import { crearContactoGHL } from './rora/utils/ghl-api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); 
app.use(express.json());

// --- ENDPOINTS DE AGENTE DE VENTAS (WEBHOOK GHL) ---

app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { contactId, nombre, telefono, canal, mensaje, historial, type, source, direction } = req.body;
    
    // Identificación dinámica del canal (WA/IG)
    const normalizedChannel = (type || source || canal || 'sms').toLowerCase();
    const finalChannel = normalizedChannel.includes('whatsapp') ? 'whatsapp' : 
                         normalizedChannel.includes('instagram') ? 'instagram' : 'sms';
    
    // Filtro: Solo inbound
    if (direction && direction !== 'inbound') {
      return res.json({ success: true, message: 'Mensaje saliente ignorado' });
    }

    console.log(`📥 [Prod] Procesando mensaje de ${nombre || contactId} canal: ${finalChannel}`);

    const resultado = await procesarMensajeSalesAgent({
      contactId,
      nombre,
      telefono,
      channel: finalChannel,
      mensaje,
      historial: historial || []
    });

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// --- ENDPOINTS DE ORQUESTADOR RORA ---

app.post('/api/rora/chat', async (req, res) => {
  const { mensaje, sessionId, historial } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Mensaje es requerido' });

  try {
    console.log('🤖 RORA Orquestador (Prod) procesando...');
    const result = await procesarMensajeRora(mensaje, historial || []);
    res.json({
      success: true,
      reply: result.mensajeParaMostrar || '',
      accion: result.accion,
      datos: result.datos,
      sessionId: sessionId || `session_${Date.now()}`,
      version: 'V3.0.0-FLASH'
    });
  } catch (error) {
    console.error('Error en /api/rora/chat:', error);
    res.status(500).json({ error: 'Error procesando el mensaje', success: false });
  }
});

// --- DIAGNÓSTICO Y SALUD ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'V3.0.0-FLASH', message: 'RORA Backend is live and stable.' });
});

app.listen(PORT, () => {
  console.log(`🚀 RORA Server running on port ${PORT}`);
});
